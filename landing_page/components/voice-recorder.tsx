"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Send } from "lucide-react"

// --- Internal Components ---

interface RecordingHeaderProps {
  isClient: boolean;
  isRecording: boolean;
  formattedTime: string;
}

const RecordingHeader: React.FC<RecordingHeaderProps> = ({ isClient, isRecording, formattedTime }) => (
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
        <span className="text-xs text-gray-500">{formattedTime}</span>
      </motion.div>
    )}
  </div>
);

interface RecordStopButtonProps {
  isClient: boolean; // Though AnimatePresence handles client-side, explicit prop can be clearer
  isRecording: boolean;
  toggleRecording: () => void;
}

const RecordStopButton: React.FC<RecordStopButtonProps> = ({ isClient, isRecording, toggleRecording }) => (
  <AnimatePresence mode="wait">
    {isClient && isRecording ? (
      <motion.button
        key="stop"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={toggleRecording}
        className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0 hover:bg-red-600 transition-colors"
        aria-label="Stop recording"
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
        aria-label="Start recording"
      >
        <Mic size={18} />
      </motion.button>
    )}
  </AnimatePresence>
);

interface RecordingWaveformDisplayProps {
  isClient: boolean;
  isRecording: boolean;
  waveformData: number[];
}

const RecordingWaveformDisplay: React.FC<RecordingWaveformDisplayProps> = ({ isClient, isRecording, waveformData }) => (
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
);

interface SendButtonDisplayProps {
    isClient: boolean;
    isRecording: boolean;
    // onClick: () => void; // Add if send functionality is implemented
}

const SendButtonDisplay: React.FC<SendButtonDisplayProps> = ({ isClient, isRecording }) => (
    <>
        {isClient && isRecording && (
            <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-10 w-10 rounded-full bg-[#F6BE46] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#F6BE46]/90 transition-colors"
                aria-label="Send recording" // Added aria-label
                // onClick={onClick} // Add if send functionality is implemented
            >
                <Send size={16} />
            </motion.button>
        )}
    </>
);

// --- Main Component ---

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
        setWaveformData((prevData) => {
          const newData = [...prevData, Math.random() * 0.8 + 0.2]
          return newData.length > 50 ? newData.slice(-50) : newData
        })
      }, 100)
    } else {
      setWaveformData([]) // Clear waveform when not recording
      if (isRecording && !isClient) { // This case should ideally not happen if isClient guard is effective
          setRecordingTime(0); // Reset time if recording was true before client mounted
      }
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, isClient])

  const toggleRecording = () => {
    if (!isRecording) {
      setRecordingTime(0) // Reset time only when starting a new recording
    }
    setIsRecording(!isRecording)
  }

  const formatTime = useCallback((tenthsOfSeconds: number) => {
    const seconds = Math.floor(tenthsOfSeconds / 10)
    const tenths = tenthsOfSeconds % 10
    return `${seconds}.${tenths}s`
  }, [])

  // Placeholder for send functionality if implemented later
  // const handleSend = () => { console.log("Send recording data:", waveformData); setIsRecording(false); };

  return (
    <div className="bg-white p-4 rounded-xl border border-[#4F9F86]/10 shadow-sm">
      <RecordingHeader
        isClient={isClient}
        isRecording={isRecording}
        formattedTime={formatTime(recordingTime)}
      />
      <div className="flex items-center gap-3">
        <RecordStopButton
            isClient={isClient}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
        />
        <RecordingWaveformDisplay
          isClient={isClient}
          isRecording={isRecording}
          waveformData={waveformData}
        />
        <SendButtonDisplay 
            isClient={isClient} 
            isRecording={isRecording} 
            // onClick={handleSend} // Pass if implemented
        />
      </div>
    </div>
  )
}

export default VoiceRecorder
