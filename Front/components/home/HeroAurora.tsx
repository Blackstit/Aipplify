type PlanetTheme = {
  surface: string
  halo: string
  rimLight: string
}

const THEMES: Record<string, PlanetTheme> = {
  violetDark: {
    surface:
      "radial-gradient(circle at 30% 25%, #c4b5fd 0%, #8b5cf6 32%, #5b21b6 65%, #2e1065 100%)",
    halo: "rgba(139, 92, 246, 0.55)",
    rimLight: "rgba(196, 181, 253, 0.9)",
  },
  violetLight: {
    surface:
      "radial-gradient(circle at 30% 25%, #ede9fe 0%, #c4b5fd 30%, #8b5cf6 65%, #4c1d95 100%)",
    halo: "rgba(167, 139, 250, 0.55)",
    rimLight: "rgba(221, 214, 254, 0.95)",
  },
  indigo: {
    surface:
      "radial-gradient(circle at 30% 25%, #a5b4fc 0%, #6366f1 35%, #3730a3 70%, #1e1b4b 100%)",
    halo: "rgba(99, 102, 241, 0.55)",
    rimLight: "rgba(165, 180, 252, 0.9)",
  },
  purple: {
    surface:
      "radial-gradient(circle at 30% 25%, #d8b4fe 0%, #a855f7 35%, #6d28d9 70%, #3b0764 100%)",
    halo: "rgba(168, 85, 247, 0.6)",
    rimLight: "rgba(216, 180, 254, 0.95)",
  },
  fuchsia: {
    surface:
      "radial-gradient(circle at 30% 25%, #f0abfc 0%, #c026d3 40%, #86198f 75%, #4a044e 100%)",
    halo: "rgba(192, 38, 211, 0.55)",
    rimLight: "rgba(240, 171, 252, 0.95)",
  },
  pink: {
    surface:
      "radial-gradient(circle at 30% 25%, #fbcfe8 0%, #ec4899 40%, #9d174d 75%, #500724 100%)",
    halo: "rgba(236, 72, 153, 0.5)",
    rimLight: "rgba(251, 207, 232, 0.95)",
  },
}

type PlanetDef = {
  top: string
  left: string
  size: number
  theme: keyof typeof THEMES
  drift: "orb-a" | "orb-b" | "orb-c" | "orb-d"
  delay?: string
  duration?: string
  hasRing?: boolean
}

const PLANETS: PlanetDef[] = [
  { top: "16%",  left: "6%",  size: 128, theme: "violetDark",  drift: "orb-a",                duration: "22s" },
  { top: "60%",  left: "4%",  size: 72,  theme: "fuchsia",     drift: "orb-b", delay: "-4s",  duration: "18s" },
  { top: "22%",  left: "80%", size: 150, theme: "indigo",      drift: "orb-c", hasRing: true, duration: "28s" },
  { top: "70%",  left: "86%", size: 92,  theme: "purple",      drift: "orb-a", delay: "-10s", duration: "24s" },
  { top: "82%",  left: "22%", size: 58,  theme: "pink",        drift: "orb-d", delay: "-2s",  duration: "14s" },
  { top: "34%",  left: "66%", size: 44,  theme: "violetLight", drift: "orb-b", delay: "-8s",  duration: "16s" },
  { top: "8%",   left: "52%", size: 34,  theme: "indigo",      drift: "orb-d", delay: "-5s",  duration: "12s" },
  { top: "52%",  left: "48%", size: 28,  theme: "purple",      drift: "orb-c", delay: "-11s", duration: "15s" },
]

function Planet({ p }: { p: PlanetDef }) {
  const theme = THEMES[p.theme]
  const haloScale = 1.8

  return (
    <div
      className={`absolute ${p.drift} will-change-transform`}
      style={{
        top: p.top,
        left: p.left,
        width: p.size,
        height: p.size,
        animationDelay: p.delay,
        animationDuration: p.duration,
      }}
    >
      {/* Outer soft glow halo */}
      <div
        className="absolute rounded-full"
        style={{
          top: "50%",
          left: "50%",
          width: p.size * haloScale,
          height: p.size * haloScale,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${theme.halo} 0%, transparent 65%)`,
          filter: "blur(12px)",
        }}
      />

      {/* Optional orbit ring (Saturn-style) */}
      {p.hasRing && (
        <div
          className="absolute rounded-full border border-white/25"
          style={{
            top: "50%",
            left: "50%",
            width: p.size * 1.55,
            height: p.size * 0.32,
            transform: "translate(-50%, -50%) rotate(-22deg)",
            boxShadow:
              "0 0 18px rgba(196,181,253,0.35), inset 0 0 12px rgba(255,255,255,0.18)",
          }}
        />
      )}

      {/* The planet itself */}
      <div
        className="relative rounded-full"
        style={{
          width: "100%",
          height: "100%",
          background: theme.surface,
          boxShadow: [
            // terminator / core shadow
            `inset ${-p.size * 0.08}px ${-p.size * 0.12}px ${p.size * 0.35}px rgba(0,0,0,0.45)`,
            // subtle inner rim light on upper-left
            `inset ${p.size * 0.04}px ${p.size * 0.05}px ${p.size * 0.18}px rgba(255,255,255,0.15)`,
            // outer drop shadow + colored glow
            `0 ${p.size * 0.15}px ${p.size * 0.35}px -${p.size * 0.1}px ${theme.halo}`,
          ].join(", "),
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "10%",
            left: "20%",
            width: "38%",
            height: "28%",
            background: `radial-gradient(ellipse at center, ${theme.rimLight} 0%, transparent 70%)`,
            filter: "blur(2px)",
          }}
        />
        {/* Tiny secondary highlight */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "18%",
            left: "32%",
            width: "12%",
            height: "12%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)",
            filter: "blur(0.5px)",
          }}
        />
      </div>
    </div>
  )
}

export function HeroAurora() {
  const stars = [
    { top: "12%", left: "18%", size: 3,   delay: "0s",   dur: "3.6s" },
    { top: "22%", left: "74%", size: 2,   delay: "0.9s", dur: "4.2s" },
    { top: "35%", left: "12%", size: 2,   delay: "1.8s", dur: "3.2s" },
    { top: "48%", left: "92%", size: 2.5, delay: "0.4s", dur: "5.0s" },
    { top: "62%", left: "30%", size: 2,   delay: "2.4s", dur: "3.8s" },
    { top: "70%", left: "62%", size: 3,   delay: "1.1s", dur: "4.6s" },
    { top: "18%", left: "46%", size: 2,   delay: "2.8s", dur: "3.4s" },
    { top: "80%", left: "8%",  size: 2.5, delay: "1.6s", dur: "4.0s" },
    { top: "6%",  left: "88%", size: 2,   delay: "3.1s", dur: "3.6s" },
    { top: "54%", left: "26%", size: 2,   delay: "0.2s", dur: "4.4s" },
    { top: "90%", left: "50%", size: 2,   delay: "2.0s", dur: "3.0s" },
    { top: "40%", left: "58%", size: 1.5, delay: "1.4s", dur: "4.8s" },
  ]

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Faint top spotlight — adds depth without fighting the planets */}
      <div
        className="absolute -top-1/3 left-0 right-0 h-[70%] spotlight-sweep"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 40%, rgba(139,92,246,0.14) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      {/* Twinkling stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-white twinkle shadow-[0_0_8px_rgba(167,139,250,0.8)]"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}

      {/* The planets */}
      {PLANETS.map((p, i) => (
        <Planet key={i} p={p} />
      ))}

      {/* Subtle noise texture — adds "filmic" grain, kills banding */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  )
}
