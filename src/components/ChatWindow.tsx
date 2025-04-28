// src/components/ChatWindow.tsx
'use client'; 

import React from 'react';

interface ChatWindowProps {
  onClose: () => void; 
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  return (
    <div className="fixed bottom-20 right-5 z-50 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-700">聊天窗口</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-xl font-bold"
          aria-label="关闭聊天窗口"
        >
          &times; 
        </button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <p className="text-gray-500 text-sm">聊天内容会显示在这里...</p>
      </div>
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <input
          type="text"
          placeholder="输入消息..."
          className="w-full border border-gray-300 rounded p-2"
          disabled
        />
      </div>
    </div>
  );
};

export default ChatWindow;