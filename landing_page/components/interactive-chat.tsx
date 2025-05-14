"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import VoiceMessagePlayer from "./voice-message-player"
import VoiceRecorder from "./voice-recorder"

interface Message {
  id: number
  sender: "lenny" | "user"
  text: string
  isVoice?: boolean
  duration?: number
}

const InteractiveChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "lenny",
      text: "Hi Sarah! I'm Lenny, your camp connection guide. I see you went to Camp Ramah. What years were you there?",
    },
  ])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showVoiceMessage, setShowVoiceMessage] = useState(false)

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "user",
        text: option,
      },
    ])

    // Show typing indicator
    setIsTyping(true)

    // Add Lenny's response after delay
    setTimeout(() => {
      setIsTyping(false)

      if (option.includes("2005-2009")) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "lenny",
            text: "That's awesome! Are you looking to grow your professional network, help others from camp, or both?",
          },
        ])
      } else if (option.includes("network")) {
        setShowVoiceMessage(true)
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "lenny",
            text: "Great! I've sent you a voice message explaining how I can help you grow your network.",
            isVoice: true,
            duration: 24,
          },
        ])
      }
    }, 1500)
  }

  const options = [
    {
      id: "years",
      text: "I was at Camp Ramah from 2005-2009! Some of the best summers of my life.",
      show: messages.length === 1,
    },
    {
      id: "network",
      text: "I'd like to grow my professional network",
      show: messages.length === 3 && !isTyping,
    },
    {
      id: "help",
      text: "I want to help others from camp",
      show: messages.length === 3 && !isTyping,
    },
    {
      id: "both",
      text: "Both! I'd like to connect and help",
      show: messages.length === 3 && !isTyping,
    },
  ]

  return (
    <div className="bg-[#FFF9E3] p-4 rounded-xl border border-[#4F9F86]/10 shadow-lg">
      <div className="flex items-center mb-4 pb-3 border-b border-[#4F9F86]/10">
        <div className="h-10 w-10 rounded-full bg-[#4F9F86] flex items-center justify-center text-white flex-shrink-0 mr-3">
          L
        </div>
        <div>
          <h3 className="font-medium">Lenny</h3>
          <p className="text-xs text-gray-500">Camp Connection Guide</p>
        </div>
        <div className="ml-auto flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
          <span className="text-xs text-green-500">Online</span>
        </div>
      </div>

      <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
            {message.sender === "lenny" && (
              <div className="h-10 w-10 rounded-full bg-[#4F9F86] flex items-center justify-center text-white flex-shrink-0">
                L
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`max-w-[80%] ${
                message.sender === "lenny"
                  ? "bg-[#4F9F86]/10 rounded-2xl rounded-tl-none p-4 text-gray-700"
                  : "bg-[#4F9F86]/20 rounded-2xl rounded-tr-none p-4 text-gray-700"
              }`}
            >
              <p>{message.text}</p>
            </motion.div>

            {message.sender === "user" && <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-[#4F9F86] flex items-center justify-center text-white flex-shrink-0">
              L
            </div>
            <div className="bg-[#4F9F86]/10 rounded-2xl rounded-tl-none p-4">
              <div className="flex space-x-1">
                <motion.div
                  className="h-2 w-2 rounded-full bg-gray-400"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", repeatDelay: 0.2 }}
                />
                <motion.div
                  className="h-2 w-2 rounded-full bg-gray-400"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    repeatDelay: 0.3,
                    delay: 0.1,
                  }}
                />
                <motion.div
                  className="h-2 w-2 rounded-full bg-gray-400"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    repeatDelay: 0.4,
                    delay: 0.2,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showVoiceMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <VoiceMessagePlayer duration={24} label="Voice message from Lenny" />
        </motion.div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {options
            .filter((option) => option.show && !selectedOption)
            .map((option) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="block w-full text-left p-3 bg-white rounded-lg border border-[#4F9F86]/10 text-gray-700 hover:bg-[#4F9F86]/5 transition-colors"
                onClick={() => handleOptionClick(option.text)}
              >
                {option.text}
              </motion.button>
            ))}
        </AnimatePresence>

        {messages.length > 3 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <VoiceRecorder />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default InteractiveChat
