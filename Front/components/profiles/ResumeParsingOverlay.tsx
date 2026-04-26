"use client"

import { useEffect, useState } from "react"

const PHRASES = [
  "Reading your life story…",
  "Counting years of experience…",
  "Detecting buzzwords…",
  "Judging your GitHub activity…",
  "Cross-referencing with LinkedIn…",
  "Calculating caffeine consumption…",
  "Extracting hidden talents…",
  "Decoding corporate jargon…",
  "Awarding bonus points for side projects…",
  "Checking if you really used Kubernetes…",
  "Translating «team player» to skills…",
  "Confirming you know React hooks…",
  "Verifying 10 years of Web3 experience…",
  "Googling your old company…",
  "Almost done, pinky promise…",
]

export function ResumeParsingOverlay() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  // Cycle through phrases
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % PHRASES.length)
        setVisible(true)
      }, 300)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  // Fake progress bar that fills to ~90% then stalls
  useEffect(() => {
    const steps = [
      { target: 15, delay: 300 },
      { target: 35, delay: 700 },
      { target: 55, delay: 1200 },
      { target: 72, delay: 2000 },
      { target: 84, delay: 3500 },
      { target: 90, delay: 5000 },
    ]
    const timers = steps.map(({ target, delay }) =>
      setTimeout(() => setProgress(target), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 px-8 max-w-sm w-full text-center">

        {/* Spinner */}
        <div className="relative h-20 w-20">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: "#7c3aed",
              borderRightColor: "#7c3aed",
              animation: "spin 0.9s linear infinite",
            }}
          />
          {/* Inner ring opposite direction */}
          <div
            className="absolute inset-3 rounded-full border-4 border-transparent"
            style={{
              borderBottomColor: "#3b82f6",
              borderLeftColor: "#3b82f6",
              animation: "spin 1.4s linear infinite reverse",
            }}
          />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="text-lg font-semibold text-gray-900 mb-1">Parsing your resume</p>
          <p className="text-sm text-gray-400">AI is reading every line…</p>
        </div>

        {/* Phrase */}
        <div className="h-7 flex items-center justify-center">
          <p
            className="text-sm font-medium text-purple-600 transition-all duration-300"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)" }}
          >
            {PHRASES[phraseIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #7c3aed, #3b82f6)",
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{progress}%</p>
        </div>

      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
