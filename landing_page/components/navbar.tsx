"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Linkedin, Menu, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"

interface NavbarProps {
  showBanner?: boolean;
  scrollToSection: (ref: React.RefObject<HTMLDivElement | null>) => void
  aboutRef: React.RefObject<HTMLDivElement | null>
  howItWorksRef: React.RefObject<HTMLDivElement | null>
  networkRef: React.RefObject<HTMLDivElement | null>
  contactRef: React.RefObject<HTMLDivElement | null>
}

const Navbar = ({ showBanner, scrollToSection, aboutRef, howItWorksRef, networkRef, contactRef }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "About", ref: aboutRef, id: "about-link" },
    { name: "How Lenny Works", ref: howItWorksRef, id: "how-lenny-works-link" },
    { name: "Network", ref: networkRef, id: "network-link" },
    { name: "Contact", ref: contactRef, id: "contact-link" },
  ]

  const bannerHeightClass = showBanner && isMobile ? "pt-12" : (showBanner && !isMobile ? "pt-0" : "");

  const handleLinkedInConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI;
    const scope = "openid profile email";
    const state = "DCEeFWf45A53sdfKef424";
    
    if (!clientId || !redirectUri) {
      console.error("LinkedIn client ID or redirect URI is not configured in environment variables.");
      return;
    }

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      } ${bannerHeightClass}`}
      initial={{ y: (showBanner && !isMobile) ? 0 : -100 }}
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
            <div className="relative h-12 w-12 mr-2 bg-transparent">
              <Image 
                src="/images/camp-pool-logo.png" 
                alt="Camp Pool Logo" 
                fill
                style={{ objectFit: "cover" }} 
                priority
                className="drop-shadow-sm"
              />
            </div>
            <span className={`font-bold text-xl font-serif ${scrolled ? "text-[#4F9F86]" : "text-[#4F9F86]"}`}>
              Camp Pool
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <motion.a
                  key={link.id}
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
                  aria-label={`Scroll to ${link.name} section`}
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
            onClick={handleLinkedInConnect}
            className={`${
              scrolled ? "bg-[#4F9F86] hover:bg-[#4F9F86]/90" : "bg-[#4F9F86] hover:bg-[#4F9F86]/90"
            } text-white rounded-full group transition-all duration-300 transform hover:scale-105 hidden md:flex`}
          >
            <span>Connect with LinkedIn</span>
            <Linkedin className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
          </Button>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-button"
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <motion.div
          id="mobile-menu"
          className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="mobile-menu-button"
        >
          <div className="px-4 py-3 space-y-1 bg-white shadow-md">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block py-2 text-gray-700 hover:text-[#4F9F86]"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(link.ref)
                  setMobileMenuOpen(false)
                }}
                role="menuitem"
              >
                {link.name}
              </a>
            ))}
            <Button 
              onClick={handleLinkedInConnect}
              className="w-full mt-3 bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white rounded-full"
              role="menuitem"
            >
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
