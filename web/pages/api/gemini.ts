import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/shared/BackendClient";
export const config = {
  // Disable the default body parser
  api: {
    bodyParser: false,
  },
};
interface HistoryEntry {
  role: string;
  text: string;
}
interface GoogleFileLink {
  fileUrl: string;
}
export type RequestBody = {
  history: HistoryEntry[];
  files: GoogleFileLink[];
  message: string;
  userId: string;
  chatSessionId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Received request:", req.method, req.body); // Log the request method and body

  const body = await parseBody(req);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    // Finalization after the stream ends
    await generateContent(body);
    res.status(200).json({ message: "Stream processing completed" });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
}
export async function generateContent(body: RequestBody) {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const {
    history,
    message: initialMessage,
    userId,
    files,
    chatSessionId,
  } = body as RequestBody;
  const client = createClient(userId);
  console.log("Processing messages for userId:", userId); // Log the userId

  // Add the initial message to history as a user message
  history.push({ role: "user", text: initialMessage });

  const alternatingHistory = ensureAlternatingHistory(history);

  const createdMessage = await client.service("messages").create({
    userId,
    chatSessionId,
    text: "",
    role: "model",
  });
  const messageId = createdMessage.id as string;

  const payload = {
    contents: alternatingHistory.map((entry, index) => {
      const result = {
        role: entry.role,
        parts: [
          { text: entry.text },
          index === alternatingHistory.length - 1
            ? files.map(({ fileUrl }) => ({
                file_data: { file_uri: fileUrl, mime_type: "text/plain" },
              }))
            : [],
        ],
      };

      return result;
    }),
  };
  console.log("Payload:", JSON.stringify(payload));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:streamGenerateContent?alt=sse&key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.body) {
    throw new Error("Failed to get readable stream");
  }

  let reader = response.body.getReader();
  let decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    const chunk = decoder.decode(value, { stream: true });
    console.log(`Chunk received: ${new Date().toISOString()}`);
    let match;
    const regex = /"text":\s*"((?:\\.|[^\"])*)"/g;
    while ((match = regex.exec(chunk)) !== null) {
      const extractedText = match[1].replace(/\\n/g, "\n");
      console.log("Extracted text:", extractedText);
      text += extractedText;
      await client.service("messages").patch(messageId, { text });
    }
  }
}
function ensureAlternatingHistory(history: HistoryEntry[]): HistoryEntry[] {
  const alternatingHistory: HistoryEntry[] = [];
  let lastRole = "model"; // Assume the last message was from the model

  history.forEach((message, index) => {
    if (index === 0 || message.role !== lastRole) {
      alternatingHistory.push(message);
      lastRole = message.role; // Update lastRole to the current message's role
    } else {
      // Insert a filler message with the opposite role
      const fillerMessage: HistoryEntry = {
        text: "...",
        role: lastRole === "user" ? "model" : "user",
      };
      alternatingHistory.push(fillerMessage);
      alternatingHistory.push(message);
      lastRole = message.role;
    }
  });

  return alternatingHistory;
}

async function parseBody(req: NextApiRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let rawData = "";
    req.on("data", (chunk) => {
      rawData += chunk;
      // Optional: Add checks here to reject the promise if the size exceeds your limit
    });
    req.on("end", () => {
      try {
        // Assuming JSON content, adjust if needed
        const parsedData = JSON.parse(rawData);
        resolve(parsedData);
      } catch (error) {
        reject(new Error("Error parsing JSON body"));
      }
    });
    req.on("error", (error) => reject(error));
  });
}
