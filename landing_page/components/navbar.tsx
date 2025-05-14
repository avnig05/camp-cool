"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Linkedin, Menu, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface NavbarProps {
  scrollToSection: (ref: React.RefObject<HTMLDivElement>) => void
  aboutRef: React.RefObject<HTMLDivElement>
  howItWorksRef: React.RefObject<HTMLDivElement>
  networkRef: React.RefObject<HTMLDivElement>
  contactRef: React.RefObject<HTMLDivElement>
}

const Navbar = ({ scrollToSection, aboutRef, howItWorksRef, networkRef, contactRef }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "About", ref: aboutRef },
    { name: "How Lenny Works", ref: howItWorksRef },
    { name: "Network", ref: networkRef },
    { name: "Contact", ref: contactRef },
  ]

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img src="/images/lenny-logo.png" alt="Lenny Logo" className="h-10 w-10 mr-2" />
            <span className={`font-bold text-xl font-serif ${scrolled ? "text-[#4F9F86]" : "text-[#4F9F86]"}`}>
              Lenny
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={`#${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`text-sm font-medium hover:text-[#4F9F86] relative ${
                    scrolled ? "text-gray-700" : "text-gray-700"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(link.ref)
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {link.name}
                  <motion.div
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4F9F86]"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <Button
            className={`${
              scrolled ? "bg-[#4F9F86] hover:bg-[#4F9F86]/90" : "bg-[#4F9F86] hover:bg-[#4F9F86]/90"
            } text-white rounded-full group transition-all duration-300 transform hover:scale-105 hidden md:flex`}
          >
            <span>Connect with LinkedIn</span>
            <Linkedin className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
          </Button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <motion.div
          className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-3 space-y-1 bg-white shadow-md">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={`#${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block py-2 text-gray-700 hover:text-[#4F9F86]"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(link.ref)
                  setMobileMenuOpen(false)
                }}
              >
                {link.name}
              </a>
            ))}
            <Button className="w-full mt-3 bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white rounded-full">
              <span>Connect with LinkedIn</span>
              <Linkedin className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

export default Navbar
