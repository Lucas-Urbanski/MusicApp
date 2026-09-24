"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, Send, Music, Plus } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function MusicChat() {
  const [prompt, setPrompt] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Cords: CEA, ADF, BDG, CEA.",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setPrompt("");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen w-full bg-[#131314] text-gray-100 font-sans overflow-hidden">
      <aside
        className={`${
          isSidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 ease-in-out flex-shrink-0 bg-[#1e1f20] overflow-hidden flex flex-col`}
      >
        <div className="w-72 h-full flex flex-col p-4">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-200 transition rounded-full hover:bg-gray-700/50"
              aria-label="Close menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center gap-3 bg-[#131314] hover:bg-gray-800 transition-colors rounded-full px-4 py-2.5 text-sm font-medium mb-6 w-fit text-gray-200 border border-gray-700"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-500 mb-3 px-2">
              Recent
            </p>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col items-center justify-between relative h-full transition-all duration-300">
        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-200 transition rounded-full hover:bg-gray-700/50"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

        {hasMessages ? (
          <div className="w-full max-w-3xl flex-1 overflow-y-auto px-6 pt-24 pb-4">
            <div className="flex flex-col gap-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-[#1e1f20] text-gray-100 rounded-bl-sm border border-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-[#1e1f20] text-gray-400 rounded-bl-sm border border-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-.3s]" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-.5s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mt-24 px-6 flex flex-col items-start justify-center flex-1">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">
                Hello, Munition
              </span>
            </h1>
            <p className="text-4xl sm:text-5xl font-medium text-[#444746]">
              What sound are you looking for?
            </p>
          </div>
        )}

        <div className="w-full max-w-3xl px-6 pb-8 pt-2">
          <div className="relative bg-[#1e1f20] rounded-full flex items-center px-4 py-3 focus-within:bg-[#282a2c] transition-colors border border-gray-800 focus-within:border-gray-600 shadow-sm">
            <button className="p-2 text-gray-400 hover:text-gray-200 transition rounded-full hover:bg-gray-700/50">
              <Music className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleEnterPress}
              placeholder="Enter a prompt here"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-400 px-4 text-base disabled:opacity-50"
            />

            {prompt.trim().length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="p-2 text-blue-400 hover:text-blue-300 transition rounded-full hover:bg-blue-900/30 disabled:opacity-50"
                aria-label="Send prompt"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-center text-xs text-gray-500 mt-3 font-normal">
            Music AI can make mistakes. Verify the music before using it.
          </p>
        </div>
      </main>
    </div>
  );
}
