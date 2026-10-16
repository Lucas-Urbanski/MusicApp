import type {
  ChatMessage,
  GenerationResponse,
  GeminiComposition,
  MediaType,
  SunoTaskStatus,
} from "@/types/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGeminiComposition(value: unknown): value is GeminiComposition {
  if (!isRecord(value)) return false;
  return (
    typeof value.title === "string" &&
    typeof value.keySignature === "string" &&
    typeof value.tempoBpm === "number" &&
    Array.isArray(value.chords) &&
    value.chords.every(
      (chord) =>
        isRecord(chord) &&
        typeof chord.chordName === "string" &&
        typeof chord.durationBars === "number",
    )
  );
}

async function requestProvider(
  endpoint: string,
  prompt: string,
  mediaUrl?: string,
  mediaType?: MediaType,
): Promise<GenerationResponse> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      ...(mediaUrl && mediaType ? { mediaUrl, mediaType } : {}),
    }),
  });
  const payload: unknown = await response.json();
  const result = isRecord(payload) ? payload : {};

  if (!response.ok) {
    throw new Error(
      typeof result.error === "string" ? result.error : "The AI request failed.",
    );
  }

  if (result.provider === "gemini" && isGeminiComposition(result.data)) {
    return { provider: "gemini", data: result.data };
  }
  if (result.provider === "suno" && typeof result.taskId === "string") {
    return { provider: "suno", taskId: result.taskId };
  }

  throw new Error("The AI returned an unexpected response.");
}

async function waitForSunoTask(taskId: string): Promise<SunoTaskStatus> {
  for (let attempt = 0; attempt < 60; attempt++) {
    const response = await fetch(
      `/api/suno?taskId=${encodeURIComponent(taskId)}`,
    );
    const payload: unknown = await response.json();
    const result = isRecord(payload) ? payload : {};

    if (!response.ok) {
      throw new Error(
        typeof result.error === "string"
          ? result.error
          : "Could not check Suno generation status.",
      );
    }

    const status =
      typeof result.status === "string" ? result.status : "PENDING";
    if (status === "SUCCESS" || status === "FIRST_SUCCESS") {
      if (typeof result.audioUrl !== "string") {
        throw new Error("Suno completed without returning an audio track.");
      }
      return {
        status,
        audioUrl: result.audioUrl,
        title: typeof result.title === "string" ? result.title : undefined,
      };
    }
    if (
      [
        "CREATE_TASK_FAILED",
        "GENERATE_AUDIO_FAILED",
        "CALLBACK_EXCEPTION",
        "SENSITIVE_WORD_ERROR",
      ].includes(status)
    ) {
      throw new Error(`Suno generation failed (${status}).`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return { status: "PENDING" };
}

function formatComposition(
  composition: GeminiComposition,
  prefix: string,
): string {
  const chords = composition.chords
    .map(
      (chord) =>
        `${chord.chordName} (${chord.durationBars} ${
          chord.durationBars === 1 ? "bar" : "bars"
        })`,
    )
    .join(", ");
  return `${prefix}${composition.title}\nKey: ${
    composition.keySignature
  }\nTempo: ${composition.tempoBpm} BPM\nChords: ${chords}`;
}

async function runGemini(
  prompt: string,
  mediaUrl?: string,
  mediaType?: MediaType,
): Promise<ChatMessage> {
  const result = await requestProvider(
    "/api/gemini",
    prompt,
    mediaUrl,
    mediaType,
  );
  if (result.provider !== "gemini") {
    throw new Error("Gemini returned an unexpected provider.");
  }
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: formatComposition(result.data, "Gemini composition: "),
  };
}

async function runSuno(
  prompt: string,
  mediaUrl?: string,
  mediaType?: MediaType,
): Promise<{ message: ChatMessage; pending: boolean }> {
  const result = await requestProvider("/api/suno", prompt, mediaUrl, mediaType);
  if (result.provider !== "suno") {
    throw new Error("Suno returned an unexpected provider.");
  }

  const task = await waitForSunoTask(result.taskId);
  return {
    pending: task.status === "PENDING",
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        task.status === "PENDING"
          ? `Suno is still generating your track. Task ID: ${result.taskId}`
          : task.title || "Track generated successfully!",
      audioUrl: task.audioUrl,
    },
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function generateMusic(
  prompt: string,
  mediaUrl?: string,
  mediaType?: MediaType,
): Promise<{ message: ChatMessage; pending: boolean }> {
  const preferredProvider = mediaUrl ? "suno" : "gemini";
  const fallbackProvider = mediaUrl ? "gemini" : "suno";

  try {
    if (preferredProvider === "gemini") {
      return { message: await runGemini(prompt), pending: false };
    }
    return await runSuno(prompt, mediaUrl, mediaType);
  } catch (primaryError: unknown) {
    try {
      if (fallbackProvider === "gemini") {
        const message = await runGemini(prompt, mediaUrl, mediaType);
        return {
          message: {
            ...message,
            content: `Fallback: ${message.content}`,
          },
          pending: false,
        };
      }
      const fallback = await runSuno(prompt);
      return {
        message: {
          ...fallback.message,
          content: `Fallback: ${fallback.message.content}`,
        },
        pending: fallback.pending,
      };
    } catch (fallbackError: unknown) {
      throw new Error(
        `${preferredProvider} failed: ${getErrorMessage(
          primaryError,
          "The preferred AI failed.",
        )} ${fallbackProvider} fallback failed: ${getErrorMessage(
          fallbackError,
          "The backup AI failed.",
        )}`,
      );
    }
  }
}
