"use client";

import { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import { ChatMessage } from "@/types/chat";
import { Sidebar } from "../components/sidebar";
import { WelcomeHero } from "../components/welcomeHero";
import { ChatBubble } from "../components/chatMassage";
import { ChatInput } from "../components/chatInput";

export default function MusicChat() {
  const [prompt, setPrompt] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    const userPrompt = prompt.trim();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userPrompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("../api/suno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate music.");
      }

      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "Track generated successfully!",
        audioUrl: data.audioUrl,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${err.message || "Could not generate audio."}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setPrompt("");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen w-full bg-[#131314] text-gray-100 font-sans overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={startNewChat}
      />

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
                <ChatBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-[#1e1f20] text-gray-400 rounded-bl-sm border border-gray-800 flex items-center gap-2">
                    <span className="text-xs mr-2">Generating audio...</span>
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
          <WelcomeHero userName="Your Mom" />
        )}

        <ChatInput
          prompt={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
