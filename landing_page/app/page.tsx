"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Linkedin, MessageCircle, X, ChevronDown, Sparkles, Send } from "lucide-react"
import NetworkGraph from "@/components/network-graph"
import HowItWorks from "@/components/how-it-works"
import FloatingElements from "@/components/floating-elements"
import { useIsMobile } from "@/hooks/use-mobile"
import ScrollProgress from "@/components/scroll-progress"
import Navbar from "@/components/navbar"
import CampNetworkVisual from "@/components/camp-network-visual"
import VoiceConversationSection from "@/components/voice-conversation-section"
import posthog from 'posthog-js'

// --- Constants ---
const COOKIE_NAMES = {
  LINKEDIN_STATE: 'linkedin_oauth_state',
} as const;

const AUTH_STATUSES = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAILED: 'failed',
} as const;

const SECTIONS = {
  ABOUT: 'about',
  HOW_IT_WORKS: 'how-it-works',
  NETWORK: 'network',
  CONTACT: 'contact',
  WAITLIST: 'waitlist',
} as const;

// Helper function type for scrolling
type ScrollToSectionType = (ref: React.RefObject<HTMLDivElement | null>) => void;

// Helper function to generate a random string for the state parameter
const generateRandomString = (length: number): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(x => characters.charAt(x % characters.length))
    .join('');
};

// Helper function to set a secure cookie (client-side)
const setSecureCookie = (name: string, value: string, minutes: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (minutes * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  let cookieString = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
  if (process.env.NODE_ENV === 'production' || window.location.protocol === 'https:') {
    cookieString += '; Secure';
  }
  document.cookie = cookieString;
};

// 1. AnnouncementBanner Component
interface AnnouncementBannerProps {
  show: boolean;
  onClose: () => void;
}
const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ show, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        className="relative bg-[#4F9F86] text-white p-3 text-center z-[50]"
      >
        <div className="container mx-auto">
          <p className="font-medium">
            Connecting camp alumni across LinkedIn!{" "}
            <span className="hidden sm:inline">Join our growing community today! 🏕️</span>
          </p>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            aria-label="Close banner"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// 2. HeroContentLeft Component
interface HeroContentLeftProps {
  scrollToSection: ScrollToSectionType;
  howItWorksRef: React.RefObject<HTMLDivElement | null>;
  waitlistRef: React.RefObject<HTMLDivElement | null>;
  onLinkedInConnect: () => void;
}
const HeroContentLeft: React.FC<HeroContentLeftProps> = ({ 
  scrollToSection, 
  howItWorksRef, 
  waitlistRef,
  onLinkedInConnect 
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="lg:w-1/2 mb-10 lg:mb-0 relative z-10"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Badge className="mb-4 bg-[#4F9F86] hover:bg-[#4F9F86]/90 px-3 py-1.5 text-white rounded-full">
        AI Camp Connector
      </Badge>
    </motion.div>
    <motion.h1
      className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif leading-[1.2]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      Meet Lenny,<br />
      <span className="inline-block">Your Camp Connection Guide</span>
    </motion.h1>
    <motion.p
      className="text-lg mb-8 max-w-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.7 }}
    >
      Reconnect with your camp community through LinkedIn. Lenny has voice conversations to learn about you and
      introduces you to alumni you should meet - no new app needed.
    </motion.p>
    <motion.div
      className="flex flex-col sm:flex-row gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <Button 
        onClick={onLinkedInConnect}
        className="bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white rounded-full group transition-all duration-300 transform hover:scale-105">
        <span>Connect with LinkedIn</span>
        <Linkedin className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
      </Button>
      <Button
        variant="outline"
        className="border-[#4F9F86] text-[#4F9F86] rounded-full group transition-all duration-300 transform hover:scale-105 hover:bg-[#4F9F86]/10"
        onClick={() => scrollToSection(howItWorksRef)}
      >
        <span>Learn how Lenny works</span>
        <ChevronDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
      </Button>
      <Button
        variant="outline"
        className="border-[#F6BE46] text-[#F6BE46] rounded-full group transition-all duration-300 transform hover:scale-105 hover:bg-[#F6BE46]/10"
        onClick={() => scrollToSection(waitlistRef)}
      >
        <span>Join Waitlist</span>
        <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  </motion.div>
);

// 3. HeroVisualRight Component
const HeroVisualRight: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay: 0.4 }}
    className="lg:w-1/2 relative"
  >
    <div className="relative">
      <NetworkGraph />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 3,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <div className="absolute -top-6 right-0 transform translate-x-1/2">
            <Badge className="bg-green-500 text-white px-3 py-1 text-xs rounded-full flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              Always Online
            </Badge>
          </div>
          <Avatar className="h-32 w-32 border-4 border-white shadow-xl rounded-full overflow-hidden pulse">
            <Image
              src="/images/lenny-logo.png"
              alt="Lenny"
              fill
              sizes="128px"
              priority
              style={{ objectFit: "cover" }}
            />
          </Avatar>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// 4. NetworkSectionContent Component (includes FeatureItem)
interface FeatureItemProps {
  text: string;
  delay: number;
}
const FeatureItem: React.FC<FeatureItemProps> = ({ text, delay }) => (
  <motion.div
    className="flex items-start gap-3"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
  >
    <div className="mt-1 text-[#4F9F86]">
      <Sparkles size={18} />
    </div>
    <p className="text-gray-700">{text}</p>
  </motion.div>
);

const NetworkSectionContent: React.FC = () => {
  const features = [
    "Connect with alumni from your specific camp",
    "Find mentors, collaborators, or new team members",
    "Expand your professional network through trusted camp connections",
    "Receive personalized introductions based on your goals",
  ];

  return (
    <motion.div
      className="lg:w-1/2"
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">Your Camp Network</h2>
      <p className="text-lg mb-6 text-gray-700">
        Lenny helps you build meaningful connections with fellow camp alumni who share your professional
        interests and goals.
      </p>
      <div className="space-y-4">
        {features.map((feature, i) => (
          <FeatureItem key={i} text={feature} delay={i * 0.1} />
        ))}
      </div>
    </motion.div>
  );
};

// 5. ContactCTAContent Component
const ContactCTAContent: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="max-w-3xl mx-auto"
  >
    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white font-serif">
      Ready to reconnect through voice conversations?
    </h2>
    <p className="text-lg mb-8 text-white/90">
      Let Lenny guide you to meaningful connections with fellow alumni on LinkedIn through natural voice
      interactions.
    </p>
    <Button
      size="lg"
      className="bg-[#F6BE46] hover:bg-[#F6BE46]/90 text-[#4F9F86] font-medium rounded-full px-8 py-6 text-lg group transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      Chat with Lenny on LinkedIn
      <MessageCircle className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
    </Button>
  </motion.div>
);

export default function Home() {
  const isMobile = useIsMobile()
  const [showBanner, setShowBanner] = useState(true)
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const searchParams = useSearchParams()

  // Refs for scrolling to sections
  const aboutRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const waitlistRef = useRef<HTMLDivElement>(null)

  // Effects for LinkedIn auth status and footer year
  useEffect(() => {
    const handleAuthStatus = () => {
      const status = searchParams.get('linkedin_auth_status');
      const error = searchParams.get('linkedin_error');
      const errorDescription = searchParams.get('linkedin_error_description');

      if (status === AUTH_STATUSES.SUCCESS) {
        toast.success('Successfully connected with LinkedIn!');
      } else if (status === AUTH_STATUSES.ERROR || status === AUTH_STATUSES.FAILED) {
        toast.error(errorDescription || error || 'Failed to connect with LinkedIn. Please try again.');
      }
      // Clean up URL by removing query parameters after processing
      // This prevents the toast from re-appearing on page refresh if params are still there
      if (status || error || errorDescription) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('linkedin_auth_status');
        currentUrl.searchParams.delete('linkedin_error');
        currentUrl.searchParams.delete('linkedin_error_description');
        window.history.replaceState({}, document.title, currentUrl.pathname + currentUrl.search);
      }
    };

    handleAuthStatus();
    setCurrentYear(new Date().getFullYear());
  }, [searchParams]);

  const scrollToSection: ScrollToSectionType = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleLinkedInConnect = async () => {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI;
    const scope = "openid profile email";
    
    if (!clientId || !redirectUri) {
      console.error("LinkedIn client ID or redirect URI is not configured in environment variables.");
      toast.error("LinkedIn connection is currently unavailable. Please try again later or contact support if the issue persists.");
      return;
    }
    
    const state = generateRandomString(32);
    setSecureCookie(COOKIE_NAMES.LINKEDIN_STATE, state, 5);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope,
    });
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    window.location.href = authUrl;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF9E3] to-[#82AFA9]/20 relative overflow-hidden">
      <Navbar
        scrollToSection={scrollToSection}
        aboutRef={aboutRef}
        howItWorksRef={howItWorksRef}
        networkRef={networkRef}
        contactRef={contactRef}
        onLinkedInConnect={handleLinkedInConnect}
      />
      <FloatingElements />
      <ScrollProgress />

      <AnnouncementBanner show={showBanner} onClose={() => setShowBanner(false)} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-28 pb-24 flex flex-col lg:flex-row items-center relative">
        <HeroContentLeft 
          scrollToSection={scrollToSection} 
          howItWorksRef={howItWorksRef}
          waitlistRef={waitlistRef}
          onLinkedInConnect={handleLinkedInConnect}
        />
        <HeroVisualRight />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-[#4F9F86]"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </motion.div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="py-20 relative overflow-hidden">
        <motion.div
          className="container mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <VoiceConversationSection />
        </motion.div>
      </section>

      {/* How Lenny Works */}
      <div ref={howItWorksRef} id="how-it-works">
        <HowItWorks />
      </div>

      {/* Network Section */}
      <section ref={networkRef} id="network" className="py-20 bg-[#FFF9E3]/70 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <NetworkSectionContent />
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <CampNetworkVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section ref={contactRef} id="contact" className="py-20 bg-[#4F9F86] relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <ContactCTAContent />
        </div>
      </section>

      {/* Waitlist Section */}
      <section ref={waitlistRef} id="waitlist" className="py-16 container mx-auto px-4">
        <WaitlistSignup />
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-t from-[#FFF9E3]/50 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="mt-8 pt-8 border-t border-[#4F9F86]/20 text-sm text-gray-600">
            {currentYear && <p>© {currentYear} Camp Pool. All rights reserved.</p>}
          </div>
        </div>
      </footer>
    </main>
  )
}

export function WaitlistSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already_exists">("idle");
  const [message, setMessage] = useState(""); // Combined state for error or success messages

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    if (!validateEmail(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      
      if (response.status === 200 && data.message === "Email already on waitlist") {
        setStatus("already_exists");
        setMessage("This email is already on our waitlist! We'll keep you posted.");
        posthog.capture('waitlist_already_joined', {
          email: email,
          message: data.message
        });
        setEmail(""); // Clear email input
      } else if (data.success) {
        setStatus("success");
        setMessage(data.message || "You're on the list! We'll keep you posted.");
        posthog.capture('waitlist_signup_success', {
          email: email,
          message: data.message
        });
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "An unexpected issue occurred. Please try again.");
      }

    } catch (error) {
      setStatus("error");
      setMessage("Failed to connect to the server. Please check your internet connection and try again.");
      console.error("Waitlist signup error:", error);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 border border-[#4F9F86]/20"
      >
        <h3 className="text-xl font-bold mb-4 text-[#4F9F86] font-serif">Join our waitlist!</h3>
        
        {status === "success" || status === "already_exists" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className={`w-16 h-16 ${status === "success" ? "bg-[#4F9F86]" : "bg-blue-500"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {status === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : ( // "already_exists" icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-lg font-medium">{status === "success" ? "You're on the list! 🎉" : "You're already on the list!"}</p>
            <p className="text-gray-600 mt-2">{message}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F9F86] focus:border-transparent"
                aria-required="true"
                aria-invalid={status === "error"}
                aria-describedby={status === "error" || status === "loading" ? "status-message" : undefined}
                disabled={status === "loading"}
              />
              {(status === "error" || (status === "loading" && !message) ) && (
                <p id="status-message" className={`mt-2 text-sm ${status === "error" ? "text-red-600" : "text-gray-600"}`} role={status === "error" ? "alert": "status"}>
                  {status === "loading" && !message ? "Submitting..." : message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white rounded-full group transition-all duration-300 transform hover:scale-105 flex justify-center py-3"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : (
                <>
                  Join the Waitlist
                  <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
