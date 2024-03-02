// Import necessary modules
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure environment variables are loaded
// dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Request method:", req.method); // Log the request method

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body;
  console.log("Request body:", body); // Log the request body to see what is being received

  // Assuming `messages` is structured for Gemini usage
  const messages =
    body?.messages?.map((message: any) => ({
      role: message.role,
      parts: [message.content].filter(
        (part) => part != null && part.trim() !== ""
      ), // Filter out null or empty strings
    })) || [];
  const msg = body?.message || "How many paws are in my house?";

  console.log("Messages for Gemini:", messages); // Log the messages array
  console.log("Message to send:", msg); // Log the message to be sent

  try {
    console.log("API Key:", process.env.GEMINI_API_KEY); // Check if API Key is correctly loaded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Model loaded:", model); // Verify that the model is loaded

    const chat = model.startChat({
      history: messages,
    });

    console.log("Chat session started:", chat); // Verify that the chat session is started

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = await response.text();

    console.log("Generated text:", text); // Log the generated text

    // Respond with the generated message
    res.status(200).json({ message: text });
  } catch (error) {
    console.error("Error in handler:", error); // Log detailed error information
    res.status(500).json({
      error:
        "An error occurred during the request to Google Generative AI. Please try again.",
    });
  }
}
