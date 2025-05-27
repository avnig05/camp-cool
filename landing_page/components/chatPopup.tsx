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

// TypingIndicator component
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-min p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex space-x-1.5 items-center">
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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsLoadingRef = useRef<boolean>(isLoading); // Ref to track previous isLoading state

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // useEffect to focus input when isLoading transitions from true to false
  useEffect(() => {
    if (prevIsLoadingRef.current === true && isLoading === false) {
      inputRef.current?.focus();
    }
    // Update the previous isLoading state for the next render
    prevIsLoadingRef.current = isLoading;
  }, [isLoading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === "") {
      inputRef.current?.focus(); // Focus if trying to send empty message
      return;
    }

    const userMessageForState: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input, // Display original input
    };
    setMessages((prev) => [...prev, userMessageForState]);
    
    setInput(""); // Clear input field
    setIsLoading(true); // Show button spinner AND typing indicator

    try {
      const formData = new FormData();
      formData.append("text", trimmedInput); // Send trimmed input to backend
      // Send history if needed by your backend
      const historyForBackend = messages.map(msg => ({ sender: msg.sender, text: msg.text }));
      formData.append("history", JSON.stringify(historyForBackend));


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
      setIsLoading(false); // This hides both indicators and re-enables input
      // The useEffect above will handle focusing the input.
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
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4F9F86]"
          aria-label="Close chat" // Added aria-label for close button
        >
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
                <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} className="prose prose-sm dark:prose-invert max-w-none" />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
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
            aria-label="Chat message input" // Added aria-label for input
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white p-2 rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F9F86]"
            aria-label="Send message" // Added aria-label for send button
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" role="status" aria-live="polite">
                <span className="sr-only">Sending message...</span> {/* Screen reader text for spinner */}
              </div>
            ) : (
              <Send size={20} aria-hidden="true" /> // Hide decorative icon from screen readers
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPopup;
