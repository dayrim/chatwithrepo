import { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosResponse } from "axios";
import { createClient } from "@/shared/BackendClient";
import { Readable } from "stream";
import { GenerateContentResponse } from "@google/generative-ai";

interface HistoryEntry {
  role: string;
  text: string;
}

interface RequestBody {
  history: HistoryEntry[];
  message: string;
  userId: string;
  chatSessionId: string;
}

interface ApiResponse {
  text: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Received request:", req.method, req.body); // Log the request method and body

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    history,
    message: initialMessage,
    userId,
    chatSessionId,
  } = req.body as RequestBody;
  const client = createClient(userId);
  console.log("Processing messages for userId:", userId); // Log the userId

  // Add the initial message to history as a user message
  history.push({ role: "user", text: initialMessage });

  const alternatingHistory = ensureAlternatingHistory(history);

  try {
    console.log("Creating an empty message");
    const createdMessage = await client.service("messages").create({
      userId,
      chatSessionId,
      text: "",
      role: "model",
    });
    const messageId = createdMessage.id as string;
    console.log("Created message ID:", messageId);

    console.log("Initializing Google Generative AI with model: gemini-pro");
    const API_KEY = process.env.GEMINI_API_KEY || "";
    const payload = {
      contents: alternatingHistory.map((entry) => ({
        role: entry.role,
        parts: [{ text: entry.text }],
      })),
    };
    console.log("Payload:", JSON.stringify(payload));

    const streamResponse = await axios({
      method: "post",
      url: `https://gemini.chatwithrepo.net/v1beta/models/gemini-pro:streamGenerateContent?key=${API_KEY}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(payload),
      responseType: "stream",
    });

    let buffer = "";
    let text = "";

    const stream = streamResponse.data as Readable;
    // Using an async iterator to process chunks as they arrive
    for await (const chunk of stream) {
      console.log(`Chunk received at: ${new Date().toISOString()}`);

      buffer += chunk.toString();

      // Simple extraction of "text" values and await inside the loop
      let match;
      const regex = /"text":\s*"((?:\\.|[^\"])*)"/g;
      while ((match = regex.exec(buffer)) !== null) {
        const extractedText = match[1].replace(/\\n/g, "\n");
        console.log("Extracted text:", extractedText);
        text += extractedText;
        
        await client.service("messages").patch(messageId, { text });
      }

      // Remove processed part from buffer
      const lastIndexOfText = buffer.lastIndexOf('"text":');
      if (lastIndexOfText !== -1) {
        buffer = buffer.substring(lastIndexOfText);
      }
    }

    // Finalization after the stream ends
    res.status(200).json({ message: "Stream processing completed" });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
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
