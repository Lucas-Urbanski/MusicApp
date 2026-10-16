import { NextResponse } from "next/server";
import { isSupabaseMediaUrl } from "@/lib/supabaseMedia";

export const runtime = "nodejs";
export const maxDuration = 300;

const sunoApiBaseUrl = "https://api.sunoapi.org";

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Suno API returned an invalid response (HTTP ${response.status}).`);
  }
}

function getMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (typeof record.msg === "string") return record.msg;
    if (typeof record.error === "string") return record.error;
  }
  return fallback;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.SUNO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SUNO_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const body: unknown = await request.json();
    let prompt = "";
    let mediaUrl = "";
    let mediaType = "";
    if (typeof body === "object" && body !== null) {
      const bodyRecord = body as Record<string, unknown>;
      prompt =
        typeof bodyRecord.prompt === "string" ? bodyRecord.prompt.trim() : "";
      mediaUrl =
        typeof bodyRecord.mediaUrl === "string" ? bodyRecord.mediaUrl : "";
      mediaType =
        typeof bodyRecord.mediaType === "string" ? bodyRecord.mediaType : "";
    }

    if (!prompt && !mediaUrl) {
      return NextResponse.json(
        { error: "A prompt or MP4/MP3 attachment is required." },
        { status: 400 },
      );
    }

    if (
      mediaUrl &&
      (!isSupabaseMediaUrl(mediaUrl) ||
        (mediaType !== "audio" && mediaType !== "video"))
    ) {
      return NextResponse.json(
        { error: "The attachment must be a signed MP4 or MP3 URL from this app's storage." },
        { status: 400 },
      );
    }
    if (mediaUrl) {
      const isAudioFile = new URL(mediaUrl).pathname.toLowerCase().endsWith(".mp3");
      if ((isAudioFile && mediaType !== "audio") || (!isAudioFile && mediaType !== "video")) {
        return NextResponse.json(
          { error: "The attachment type does not match its file format." },
          { status: 400 },
        );
      }
    }

    const generateResponse = await fetch(
      `${sunoApiBaseUrl}/api/v1/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customMode: false,
          instrumental: true,
          model: "V6",
          prompt:
            prompt ||
            `Generate instrumental music inspired by this ${
              mediaType === "audio" ? "audio" : "video"
            }.`,
          ...(mediaUrl && mediaType === "video"
            ? { videoUrls: [mediaUrl] }
            : {}),
          ...(mediaUrl && mediaType === "audio"
            ? { audioUrls: [mediaUrl] }
            : {}),
          callBackUrl: "https://musicapp-lime.vercel.app/api/suno-webhook",
        }),
      },
    );
    const generateResult = await parseJson(generateResponse);
    if (!generateResponse.ok) {
      throw new Error(getMessage(generateResult, "Suno could not start generation."));
    }

    const resultRecord =
      typeof generateResult === "object" && generateResult !== null
        ? (generateResult as Record<string, unknown>)
        : {};
    const resultData =
      typeof resultRecord.data === "object" && resultRecord.data !== null
        ? (resultRecord.data as Record<string, unknown>)
        : {};
    if (resultRecord.code !== 200 || typeof resultData.taskId !== "string") {
      throw new Error(
        getMessage(generateResult, "Suno did not return a generation task."),
      );
    }

    return NextResponse.json({
      success: true,
      provider: "suno",
      taskId: resultData.taskId,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Suno request failed.";
    console.error("Suno API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const taskId = new URL(request.url).searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json(
      { error: "taskId query parameter is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "SUNO_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${sunoApiBaseUrl}/api/v1/generate/record-info?taskId=${encodeURIComponent(
        taskId,
      )}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    const payload = await parseJson(response);
    if (!response.ok) {
      throw new Error(getMessage(payload, "Could not retrieve Suno task status."));
    }

    const record =
      typeof payload === "object" && payload !== null
        ? (payload as Record<string, unknown>)
        : {};
    if (record.code !== 200) {
      throw new Error(getMessage(payload, "Could not retrieve Suno task status."));
    }
    const data =
      typeof record.data === "object" && record.data !== null
        ? (record.data as Record<string, unknown>)
        : {};
    const responseData =
      typeof data.response === "object" && data.response !== null
        ? (data.response as Record<string, unknown>)
        : {};
    const tracks = Array.isArray(responseData.sunoData)
      ? responseData.sunoData
      : [];
    const firstTrack =
      typeof tracks[0] === "object" && tracks[0] !== null
        ? (tracks[0] as Record<string, unknown>)
        : {};

    return NextResponse.json({
      status: typeof data.status === "string" ? data.status : "PENDING",
      audioUrl:
        typeof firstTrack.audio_url === "string"
          ? firstTrack.audio_url
          : typeof firstTrack.stream_audio_url === "string"
            ? firstTrack.stream_audio_url
            : undefined,
      title: typeof firstTrack.title === "string" ? firstTrack.title : undefined,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not retrieve Suno task status.";
    console.error("Suno status API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
