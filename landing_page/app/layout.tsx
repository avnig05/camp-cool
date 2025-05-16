import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Lenny - Your Camp Connection Guide",
  description: "Reconnect with your camp community through LinkedIn with Lenny, your AI camp connection guide.",
  keywords: "camp, alumni, connections, networking, LinkedIn, voice AI",
  openGraph: {
    title: "Lenny - Your Camp Connection Guide",
    description: "Reconnect with your camp community through LinkedIn with Lenny, your AI camp connection guide.",
    url: "https://lennyapp.com", // Replace with your actual URL
    siteName: "Lenny",
    images: [
      {
        url: "/images/lenny-og.png", // Create this image if it doesn't exist
        width: 1200,
        height: 630,
        alt: "Lenny - Your Camp Connection Guide",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lenny - Your Camp Connection Guide",
    description: "Reconnect with your camp community through LinkedIn with Lenny, your AI camp connection guide.",
    images: ["/images/lenny-og.png"], // Same as OpenGraph image
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  generator: 'v0.dev',
  metadataBase: new URL('https://camp-cool.vercel.app'), // Update with your actual production URL
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
