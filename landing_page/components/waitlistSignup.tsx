"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // Assuming you have this shadcn/ui component
import { Send } from "lucide-react";
import posthog from 'posthog-js'; // Assuming posthog is initialized elsewhere (e.g., in a provider)

export default function WaitlistSignup() {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already_exists">("idle");
  const [message, setMessage] = useState<string>("");

  const validateEmail = (emailToValidate: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    if (!validateEmail(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    
    try {
      // Ensure this API endpoint exists in your Next.js app (e.g., app/api/waitlist/route.ts)
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        posthog.capture('waitlist_signup_error', {
          email: email,
          error_message: data.error || "Something went wrong",
          status_code: response.status
        });
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
        // Fallback for unexpected successful responses without a clear success/already_exists marker
        setStatus("error");
        setMessage(data.message || "An unexpected issue occurred. Please try again.");
        posthog.capture('waitlist_signup_unexpected_response', {
          email: email,
          response_data: data
        });
      }

    } catch (error) {
      setStatus("error");
      setMessage("Failed to connect to the server. Please check your internet connection and try again.");
      console.error("Waitlist signup error:", error);
      posthog.capture('waitlist_signup_network_error', {
        email: email,
        error_details: error instanceof Error ? error.message : String(error)
      });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#4F9F86]/20" // Added sm:p-8 for slightly more padding on small screens and up
      >
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[#4F9F86] font-serif text-center sm:text-left"> {/* Centered on mobile, left on sm+ */}
          Join our waitlist!
        </h3>
        
        {status === "success" || status === "already_exists" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className={`w-16 h-16 ${status === "success" ? "bg-[#4F9F86]" : "bg-blue-500"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {status === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : ( // "already_exists" icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-lg font-medium text-gray-800">{status === "success" ? "You're on the list! 🎉" : "You're already on the list!"}</p>
            <p className="text-gray-600 mt-2">{message}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="waitlist-email" className="sr-only">Email address</label> {/* Changed id for uniqueness */}
              <input
                id="waitlist-email" // Unique ID
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F9F86] focus:border-transparent transition-colors duration-200"
                aria-required="true"
                aria-invalid={status === "error" ? "true" : "false"} // Changed to string "true" or "false"
                aria-describedby={status === "error" || status === "loading" ? "waitlist-status-message" : undefined} // Unique ID
                disabled={status === "loading"}
              />
              {/* Status message display */}
              {(status === "error" || status === "loading") && message && (
                <p 
                  id="waitlist-status-message" 
                  className={`mt-2 text-sm ${status === "error" ? "text-red-600" : "text-gray-600"}`} 
                  role={status === "error" ? "alert" : "status"} // This dynamic role assignment is generally fine.
                >
                  {message}
                </p>
              )}
               {/* Explicitly show "Submitting..." when loading and no other message is set yet */}
              {status === "loading" && !message && (
                 <p id="waitlist-status-message-loading" className="mt-2 text-sm text-gray-600" role="status">
                  Submitting...
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white rounded-full group transition-all duration-300 transform hover:scale-105 flex justify-center items-center py-3 text-base" // Ensure items-center for spinner
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
