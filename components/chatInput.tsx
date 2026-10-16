"use client";

import React, { useRef } from "react";
import { Paperclip, Send, X } from "lucide-react";
import type { ChatInputProps } from "@/types/types";

export const ChatInput: React.FC<ChatInputProps> = ({
  prompt,
  onChange,
  onSubmit,
  mediaFile,
  onMediaChange,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl px-6 pb-8 pt-2">
      {mediaFile && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-gray-700 bg-[#1e1f20] px-3 py-2 text-sm text-gray-300">
          <span className="truncate">{mediaFile.name}</span>
          <button
            type="button"
            onClick={() => onMediaChange(null)}
            disabled={isLoading}
            className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            aria-label="Remove uploaded media"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="relative bg-[#1e1f20] rounded-full flex items-center px-4 py-3 focus-within:bg-[#282a2c] transition-colors border border-gray-800 focus-within:border-gray-600 shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,.mp4,audio/mpeg,.mp3"
          className="hidden"
          onChange={(event) => {
            onMediaChange(event.target.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-200 transition rounded-full hover:bg-gray-700/50 disabled:opacity-50"
          aria-label="Upload an MP4 or MP3 file"
          title="Upload an MP4 or MP3 file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a prompt here (e.g. Baroque harpsichord fugue in D minor)"
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-400 px-4 text-base disabled:opacity-50"
        />

        {(prompt.trim().length > 0 || mediaFile) && (
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="p-2 text-blue-400 hover:text-blue-300 transition rounded-full hover:bg-blue-900/30 disabled:opacity-50"
            aria-label="Send prompt"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-gray-500">
        Text prompts use Gemini. Upload MP4 or MP3 media to use Suno.
      </p>
      <p className="text-center text-xs text-gray-500 mt-3 font-normal">
        Motif AI can make mistakes. Verify the music before using it.
      </p>
    </div>
  );
};
