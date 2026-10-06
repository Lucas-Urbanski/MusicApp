"use client";

import React from "react";
import { Menu, Plus, Minus } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOldChat: () => void; // Change Later
  onNewChat: () => void;
  allChats: any[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOldChat,
  onNewChat,
  allChats
}) => {
  return (
    <aside
      className={`${
        isOpen ? "w-72" : "w-0"
      } transition-all duration-300 ease-in-out flex-shrink-0 bg-[#1e1f20] overflow-hidden flex flex-col`}
    >
      <div className="w-72 h-full flex flex-col p-4">
        <div className="flex items-center mb-6">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 transition rounded-full hover:bg-gray-700/50"
            aria-label="Close menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {  
          allChats.map((item, index) => (
            <button
              onClick={onOldChat}
              className="flex items-center gap-3 bg-[#131314] hover:bg-gray-800 transition-colors rounded-full px-4 py-2.5 text-sm font-medium mb-4 w-fit text-gray-200 border border-gray-700"
              key={index}
            >
              <Minus className="w-4 h-4" />
              <span className="italic">{item.title}</span>
            </button>
          ))
        }

        <button
          onClick={onNewChat}
          className="flex items-center gap-3 bg-[#131314] hover:bg-gray-800 transition-colors rounded-full px-4 py-2.5 text-sm font-medium mb-4 w-fit text-gray-200 border border-gray-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 mb-3 px-2">
            Recent
          </p>
        </div>
      </div>
    </aside>
  );
};
