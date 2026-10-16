"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthError, JwtPayload } from "@supabase/supabase-js";
import type { ChatMessage, ChatsTable, MediaType, MediaUpload } from "@/types/types";
import {
  getSupaChats,
  getSupaMessages,
  insertSupaChats,
  insertSupaMessages,
  supaUserDetails,
  supabase,
} from "@/lib/supabase";
import { supabaseMediaBucket } from "@/lib/supabaseMedia";
import { generateMusic } from "@/lib/musicGeneration";

const videoSizeLimit = 100 * 1024 * 1024;
const audioSizeLimit = 500 * 1024 * 1024;

function getMediaType(file: File): MediaType | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp3")) return "audio";
  if (name.endsWith(".mp4")) return "video";
  return null;
}

function getDefaultPrompt(mediaType: MediaType): string {
  return `Generate instrumental music inspired by this ${
    mediaType === "audio" ? "audio" : "video"
  }.`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useMusicChat() {
  const [prompt, setPrompt] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supaData, setSupaData] = useState<AuthError | JwtPayload | null>(null);
  const [supaChats, setSupaChats] = useState<ChatsTable[]>([]);
  const [isSupaLoading, setSupaLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChatData() {
      try {
        const userData = await supaUserDetails();
        const chats = await getSupaChats();
        if (cancelled) return;

        setSupaData(userData);
        setSupaChats(chats ?? []);
      } catch (error: unknown) {
        console.error("Could not load chat data:", getErrorMessage(error, "Unknown error."));
      } finally {
        if (!cancelled) setSupaLoading(false);
      }
    }

    void loadChatData();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadChat = useCallback(async (chatId: string) => {
    try {
      const rows = await getSupaMessages(chatId);
      setCurrentChat(chatId);
      setMessages(
        (rows ?? []).map((row) => ({
          id: row.id,
          role: row.role,
          content: row.content,
        })),
      );
    } catch (error: unknown) {
      console.error("Could not load chat messages:", getErrorMessage(error, "Unknown error."));
    }
  }, []);

  const handleMediaChange = useCallback((file: File | null) => {
    setMediaError(null);
    if (!file) {
      setMediaFile(null);
      return;
    }

    const mediaType = getMediaType(file);
    if (!mediaType) {
      setMediaFile(null);
      setMediaError("Please upload an MP4 video or MP3 audio file.");
      return;
    }

    const maxSize = mediaType === "audio" ? audioSizeLimit : videoSizeLimit;
    if (file.size > maxSize) {
      setMediaFile(null);
      setMediaError(
        mediaType === "audio"
          ? "MP3 audio files must be 500 MB or smaller."
          : "MP4 videos must be 100 MB or smaller.",
      );
      return;
    }

    const acceptedMimeTypes =
      mediaType === "audio"
        ? ["audio/mpeg", "audio/mp3", "audio/x-mp3"]
        : ["video/mp4"];
    if (file.type && !acceptedMimeTypes.includes(file.type.toLowerCase())) {
      setMediaFile(null);
      setMediaError(
        mediaType === "audio"
          ? "The selected file must be an MP3 audio file."
          : "The selected file must be an MP4 video.",
      );
      return;
    }

    setMediaFile(file);
  }, []);

  const uploadMedia = useCallback(
    async (file: File, type: MediaType): Promise<MediaUpload> => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("Sign in to upload media.");

      const extension = type === "audio" ? "mp3" : "mp4";
      const contentType = type === "audio" ? "audio/mpeg" : "video/mp4";
      const path = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;
      const storage = supabase.storage.from(supabaseMediaBucket);
      const { data: ticket, error: ticketError } =
        await storage.createSignedUploadUrl(path);
      if (ticketError) throw ticketError;

      const { error: uploadError } = await storage.uploadToSignedUrl(
        path,
        ticket.token,
        file,
        { contentType },
      );
      if (uploadError) throw uploadError;

      const { data: signedMedia, error: signedUrlError } =
        await storage.createSignedUrl(path, 60 * 60);
      if (signedUrlError) throw signedUrlError;

      return { path, url: signedMedia.signedUrl, type };
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if ((!prompt.trim() && !mediaFile) || isLoading) return;

    const mediaType = mediaFile ? getMediaType(mediaFile) : null;
    const userPrompt = prompt.trim() || (mediaType ? getDefaultPrompt(mediaType) : "");
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userPrompt,
      attachmentName: mediaFile?.name,
      attachmentType: mediaType ?? undefined,
    };
    const submittedMedia = mediaFile;

    setMessages((previous) => [...previous, userMessage]);
    setPrompt("");
    setMediaFile(null);
    setMediaError(null);
    setIsLoading(true);

    let chatId = currentChat;
    let uploadedMedia: MediaUpload | null = null;
    let retainUpload = false;

    try {
      if (!chatId) {
        const chats = await insertSupaChats(`New Chat ${supaChats.length + 1}`);
        const createdChat = chats?.[0];
        if (!createdChat?.id) {
          throw new Error("Could not create a chat.");
        }
        chatId = createdChat.id;
        setCurrentChat(chatId);
        setSupaChats((previous) => [...previous, createdChat]);
      }
      if (!chatId) {
        throw new Error("Could not determine the active chat.");
      }
      const activeChatId = chatId;
      await insertSupaMessages(userMessage, activeChatId);
      if (submittedMedia && mediaType) {
        uploadedMedia = await uploadMedia(submittedMedia, mediaType);
      }

      const result = await generateMusic(
        userPrompt,
        uploadedMedia?.url,
        uploadedMedia?.type,
      );
      retainUpload = result.pending && !!uploadedMedia;
      setMessages((previous) => [...previous, result.message]);

      try {
        await insertSupaMessages(result.message, activeChatId);
      } catch (error: unknown) {
        console.error(
          "Could not save the AI response:",
          getErrorMessage(error, "Unknown database error."),
        );
        setMessages((previous) => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "The response was generated but could not be saved.",
          },
        ]);
      }
    } catch (error: unknown) {
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${getErrorMessage(
            error,
            "Could not generate audio.",
          )}`,
        },
      ]);
    } finally {
      if (uploadedMedia && !retainUpload) {
        try {
          const { error } = await supabase.storage
            .from(supabaseMediaBucket)
            .remove([uploadedMedia.path]);
          if (error) {
            console.error("Could not remove uploaded media:", error.message);
          }
        } catch (error: unknown) {
          console.error(
            "Could not remove uploaded media:",
            getErrorMessage(error, "Unknown storage error."),
          );
        }
      }
      setIsLoading(false);
    }
  }, [currentChat, isLoading, mediaFile, prompt, supaChats.length, uploadMedia]);

  const startNewChat = useCallback(() => {
    setCurrentChat(null);
    setMessages([]);
    setPrompt("");
    setMediaFile(null);
    setMediaError(null);
  }, []);

  const continueChat = useCallback(
    (chatId: string | undefined) => {
      if (chatId) {
        void loadChat(chatId);
      } else {
        startNewChat();
      }
    },
    [loadChat, startNewChat],
  );

  return {
    prompt,
    setPrompt,
    mediaFile,
    mediaError,
    handleMediaChange,
    messages,
    isLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    supaData,
    supaChats,
    isSupaLoading,
    handleSubmit,
    startNewChat,
    continueChat,
  };
}
