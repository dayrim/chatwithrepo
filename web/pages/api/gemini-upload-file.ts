import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

export interface UploadResponse {
  file: {
    name: string;
    displayName: string;
    mimeType: string;
    sizeBytes: string;
    createTime: string;
    updateTime: string;
    expirationTime: string;
    sha256Hash: string;
    uri: string;
  };
}

interface Error {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse | Error>
) {
  console.log("Received request for /api/uploadToGenAI");

  if (req.method !== "POST") {
    console.log(
      "Request method is not POST, returning 405 Method Not Allowed."
    );
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { displayName, fileContent } = req.body;
  try {
    const file = await uploadToGenAI(fileContent, displayName);
    return res.status(200).json(file);
  } catch (error) {
    console.error("Failed to upload file to GenAI:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function uploadToGenAI(content: string = "", displayName: string) {
  const fileContent = content || " ";
  console.log(
    `Received file with displayName: ${displayName} length: ${fileContent.length} bytes`
  );

  if (!displayName) {
    throw new Error("Missing displayName or fileContent");
  }

  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const BASE_URL = "https://generativelanguage.googleapis.com/";
  const CHUNK_SIZE = 8388608; // 8 MiB

  // Initial resumable request to get the upload URL
  const numBytes = new TextEncoder().encode(fileContent).length;
  console.log(`Starting upload of data to ${BASE_URL}...`);
  console.log(`  Size: ${numBytes} bytes`);

  // Initial resumable upload request to get the upload URL
  const initResponse = await fetch(
    `${BASE_URL}/upload/v1beta/files?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": numBytes.toString(),
        "X-Goog-Upload-Header-Content-Type": "text/plain",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { display_name: displayName } }),
    }
  );

  const initialUploadUrl = initResponse.headers.get("X-Goog-Upload-URL");

  if (!initialUploadUrl) {
    console.log("Failed initial resumable upload request.");
    return;
  }

  const parsedUrl = new URL(initialUploadUrl);
  parsedUrl.hostname = "gemini.chatwithrepo.net";
  const modifiedUploadUrl = parsedUrl.toString();

  console.log("Modified Upload URL:", modifiedUploadUrl);

  let offset = 0;
  let lastChunkResponse = null;
  while (offset < fileContent.length) {
    const chunk = fileContent.substring(offset, offset + CHUNK_SIZE);
    const isLastChunk = offset + CHUNK_SIZE >= fileContent.length;
    const uploadCommand = isLastChunk ? "upload, finalize" : "upload";
    const chunkBytes = new TextEncoder().encode(chunk).length;

    const chunkResponse = await fetch(modifiedUploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": chunkBytes.toString(),
        "X-Goog-Upload-Offset": offset.toString(),
        "X-Goog-Upload-Command": uploadCommand,
      },
      body: chunk,
    });

    if (!chunkResponse.ok) {
      throw new Error(`Failed to upload chunk at offset ${offset}`);
    }

    if (isLastChunk) {
      lastChunkResponse = await chunkResponse.json();
    }

    offset += chunk.length;
  }

  console.log("Upload complete!");
  console.log("Response:", lastChunkResponse);
  if (!lastChunkResponse) {
    throw new Error(`File was not uploaded successfully`);
  }
  return lastChunkResponse;
}
