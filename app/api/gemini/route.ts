import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { isSupabaseMediaUrl } from "@/lib/supabaseMedia";

export const runtime = "nodejs";
export const maxDuration = 300;

const videoSizeLimit = 100 * 1024 * 1024;
const audioSizeLimit = 500 * 1024 * 1024;

async function getRequestData(request: Request) {
  const body: unknown = await request.json();
  if (typeof body !== "object" || body === null) {
    return { prompt: "", mediaUrl: "", mediaType: "" };
  }
  const record = body as Record<string, unknown>;
  return {
    prompt: typeof record.prompt === "string" ? record.prompt.trim() : "",
    mediaUrl: typeof record.mediaUrl === "string" ? record.mediaUrl : "",
    mediaType: typeof record.mediaType === "string" ? record.mediaType : "",
  };
}

export async function POST(request: Request) {
  let ai: GoogleGenAI | undefined;
  let uploadedFileName: string | undefined;
  let temporaryFilePath: string | undefined;

  try {
    const { prompt, mediaUrl, mediaType } = await getRequestData(request);
    if (!prompt && !mediaUrl) {
      return NextResponse.json(
        { error: "A prompt or MP4/MP3 attachment is required." },
        { status: 400 },
      );
    }

    let mediaFilePath: string | undefined;
    let mimeType: "video/mp4" | "audio/mpeg" | undefined;
    if (mediaUrl) {
      if (!isSupabaseMediaUrl(mediaUrl)) {
        return NextResponse.json(
          { error: "The attachment URL must be a signed MP4/MP3 URL from this app's storage." },
          { status: 400 },
        );
      }
      if (mediaType !== "audio" && mediaType !== "video") {
        return NextResponse.json(
          { error: "The attachment type must be audio or video." },
          { status: 400 },
        );
      }
      const mediaUrlPath = new URL(mediaUrl).pathname.toLowerCase();
      const isAudio = mediaUrlPath.endsWith(".mp3");
      if ((isAudio && mediaType !== "audio") || (!isAudio && mediaType !== "video")) {
        return NextResponse.json(
          { error: "The attachment type does not match its file format." },
          { status: 400 },
        );
      }
      mimeType = isAudio ? "audio/mpeg" : "video/mp4";
      const sizeLimit = isAudio ? audioSizeLimit : videoSizeLimit;
      const mediaResponse = await fetch(mediaUrl);
      if (!mediaResponse.ok || !mediaResponse.body) {
        throw new Error("Gemini could not retrieve the uploaded attachment.");
      }
      const contentLength = Number(mediaResponse.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > sizeLimit) {
        return NextResponse.json(
          {
            error: isAudio
              ? "MP3 files must be 500 MB or smaller."
              : "MP4 videos must be 100 MB or smaller.",
          },
          { status: 413 },
        );
      }
      const responseMimeType = mediaResponse.headers.get("content-type");
      if (
        responseMimeType &&
        !responseMimeType.toLowerCase().startsWith(mimeType)
      ) {
        throw new Error("The uploaded attachment MIME type does not match its format.");
      }
      temporaryFilePath = join(tmpdir(), `${randomUUID()}${extname(mediaUrlPath)}`);
      let totalBytes = 0;
      const byteLimit = sizeLimit;
      const sizeGuard = new Transform({
        transform(chunk: Buffer, _encoding, callback) {
          totalBytes += chunk.length;
          if (totalBytes > byteLimit) {
            callback(
              new Error(
                isAudio
                  ? "MP3 files must be 500 MB or smaller."
                  : "MP4 videos must be 100 MB or smaller.",
              ),
            );
            return;
          }
          callback(null, chunk);
        },
      });
      await pipeline(
        Readable.fromWeb(mediaResponse.body as NodeReadableStream<Uint8Array>),
        sizeGuard,
        createWriteStream(temporaryFilePath),
      );
      mediaFilePath = temporaryFilePath;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }
    ai = new GoogleGenAI({ apiKey });

    const contents: {
      role: "user";
      parts: (
        | { text: string }
        | { fileData: { fileUri: string; mimeType: string } }
      )[];
    } = {
      role: "user",
      parts: [
        {
          text: mediaFilePath
            ? `${
                prompt ||
                `Create instrumental music inspired by this ${
                  mediaType === "audio" ? "audio" : "video"
                }.`
              }\nAnalyze the uploaded ${
                mediaType === "audio" ? "audio" : "video"
              } and produce a musical composition plan inspired by its content.`
            : `Create a musical composition plan for this request: ${prompt}`,
        },
      ],
    };

    if (mediaFilePath && mimeType) {
      const uploadedFile = await ai.files.upload({
        file: mediaFilePath,
        config: { mimeType },
      });
      uploadedFileName = uploadedFile.name;

      if (!uploadedFileName) {
        throw new Error("Gemini did not return an uploaded video file name.");
      }

      let file = uploadedFile;
      for (let attempt = 0; file.state === "PROCESSING" && attempt < 60; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        file = await ai.files.get({ name: uploadedFileName });
      }

      if (file.state !== "ACTIVE" || !file.uri) {
        throw new Error(
          `Gemini could not process the uploaded video (state: ${
            file.state ?? "unknown"
          }).`,
        );
      }

      contents.parts.push({
        fileData: { fileUri: file.uri, mimeType: file.mimeType ?? mimeType },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Title of the composition",
            },
            keySignature: {
              type: Type.STRING,
              description: "Musical key signature",
            },
            tempoBpm: {
              type: Type.INTEGER,
              description: "Tempo in beats per minute",
            },
            chords: {
              type: Type.ARRAY,
              description: "Chord progression steps",
              items: {
                type: Type.OBJECT,
                properties: {
                  chordName: { type: Type.STRING },
                  durationBars: { type: Type.NUMBER },
                },
                required: ["chordName", "durationBars"],
              },
            },
          },
          required: ["title", "keySignature", "tempoBpm", "chords"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty composition.");
    }

    const data: unknown = JSON.parse(response.text);
    return NextResponse.json({ success: true, provider: "gemini", data });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gemini request failed.";
    console.error("Gemini API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (ai && uploadedFileName) {
      try {
        await ai.files.delete({ name: uploadedFileName });
      } catch (error: unknown) {
        console.error(
          "Gemini uploaded-file cleanup failed:",
          error instanceof Error ? error.message : "Unknown cleanup error.",
        );
      }
    }
    if (temporaryFilePath) {
      try {
        await rm(temporaryFilePath, { force: true });
      } catch (error: unknown) {
        console.error(
          "Gemini temporary-file cleanup failed:",
          error instanceof Error ? error.message : "Unknown cleanup error.",
        );
      }
    }
  }
}
