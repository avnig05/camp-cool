"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Mic, Volume2, Play, Pause, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const VoiceConversationSection = () => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const waveformInterval = useRef<NodeJS.Timeout | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const questions = [
    "Where did you go to camp?",
    "What do you do now?",
    "Who do you want to meet?",
    "Are you here to grow your network, help others, or both?",
  ]

  // Use seeded random for deterministic values
  const generateSeededRandom = (seed: number) => {
    let value = seed
    return function() {
      value = (value * 9301 + 49297) % 233280
      return value / 233280
    }
  }

  useEffect(() => {
    if (!isClient) return

    if (isRecording) {
      // Create a seeded random generator to ensure consistent patterns
      const seededRandom = generateSeededRandom(Date.now())
      
      waveformInterval.current = setInterval(() => {
        setWaveformData((prev) => {
          const newData = [...prev]
          // Generate values between 0.2 and 1 using the seeded random
          newData.push(seededRandom() * 0.8 + 0.2)
          // Keep only the last 50 values
          if (newData.length > 50) {
            return newData.slice(newData.length - 50)
          }
          return newData
        })
      }, 100)
    } else {
      if (waveformInterval.current) {
        clearInterval(waveformInterval.current)
      }
      setWaveformData([])
    }

    return () => {
      if (waveformInterval.current) {
        clearInterval(waveformInterval.current)
      }
    }
  }, [isRecording, isClient])

  const handleQuestionClick = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  // Generate deterministic heights for initial render
  const getInitialHeight = (i: number) => {
    // Use a deterministic pattern based on index
    return 3 + (i % 5)
  }

  // Create a sine-based animation pattern without random values
  const getSineBasedHeight = (i: number, offset = 0): number => {
    return Math.sin(((i / 30) * Math.PI) + offset) * 20 + 5
  }

  return (
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#4F9F86]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-40 -right-20 w-60 h-60 bg-[#F6BE46]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 left-40 w-40 h-40 bg-[#4F9F86]/10 rounded-full blur-3xl"></div>

      {/* Sound wave decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#4F9F86"
            d="M39.9,-65.7C51.1,-58.4,59.5,-46.6,65.8,-33.8C72.1,-21,76.3,-7.1,74.8,6.1C73.3,19.3,66.1,31.8,56.8,42.1C47.5,52.4,36.1,60.5,23.1,66.2C10.1,71.9,-4.5,75.2,-18.8,73.3C-33.1,71.4,-47.1,64.3,-57.4,53.4C-67.7,42.5,-74.3,27.8,-76.9,12.3C-79.5,-3.2,-78.1,-19.5,-71.2,-32.8C-64.3,-46.1,-51.9,-56.4,-38.6,-62.6C-25.3,-68.8,-11.1,-70.9,1.9,-73.9C14.9,-76.9,28.7,-73,39.9,-65.7Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="relative z-10 bg-gradient-to-br from-[#FFF9E3]/80 to-white rounded-3xl shadow-xl border border-[#4F9F86]/10 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 h-20 w-20 bg-[#4F9F86]/5 rounded-bl-full"></div>

        <div className="flex items-center mb-6">
          <div className="mr-4 bg-[#4F9F86] rounded-full p-3 text-white">
            <Volume2 size={24} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif bg-gradient-to-r from-[#4F9F86] to-[#82AFA9] bg-clip-text text-transparent">
              Natural Voice Conversations
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-[#4F9F86] to-[#F6BE46] rounded-full mt-2"></div>
          </div>
        </div>

        <p className="text-lg mb-8 text-gray-700 max-w-2xl">
          Lenny connects with you through natural voice conversations on LinkedIn, making the experience personal and
          engaging. No typing needed—just talk naturally.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {questions.map((question, index) => (
            <motion.div
              key={index}
              className={`relative p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                activeQuestion === index
                  ? "bg-[#4F9F86] text-white shadow-lg"
                  : "bg-white border border-[#4F9F86]/20 text-gray-700 hover:border-[#4F9F86]/50 hover:shadow-md"
              }`}
              onClick={() => handleQuestionClick(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 ${
                    activeQuestion === index ? "text-white" : "text-[#4F9F86]"
                  } transition-colors duration-300`}
                >
                  <MessageCircle size={20} />
                </div>
                <p className="font-medium">{question}</p>
              </div>

              <AnimatePresence>
                {activeQuestion === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                          <Mic size={16} className="text-[#4F9F86]" />
                        </div>
                        <span className="text-sm">Tap to respond</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                        <span className="text-sm">Lenny is listening</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#4F9F86]/10 to-[#F6BE46]/10 p-6 rounded-2xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#4F9F86] flex items-center justify-center text-white">
                <Wand2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">AI Voice Technology</h3>
                <p className="text-sm text-gray-600">Natural-sounding conversations</p>
              </div>
            </div>
            <Button
              onClick={togglePlayback}
              className={`rounded-full ${
                isPlaying ? "bg-[#F6BE46] hover:bg-[#F6BE46]/90" : "bg-[#4F9F86] hover:bg-[#4F9F86]/90"
              } text-white`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              <span className="ml-2">{isPlaying ? "Pause" : "Listen"}</span>
            </Button>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
            <div
              className={`h-12 w-12 rounded-full ${
                isPlaying ? "bg-[#F6BE46]" : "bg-[#4F9F86]"
              } flex items-center justify-center text-white flex-shrink-0`}
            >
              {isPlaying ? <Volume2 size={20} /> : <Mic size={20} />}
            </div>
            <div className="flex-1">
              <div className="h-10 flex items-center">
                {Array.from({ length: 30 }).map((_, i) => {
                  // Use deterministic height with no randomness
                  const height = isPlaying && isClient 
                    ? getSineBasedHeight(i, Date.now() / 1000) // Use current time for animation phase
                    : getInitialHeight(i)
                  
                  return (
                    <motion.div
                      key={i}
                      className={`mx-[1px] rounded-full ${isPlaying ? "bg-[#F6BE46]" : "bg-[#4F9F86]/30"}`}
                      style={{ height: `${height}px`, width: "3px" }}
                      animate={
                        isClient && isPlaying
                          ? {
                              height: [height, height + 5, height],
                            }
                          : {}
                      }
                      transition={{
                        duration: 0.5,
                        repeat: isClient && isPlaying ? Number.POSITIVE_INFINITY : 0,
                        repeatType: "reverse",
                        delay: i * 0.01,
                      }}
                    />
                  )
                })}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {isPlaying
                  ? "Hi there! I'm Lenny, your camp connection guide. I'd love to learn about your camp experience..."
                  : "Click play to hear how Lenny sounds"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-[#4F9F86]/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Try Voice Recording</h3>
            <Button
              onClick={toggleRecording}
              className={`rounded-full ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-[#4F9F86] hover:bg-[#4F9F86]/90"
              } text-white`}
            >
              <Mic size={16} />
              <span className="ml-2">{isRecording ? "Recording..." : "Record"}</span>
            </Button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex items-center">
            <div
              className={`h-10 w-10 rounded-full ${
                isRecording ? "bg-red-500" : "bg-gray-300"
              } flex items-center justify-center text-white flex-shrink-0 mr-4`}
            >
              <Mic size={18} />
            </div>
            <div className="flex-1 h-10 flex items-center">
              {isRecording && isClient ? (
                <div className="w-full flex items-center gap-[2px]">
                  {waveformData.map((value, index) => (
                    <motion.div
                      key={index}
                      className="bg-red-500 rounded-full w-1"
                      style={{ height: `${value * 30}px` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${value * 30}px` }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Tap record to try voice interaction</p>
              )}
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute bottom-4 right-4 flex space-x-1">
          <div className="h-2 w-2 rounded-full bg-[#4F9F86]"></div>
          <div className="h-2 w-2 rounded-full bg-[#F6BE46]"></div>
          <div className="h-2 w-2 rounded-full bg-[#4F9F86]"></div>
        </div>
      </div>
    </div>
  )
}

export default VoiceConversationSection
