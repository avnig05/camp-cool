"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type FloatingElement = {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  rotate: number
  type: "circle" | "square" | "triangle" | "inner-tube"
  color: string
}

// Seeded random function for consistent values
const seededRandom = (function() {
  let seed = 42; // Fixed seed for consistent results
  
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
})();

const FloatingElements = () => {
  const [elements, setElements] = useState<FloatingElement[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip if not client side yet (will use empty array for SSR)
    if (!isClient) return;
    
    const colors = ["#4F9F86", "#F6BE46", "#82AFA9", "#FFF9E3"]
    const types = ["circle", "square", "triangle", "inner-tube"]
    const newElements: FloatingElement[] = []

    for (let i = 0; i < 15; i++) {
      newElements.push({
        id: i,
        x: seededRandom() * 100,
        y: seededRandom() * 100,
        size: seededRandom() * 30 + 10,
        duration: seededRandom() * 20 + 10,
        delay: seededRandom() * 5,
        rotate: seededRandom() * 360,
        type: types[Math.floor(seededRandom() * types.length)] as "circle" | "square" | "triangle" | "inner-tube",
        color: colors[Math.floor(seededRandom() * colors.length)],
      })
    }

    setElements(newElements)
  }, [isClient])

  const renderElement = (element: FloatingElement) => {
    switch (element.type) {
      case "circle":
        return (
          <div
            className="rounded-full"
            style={{
              width: element.size,
              height: element.size,
              backgroundColor: element.color,
              opacity: 0.1,
            }}
          />
        )
      case "square":
        return (
          <div
            className="rounded-md"
            style={{
              width: element.size,
              height: element.size,
              backgroundColor: element.color,
              opacity: 0.1,
            }}
          />
        )
      case "triangle":
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${element.size / 2}px solid transparent`,
              borderRight: `${element.size / 2}px solid transparent`,
              borderBottom: `${element.size}px solid ${element.color}`,
              opacity: 0.1,
            }}
          />
        )
      case "inner-tube":
        return (
          <div className="relative" style={{ width: element.size, height: element.size }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: element.color,
                opacity: 0.2,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "25%",
                left: "25%",
                width: "50%",
                height: "50%",
                backgroundColor: "#FFF9E3",
              }}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          initial={{
            x: `${element.x}vw`,
            y: `${element.y}vh`,
            rotate: element.rotate,
          }}
          animate={{
            x: [`${element.x}vw`, `${(element.x + 20) % 100}vw`, `${element.x}vw`],
            y: [`${element.y}vh`, `${(element.y + 20) % 100}vh`, `${element.y}vh`],
            rotate: [element.rotate, element.rotate + 360, element.rotate],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          {renderElement(element)}
        </motion.div>
      ))}
    </div>
  )
}

export default FloatingElements
