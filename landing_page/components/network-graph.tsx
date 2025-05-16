"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

const NetworkGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Only run this effect on the client
    if (typeof window === 'undefined') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Set initialized to prevent re-running
    if (initialized) return
    setInitialized(true)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      } else {
        canvas.width = 500
        canvas.height = 500
      }
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Node class
    class Node {
      x: number
      y: number
      radius: number
      color: string
      vx: number
      vy: number
      image: HTMLImageElement | null
      pulseSize: number
      pulseDirection: number
      initialRadius: number
      highlighted: boolean
      highlightIntensity: number
      highlightDirection: number

      constructor(x: number, y: number, radius: number, color: string, imageUrl?: string) {
        this.x = x
        this.y = y
        this.radius = radius
        this.initialRadius = radius
        this.color = color
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.image = null
        this.pulseSize = 0
        this.pulseDirection = 1
        this.highlighted = Math.random() > 0.7
        this.highlightIntensity = 0
        this.highlightDirection = 1

        if (imageUrl) {
          this.image = new Image()
          this.image.crossOrigin = "anonymous"
          this.image.src = imageUrl
          
          // Add error handling for image loading
          this.image.onerror = () => {
            console.error(`Failed to load image from ${imageUrl}`)
            this.image = null // Set to null on error to prevent broken image rendering
          }
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw pulse effect for highlighted nodes
        if (this.highlighted) {
          this.highlightIntensity += 0.02 * this.highlightDirection
          if (this.highlightIntensity > 1) {
            this.highlightIntensity = 1
            this.highlightDirection = -1
          } else if (this.highlightIntensity < 0) {
            this.highlightIntensity = 0
            this.highlightDirection = 1
          }

          ctx.beginPath()
          ctx.arc(this.x, this.y, this.radius + 10 * this.highlightIntensity, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(79, 159, 134, ${0.3 * this.highlightIntensity})`
          ctx.fill()
        }

        // Draw node
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()

        // Draw image if available - with error handling
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
          try {
          ctx.save()
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(
            this.image,
            this.x - this.radius + 2,
            this.y - this.radius + 2,
            (this.radius - 2) * 2,
            (this.radius - 2) * 2,
          )
          ctx.restore()
          } catch (error) {
            console.error("Error drawing image:", error)
          }
        }
      }

      update(width: number, height: number, mouseX?: number, mouseY?: number) {
        // Pulse effect
        this.pulseSize += 0.03 * this.pulseDirection
        if (this.pulseSize > 1) {
          this.pulseSize = 1
          this.pulseDirection = -1
        } else if (this.pulseSize < 0) {
          this.pulseSize = 0
          this.pulseDirection = 1
        }

        this.radius = this.initialRadius * (1 + this.pulseSize * 0.1)

        // Mouse interaction
        if (mouseX !== undefined && mouseY !== undefined) {
          const dx = this.x - mouseX
          const dy = this.y - mouseY
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            const angle = Math.atan2(dy, dx)
            const force = ((100 - distance) / 100) * 0.5
            this.vx += Math.cos(angle) * force
            this.vy += Math.sin(angle) * force
          }
        }

        // Movement
        this.x += this.vx
        this.y += this.vy

        // Friction
        this.vx *= 0.98
        this.vy *= 0.98

        // Enforce boundaries more strictly
        // Keep nodes fully within the canvas
        if (this.x < this.radius) {
          this.x = this.radius
          this.vx = Math.abs(this.vx) * 0.5 // Bounce with reduced velocity
        } else if (this.x > width - this.radius) {
          this.x = width - this.radius
          this.vx = -Math.abs(this.vx) * 0.5 // Bounce with reduced velocity
        }

        if (this.y < this.radius) {
          this.y = this.radius
          this.vy = Math.abs(this.vy) * 0.5 // Bounce with reduced velocity
        } else if (this.y > height - this.radius) {
          this.y = height - this.radius
          this.vy = -Math.abs(this.vy) * 0.5 // Bounce with reduced velocity
        }
      }
    }

    // Create nodes with a seed to ensure consistent initialization
    const generateSeededRandom = (seed: number) => {
      let value = seed
      return function() {
        value = (value * 9301 + 49297) % 233280
        return value / 233280
      }
    }

    const seededRandom = generateSeededRandom(12345) // Fixed seed for consistent results
    
    const nodes: Node[] = []
    const nodeCount = 20
    const colors = ["#4F9F86", "#F6BE46", "#82AFA9", "#FFF9E3"]

    for (let i = 0; i < nodeCount; i++) {
      const radius = seededRandom() * 15 + 10
      const x = seededRandom() * (canvas.width - radius * 2) + radius
      const y = seededRandom() * (canvas.height - radius * 2) + radius
      const color = colors[Math.floor(seededRandom() * colors.length)]

      // Remove the placeholder image - it's causing problems
      // If you need profile images, add them to your public folder or use a reliable source
      nodes.push(new Node(x, y, radius, color))
    }

    // Mouse interaction
    let mouseX: number | undefined
    let mouseY: number | undefined

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    })

    canvas.addEventListener("mouseleave", () => {
      mouseX = undefined
      mouseY = undefined
    })

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = "rgba(255, 249, 227, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // First, update all nodes
      nodes.forEach((node) => {
        node.update(canvas.width, canvas.height, mouseX, mouseY)
      })

      // Draw connections first
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const opacity = ((150 - distance) / 150) * 0.5
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(79, 159, 134, ${opacity})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // Then draw all nodes on top of connections
      nodes.forEach((node) => {
        node.draw(ctx)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [initialized]) // Add initialized to dependency array

  // For server-side rendering, return a placeholder div initially
  return (
    <motion.div
      className="w-full h-[500px] relative rounded-xl overflow-hidden bg-[#FFF9E3]/50 shadow-lg border border-[#4F9F86]/20"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      {isHovering && (
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-[#4F9F86] font-medium border border-[#4F9F86]/20">
          Interactive Network
        </div>
      )}
    </motion.div>
  )
}

export default NetworkGraph
