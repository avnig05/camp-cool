// components/ChatPopup.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { marked } from 'marked';

interface ChatMessage {
  id: string;
  sender: "user" | "lenny";
  text: string;
}

interface ChatPopupProps {
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
const API_ENDPOINT = `${API_BASE_URL}/api/chat`;

// 1. Create the TypingIndicator component
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start"> {/* Aligns to the left like Lenny's messages */}
      <div className="max-w-min p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex space-x-1.5 items-center">
        {/* Pulsing dots for typing effect */}
        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:'-0.3s']"></div>
        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:'-0.15s']"></div>
        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

const ChatPopup: React.FC<ChatPopupProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // This controls both indicators
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === "") {
      inputRef.current?.focus();
      return;
    }

    const userMessageForState: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };
    // Add user's message, then set loading true to show typing indicator immediately after.
    setMessages((prev) => [...prev, userMessageForState]);
    
    setInput("");
    setIsLoading(true); // This will show button spinner AND typing indicator

    try {
      const formData = new FormData();
      formData.append("text", trimmedInput);

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Network error details:", errorData);
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }

      const data = await response.json();
      const lennyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "lenny",
        text: data.reply || "Sorry, I couldn't process that.",
      };
      // Add Lenny's actual message. The typing indicator will disappear when isLoading becomes false.
      setMessages((prev) => [...prev, lennyMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "lenny",
        text: "Oops! Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // This hides both indicators
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col z-50 border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <MessageCircle className="h-6 w-6 text-[#4F9F86] mr-2" />
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Chat with Lenny</h3>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-[#4F9F86] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {msg.sender === 'lenny' ? (
                <div dangerouslySetInnerHTML={{ __html: marked(msg.text) }} className="prose prose-sm dark:prose-invert max-w-none" />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {/* 2. Conditionally render TypingIndicator */}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask Lenny anything..."
            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F9F86] dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white p-2 rounded-md disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPopup;