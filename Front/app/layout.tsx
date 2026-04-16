import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/Header"
import { GoogleAnalytics } from "@/components/GoogleAnalytics"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Job Board for Crypto & Web3 | 1000+ AI-Scored Jobs | Aipplify",
  description:
    "Find AI, Crypto & Web3 jobs with AI-powered quality scores. Apply with confidence to 1000+ verified positions from 420+ trusted companies. Remote & onsite.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <GoogleAnalytics />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
