import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.SUNO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SUNO_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.sunoapi.org/api/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customMode: false,
        instrumental: true,
        model: "V6",
        prompt: prompt,
        callBackUrl: "https://musicapp-lime.vercel.app/api/suno-webhook",
      }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== 200) {
      throw new Error(data.msg || "Failed to initiate music generation");
    }

    const taskId = data.data?.taskId;

    return NextResponse.json({
      message: "Music generation started successfully!",
      taskId: taskId,
      status: "processing",
    });
  } catch (error: any) {
    console.error("Suno API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
