"use client"

import type { LandingJob } from "@/lib/landing-data"

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function stableUnit(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function FloatingCards({ jobs }: { jobs: LandingJob[] }) {
  if (jobs.length === 0) return null
  const positions = [
    { top: 8, left: 2 }, { top: 55, left: 5 }, { top: 28, left: 78 },
    { top: 72, left: 82 }, { top: 15, left: 65 }, { top: 68, left: 22 },
    { top: 38, left: 88 }, { top: 82, left: 55 }, { top: 5, left: 42 },
    { top: 45, left: -3 },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {jobs.slice(0, 10).map((job, i) => {
        const pos = positions[i % positions.length]
        const h = hashString(job.id)
        const delay = stableUnit(h + i * 1337) * 8
        const dur = 10 + stableUnit(h + i * 7331) * 8
        return (
          <div
            key={`${job.id}-${i}`}
            className="absolute opacity-0 animate-float-card"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              animationDelay: `${delay.toFixed(1)}s`,
              animationDuration: `${dur.toFixed(1)}s`,
            }}
          >
            <div className="bg-white/50 backdrop-blur-md border border-gray-200/30 rounded-xl px-3.5 py-2 shadow-sm max-w-[190px]">
              <p className="text-[11px] font-medium text-gray-600 truncate">{job.title}</p>
              <p className="text-[10px] text-gray-400 truncate">{job.company_name}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
