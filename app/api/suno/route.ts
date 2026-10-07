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
        { error: "SUNO_API_KEY is not configured on the server" },
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

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`Suno API returned HTML (Status ${response.status}):\n`, responseText);
      throw new Error(`Suno API failed (Status ${response.status}). Check server logs for the HTML payload.`);
    }

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