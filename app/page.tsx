"use client";

import { MusicChatView } from "@/components/home/musicChatView";
import { useMusicChat } from "@/hooks/useMusicChat";

export default function MusicChatPage() {
  const chat = useMusicChat();

  return (
    <MusicChatView
      prompt={chat.prompt}
      onPromptChange={chat.setPrompt}
      mediaFile={chat.mediaFile}
      mediaError={chat.mediaError}
      onMediaChange={chat.handleMediaChange}
      messages={chat.messages}
      isLoading={chat.isLoading}
      isSidebarOpen={chat.isSidebarOpen}
      onSidebarChange={chat.setIsSidebarOpen}
      userName={chat.supaData ? "username here" : "User"}
      chats={chat.supaChats}
      isSupaLoading={chat.isSupaLoading}
      onSubmit={chat.handleSubmit}
      onNewChat={chat.startNewChat}
      onSelectChat={chat.continueChat}
    />
  );
}
