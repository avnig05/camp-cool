"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

const CampNetworkVisual = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

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

    // Camp icons and profiles
    class CampIcon {
      x: number
      y: number
      size: number
      color: string
      image: HTMLImageElement | null
      rotation: number
      rotationSpeed: number
      type: string
      label: string

      constructor(x: number, y: number, size: number, color: string, type: string, label: string) {
        this.x = x
        this.y = y
        this.size = size
        this.color = color
        this.image = null
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
        this.type = type
        this.label = label

        // Load image if needed
        if (type === "profile") {
          this.image = new Image()
          this.image.crossOrigin = "anonymous"
          this.image.src = `/placeholder.svg?height=100&width=100`
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.x, this.y)

        if (this.type === "tent") {
          // Draw a tent
          ctx.rotate(this.rotation)
          ctx.beginPath()
          ctx.moveTo(0, -this.size)
          ctx.lineTo(this.size, this.size)
          ctx.lineTo(-this.size, this.size)
          ctx.closePath()
          ctx.fillStyle = this.color
          ctx.fill()
          ctx.strokeStyle = "#FFF"
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw door
          ctx.beginPath()
          ctx.moveTo(-this.size / 3, this.size)
          ctx.lineTo(-this.size / 3, this.size / 2)
          ctx.lineTo(this.size / 3, this.size / 2)
          ctx.lineTo(this.size / 3, this.size)
          ctx.strokeStyle = "#FFF"
          ctx.stroke()
        } else if (this.type === "campfire") {
          // Draw a campfire
          ctx.beginPath()
          ctx.arc(0, 0, this.size, 0, Math.PI * 2)
          ctx.fillStyle = "#F6BE46"
          ctx.fill()

          // Draw flames
          const flameHeight = this.size * 1.5
          ctx.beginPath()
          ctx.moveTo(-this.size / 2, 0)
          ctx.quadraticCurveTo(-this.size / 4, -flameHeight / 2, 0, -flameHeight)
          ctx.quadraticCurveTo(this.size / 4, -flameHeight / 2, this.size / 2, 0)
          ctx.fillStyle = "#F6BE46"
          ctx.fill()
        } else if (this.type === "profile") {
          // Draw profile
          ctx.beginPath()
          ctx.arc(0, 0, this.size, 0, Math.PI * 2)
          ctx.fillStyle = "#FFF"
          ctx.fill()
          ctx.strokeStyle = this.color
          ctx.lineWidth = 3
          ctx.stroke()

          // Draw image if loaded
          if (this.image && this.image.complete) {
            ctx.beginPath()
            ctx.arc(0, 0, this.size - 2, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(this.image, -this.size + 2, -this.size + 2, (this.size - 2) * 2, (this.size - 2) * 2)
          }

          // Draw label
          ctx.restore()
          ctx.save()
          ctx.font = "12px Arial"
          ctx.fillStyle = "#4F9F86"
          ctx.textAlign = "center"
          ctx.fillText(this.label, this.x, this.y + this.size + 15)
        }

        ctx.restore()
      }

      update() {
        this.rotation += this.rotationSpeed
      }
    }

    // Create camp icons
    const campIcons: CampIcon[] = []

    // Add central campfire
    campIcons.push(new CampIcon(canvas.width / 2, canvas.height / 2, 25, "#F6BE46", "campfire", ""))

    // Add tents
    const tentCount = 5
    const tentColors = ["#4F9F86", "#82AFA9", "#4F9F86", "#82AFA9", "#4F9F86"]
    const radius = Math.min(canvas.width, canvas.height) * 0.3

    for (let i = 0; i < tentCount; i++) {
      const angle = (i / tentCount) * Math.PI * 2
      const x = canvas.width / 2 + Math.cos(angle) * radius
      const y = canvas.height / 2 + Math.sin(angle) * radius
      campIcons.push(new CampIcon(x, y, 20, tentColors[i], "tent", ""))
    }

    // Add profiles
    const profileCount = 8
    const profileLabels = [
      "Camp Ramah",
      "Camp Tawonga",
      "Camp Newman",
      "Camp Alonim",
      "Camp JCA",
      "Camp Hess",
      "Camp Gilboa",
      "Camp Havaya",
    ]
    const profileRadius = Math.min(canvas.width, canvas.height) * 0.4

    for (let i = 0; i < profileCount; i++) {
      const angle = (i / profileCount) * Math.PI * 2 + Math.PI / profileCount
      const x = canvas.width / 2 + Math.cos(angle) * profileRadius
      const y = canvas.height / 2 + Math.sin(angle) * profileRadius
      campIcons.push(new CampIcon(x, y, 15, "#4F9F86", "profile", profileLabels[i]))
    }

    // Draw connections
    const drawConnections = () => {
      // Connect profiles to tents
      for (let i = tentCount + 1; i < campIcons.length; i++) {
        const profile = campIcons[i]

        // Connect to nearest tent
        let nearestTent = null
        let minDistance = Number.POSITIVE_INFINITY

        for (let j = 1; j <= tentCount; j++) {
          const tent = campIcons[j]
          const dx = tent.x - profile.x
          const dy = tent.y - profile.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < minDistance) {
            minDistance = distance
            nearestTent = tent
          }
        }

        if (nearestTent) {
          ctx.beginPath()
          ctx.moveTo(profile.x, profile.y)
          ctx.lineTo(nearestTent.x, nearestTent.y)
          ctx.strokeStyle = "rgba(79, 159, 134, 0.3)"
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Connect to campfire
        const campfire = campIcons[0]
        ctx.beginPath()
        ctx.moveTo(profile.x, profile.y)
        ctx.lineTo(campfire.x, campfire.y)
        ctx.strokeStyle = "rgba(246, 190, 70, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Connect tents to campfire
      const campfire = campIcons[0]
      for (let i = 1; i <= tentCount; i++) {
        const tent = campIcons[i]
        ctx.beginPath()
        ctx.moveTo(tent.x, tent.y)
        ctx.lineTo(campfire.x, campfire.y)
        ctx.strokeStyle = "rgba(246, 190, 70, 0.5)"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = "rgba(255, 249, 227, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      drawConnections()

      // Update and draw icons
      campIcons.forEach((icon) => {
        icon.update()
        icon.draw(ctx)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return (
    <motion.div
      className="w-full h-[400px] relative rounded-xl overflow-hidden bg-[#FFF9E3]/50 shadow-lg border border-[#4F9F86]/20"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-[#4F9F86] font-medium border border-[#4F9F86]/20">
        Camp Community Network
      </div>
    </motion.div>
  )
}

export default CampNetworkVisual
