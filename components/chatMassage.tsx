import React from "react";
import { ChatMessage } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-[#1e1f20] text-gray-100 rounded-bl-sm border border-gray-800 flex flex-col gap-3"
        }`}
      >
        <span>{message.content}</span>
        {message.audioUrl && (
          <audio controls className="w-full mt-1 rounded-lg">
            <source src={message.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
};
