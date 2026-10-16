"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, User } from "lucide-react";
import type { ChatMessage, MusicChatViewProps } from "@/types/types";
import { ChatBubble } from "@/components/chatMessage";
import { ChatInput } from "@/components/chatInput";
import { Sidebar } from "@/components/sidebar";
import { WelcomeHero } from "@/components/welcomeHero";

export function MusicChatView({
  prompt,
  onPromptChange,
  mediaFile,
  mediaError,
  onMediaChange,
  messages,
  isLoading,
  isSidebarOpen,
  onSidebarChange,
  userName,
  chats,
  isSupaLoading,
  onSubmit,
  onNewChat,
  onSelectChat,
}: MusicChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isSupaLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#131314] font-sans text-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => onSidebarChange(false)}
        onNewChat={onNewChat}
        onOldChat={onSelectChat}
        allChats={chats}
      />
      <div className="absolute right-4 top-4 z-10">
        <Link
          href="/settings"
          className="flex h-10 items-center justify-right gap-2 rounded-xl border border-zinc-300 bg-white px-4 font-bold text-zinc-800 transition hover:bg-zinc-50"
        >
          Profile
          <User size={20} className="transition-transform hover:rotate-45" />
        </Link>
      </div>

      <main className="relative flex h-full flex-1 flex-col items-center justify-between transition-all duration-300">
        {!isSidebarOpen && (
          <div className="absolute left-4 top-4 z-10">
            <button
              onClick={() => onSidebarChange(true)}
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-700/50 hover:text-gray-200"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}

        {messages.length > 0 ? (
          <div className="w-full max-w-3xl flex-1 overflow-y-auto px-6 pb-4 pt-24">
            <div className="flex flex-col gap-6">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-800 bg-[#1e1f20] px-5 py-4 text-gray-400">
                    <span className="mr-2 text-xs">Generating audio...</span>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-.5s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          <WelcomeHero userName={userName} />
        )}

        <ChatInput
          prompt={prompt}
          onChange={onPromptChange}
          onSubmit={onSubmit}
          mediaFile={mediaFile}
          onMediaChange={onMediaChange}
          isLoading={isLoading}
        />
        {mediaError && (
          <p className="pb-2 text-sm text-red-400" role="alert">
            {mediaError}
          </p>
        )}
      </main>
    </div>
  );
}
