import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/shared/BackendClient"; // Ensure this is correctly pointing to your FeathersJS client setup

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Received request:", req.method, req.body); // Log the request method and body

  if (req.method !== "POST") {
    console.log("Request method not allowed");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { history, message: initialMessage, userId, chatSessionId } = req.body;
  const client = createClient(userId);

  console.log("Processing messages for userId:", userId); // Log the userId and initial setup

  try {
    console.log("Creating an empty message");
    const createdMessage = await client.service("messages").create({
      userId,
      chatSessionId,
      text: "",
      role: "model",
    });
    const messageId = createdMessage.id; // Log the created message ID
    console.log("Created message ID:", messageId);

    console.log("Initializing Google Generative AI with model: gemini-pro");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const alternatingHistory = ensureAlternatingHistory(history);

    const geminiHistory = alternatingHistory.map(({ role, text }: any) => ({
      role,
      parts: text,
    }));
    console.log("Chat history for streaming:", geminiHistory);
    const chat = model.startChat({ history: geminiHistory });

    console.log(
      "Starting message stream with initial message:",
      initialMessage
    );
    const result = await chat.sendMessageStream(initialMessage);

    let text = "";
    for await (const chunk of result.stream) {
      const chunkText = await chunk.text();
      console.log("Received chunk:", chunkText);
      text += chunkText;
      // Update the message with new chunk
      console.log(`Updating message ID ${messageId} with new chunk.`);
      await client.service("messages").patch(messageId, { text });
    }

    console.log("Completed streaming. Final message text:", text);
    res.status(200).json({ message: text });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
}

function ensureAlternatingHistory(history: any) {
  const alternatingHistory: any[] = [];
  let lastRole = "model"; // Assume the last message was from the model

  history.forEach((message: any, index: number) => {
    if (index === 0 || message.role !== lastRole) {
      alternatingHistory.push(message);
      lastRole = message.role; // Update lastRole to the current message's role
    } else {
      // If the current message's role is the same as the last message's role,
      // insert a filler message with the opposite role
      const fillerMessage = {
        userId: message.userId,
        text: "...", // Placeholder text or some logic to generate appropriate text
        role: lastRole === "user" ? "model" : "user",
      };
      alternatingHistory.push(fillerMessage);
      alternatingHistory.push(message);
      lastRole = message.role; // Update lastRole to the current message's role
    }
  });

  return alternatingHistory;
}
