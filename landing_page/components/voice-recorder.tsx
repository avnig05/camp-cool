"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Send } from "lucide-react"

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRecording && isClient) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)

        // Generate random waveform data
        setWaveformData((prev) => {
          const newData = [...prev]
          newData.push(Math.random() * 0.8 + 0.2) // Random value between 0.2 and 1

          // Keep only the last 50 values
          if (newData.length > 50) {
            return newData.slice(newData.length - 50)
          }
          return newData
        })
      }, 100)
    } else {
      setWaveformData([])
      if(isRecording && !isClient) {
          setRecordingTime(0);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRecording, isClient])

  const toggleRecording = () => {
    if (!isRecording) {
      setRecordingTime(0)
    }
    setIsRecording(!isRecording)
  }

  const formatTime = (tenthsOfSeconds: number) => {
    const seconds = Math.floor(tenthsOfSeconds / 10)
    const tenths = tenthsOfSeconds % 10
    return `${seconds}.${tenths}s`
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-[#4F9F86]/10 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Try Voice Response</span>
        {isClient && isRecording && (
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-red-500 mr-2"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
            <span className="text-xs text-gray-500">{formatTime(recordingTime)}</span>
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          {isClient && isRecording ? (
            <motion.button
              key="stop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={toggleRecording}
              className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0 hover:bg-red-600 transition-colors"
            >
              <Square size={14} />
            </motion.button>
          ) : (
            <motion.button
              key="record"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={toggleRecording}
              className="h-10 w-10 rounded-full bg-[#4F9F86] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#4F9F86]/90 transition-colors"
            >
              <Mic size={18} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex-1 h-10 bg-gray-100 rounded-lg flex items-center px-3">
          {isClient && isRecording ? (
            <div className="w-full flex items-center justify-between gap-1">
              {waveformData.map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-[#4F9F86] rounded-full w-1"
                  style={{ height: `${value * 30}px` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${value * 30}px` }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-400">Tap the mic to record a voice message</span>
          )}
        </div>

        {isClient && isRecording && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-10 w-10 rounded-full bg-[#F6BE46] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#F6BE46]/90 transition-colors"
          >
            <Send size={16} />
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default VoiceRecorder
