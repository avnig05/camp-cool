"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Linkedin, MessageCircle, Users, Sparkles } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Connect with LinkedIn",
    description: "Link your LinkedIn profile to Lenny, giving him access to your professional network.",
    icon: <Linkedin className="h-8 w-8 text-white" />,
    color: "#4F9F86",
  },
  {
    id: 2,
    title: "Voice Conversation",
    description: "Have a natural voice chat with Lenny about your camp experience, career, and who you want to meet.",
    icon: <MessageCircle className="h-8 w-8 text-white" />,
    color: "#F6BE46",
  },
  {
    id: 3,
    title: "Choose Your Intent",
    description: "Tell Lenny if you're looking to grow your network, help others, or both.",
    icon: <Users className="h-8 w-8 text-white" />,
    color: "#82AFA9",
  },
  {
    id: 4,
    title: "Receive Warm Introductions",
    description: "Get connected to alumni through personalized LinkedIn messages or voice notes.",
    icon: <Sparkles className="h-8 w-8 text-white" />,
    color: "#4F9F86",
  },
]

const HowItWorks = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-20 bg-[#FFF9E3] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">How Lenny Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lenny makes it easy to reconnect with your camp community through LinkedIn.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={item}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="p-6 h-full flex flex-col items-center text-center border border-[#4F9F86]/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-[#4F9F86]/5 to-transparent rounded-bl-full"></div>

                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10"
                  style={{ backgroundColor: step.color }}
                  whileHover={{ rotate: 5 }}
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 rgba(79,159,134,0)",
                      "0 0 20px rgba(79,159,134,0.3)",
                      "0 0 0 rgba(79,159,134,0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>

                <div className="absolute -bottom-2 -left-2 text-6xl font-bold opacity-10 text-[#4F9F86]">{step.id}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
