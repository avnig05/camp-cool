"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface VoiceMessagePlayerProps {
  duration: number
  label: string
}

// Deterministic pseudo-random function
const getPseudoRandom = (index: number, salt: number = 1): number => {
  return (((index * 9973 + salt * 6997) % 2027) / 2027);
}

const VoiceMessagePlayer = ({ duration, label }: VoiceMessagePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [waveformBars, setWaveformBars] = useState<number[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Generate waveform bars with a deterministic pattern
    const generateBars = () => {
      return Array.from({ length: 30 }, (_, i) => {
        const position = i / 30
        let height
    
        if (position < 0.5) {
          height = position * 2
        } else {
          height = (1 - position) * 2
        }
    
        // Use the deterministic function with a seed based on duration and index
        height = height * 0.7 + getPseudoRandom(i, Math.floor(duration * 100)) * 0.3
    
        height = 20 + height * 20
        return height
      })
    }
    
    // Only set waveform bars if they haven't been set yet or duration changes
    if (waveformBars.length === 0 || waveformBars.length !== 30) {
      setWaveformBars(generateBars())
    }
  }, [duration, waveformBars.length]) // Only regenerate if duration changes or on first render

  useEffect(() => {
    if (isPlaying && isClient) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setIsPlaying(false)
            return 0
          }
          return prev + 100 / (duration * 10) // duration is in seconds
        })
      }, 100) // Update progress every 100ms
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, duration, isClient])

  const togglePlay = () => {
    if (progress >= 100) {
      setProgress(0)
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const currentTime = (progress / 100) * duration
  const remainingTime = duration - currentTime

  // Create a deterministic animation pattern
  const getAnimationHeight = (baseHeight: number, index: number, time: number) => {
    if (!isClient || !isPlaying) return baseHeight;
    
    // Create a wave-like motion using index and current time
    const phase = (index * 0.2 + time * 0.001) % (2 * Math.PI);
    const amplitude = 5; // Maximum height change
    return baseHeight + Math.sin(phase) * amplitude;
  }

  return (
    <div className="bg-[#FFF9E3] p-4 rounded-xl border border-[#4F9F86]/10 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 rounded-full bg-[#4F9F86] flex items-center justify-center text-white flex-shrink-0 mr-3">
          L
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="h-10 w-10 rounded-full bg-[#4F9F86] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#4F9F86]/90 transition-colors"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
        </button>

        <div className="flex-1">
          <div className="flex items-center h-10">
            {waveformBars.map((barHeight, index) => {
              const isActive = (index / waveformBars.length) * 100 <= progress
              // Use the base height for SSR, and add animations only on the client
              const height = isClient && isPlaying && isActive 
                ? getAnimationHeight(barHeight, index, Date.now()) 
                : barHeight;

              return (
                <motion.div
                  key={index}
                  className={`mx-[1px] rounded-full ${isActive ? "bg-[#4F9F86]" : "bg-gray-300"}`}
                  style={{ height: `${height}px`, width: "3px" }}
                  animate={
                    isClient && isPlaying && isActive
                      ? {
                          height: [height, height + 5, height],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.5,
                    repeat: isClient && isPlaying && isActive ? Number.POSITIVE_INFINITY : 0,
                    repeatType: "reverse",
                    delay: index * 0.01, // Stagger the animations slightly
                  }}
                />
              )
            })}
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(remainingTime)}</span>
          </div>
        </div>

        <button onClick={toggleMute} className="text-gray-500 hover:text-[#4F9F86] transition-colors">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  )
}

export default VoiceMessagePlayer
