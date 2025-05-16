"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, useScroll, useSpring, MotionValue, AnimatePresence } from "framer-motion"

// --- Internal Components ---

interface ProgressBarProps {
  scaleX: MotionValue<number>; // Type for useSpring output
}

const ProgressBar: React.FC<ProgressBarProps> = ({ scaleX }) => (
  <motion.div 
    className="fixed top-0 left-0 right-0 h-1 bg-[#4F9F86] origin-left z-50" 
    style={{ scaleX }} 
  />
);

interface ScrollToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ isVisible, onClick }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={onClick}
          className="bg-[#4F9F86] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-[#4F9F86]/90 transition-colors"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Main Component ---

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    // Cleanup listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, []);

  return (
    <>
      <ProgressBar scaleX={scaleX} />
      <ScrollToTopButton isVisible={isVisible} onClick={handleScrollToTop} />
    </>
  )
}

export default ScrollProgress
