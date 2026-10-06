"use client";

import React from "react";
import { Music, Send } from "lucide-react";

interface ChatInputProps {
  prompt: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  prompt,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl px-6 pb-8 pt-2">
      <div className="relative bg-[#1e1f20] rounded-full flex items-center px-4 py-3 focus-within:bg-[#282a2c] transition-colors border border-gray-800 focus-within:border-gray-600 shadow-sm">
        <button className="p-2 text-gray-400 hover:text-gray-200 transition rounded-full hover:bg-gray-700/50">
          <Music className="w-5 h-5" />
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

        {prompt.trim().length > 0 && (
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
      <p className="text-center text-xs text-gray-500 mt-3 font-normal">
        Contrapunctus AI can make mistakes. Verify the music before using it.
      </p>
    </div>
  );
};
