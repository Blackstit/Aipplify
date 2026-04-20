import type { CSSProperties } from "react"

type PlanetTheme = {
  surface: string
  halo: string
  rimLight: string
}

const THEMES: Record<string, PlanetTheme> = {
  violetDark: {
    surface:
      "radial-gradient(circle at 30% 25%, #c4b5fd 0%, #8b5cf6 32%, #5b21b6 65%, #2e1065 100%)",
    halo: "rgba(139, 92, 246, 0.45)",
    rimLight: "rgba(221, 214, 254, 0.95)",
  },
  violetLight: {
    surface:
      "radial-gradient(circle at 30% 25%, #ede9fe 0%, #c4b5fd 30%, #8b5cf6 65%, #4c1d95 100%)",
    halo: "rgba(167, 139, 250, 0.45)",
    rimLight: "rgba(237, 233, 254, 0.95)",
  },
  indigo: {
    surface:
      "radial-gradient(circle at 30% 25%, #a5b4fc 0%, #6366f1 35%, #3730a3 70%, #1e1b4b 100%)",
    halo: "rgba(99, 102, 241, 0.4)",
    rimLight: "rgba(199, 210, 254, 0.95)",
  },
  purple: {
    surface:
      "radial-gradient(circle at 30% 25%, #d8b4fe 0%, #a855f7 35%, #6d28d9 70%, #3b0764 100%)",
    halo: "rgba(168, 85, 247, 0.45)",
    rimLight: "rgba(233, 213, 255, 0.95)",
  },
  fuchsia: {
    surface:
      "radial-gradient(circle at 30% 25%, #f0abfc 0%, #c026d3 40%, #86198f 75%, #4a044e 100%)",
    halo: "rgba(192, 38, 211, 0.4)",
    rimLight: "rgba(245, 208, 254, 0.95)",
  },
  pink: {
    surface:
      "radial-gradient(circle at 30% 25%, #fbcfe8 0%, #ec4899 40%, #9d174d 75%, #500724 100%)",
    halo: "rgba(236, 72, 153, 0.4)",
    rimLight: "rgba(251, 207, 232, 0.95)",
  },
}

type ThemeKey = keyof typeof THEMES

type Orbit = {
  /** center x, as %  */
  cx: number
  /** center y, as %  */
  cy: number
  /** x radius, as % of hero width  */
  rx: number
  /** y radius, as % of hero height */
  ry: number
  /** orbit line opacity (0–1) */
  opacity: number
  planet?: {
    size: number
    theme: ThemeKey
    duration: string
    delay?: string
    reverse?: boolean
  }
}

// Orbits chosen so the VISIBLE curve avoids the central text zone
// (roughly x 15–85%, y 22–75%).
// - Giant ellipses centered at 50%/50% with rx ≥ 55 → left/right arcs
//   go off-screen, top/bottom arcs pass above/below the text.
// - Flat wide orbits at y ≈ 13% and y ≈ 88% live entirely in the top
//   and bottom strips.
const ORBITS: Orbit[] = [
  {
    cx: 50, cy: 50, rx: 62, ry: 42, opacity: 0.12,
    planet: { size: 22, theme: "violetDark", duration: "68s", delay: "-18s" },
  },
  {
    cx: 50, cy: 50, rx: 55, ry: 37, opacity: 0.1,
    planet: { size: 16, theme: "indigo", duration: "52s", delay: "-8s", reverse: true },
  },
  {
    cx: 50, cy: 13, rx: 44, ry: 5, opacity: 0.2,
    planet: { size: 12, theme: "fuchsia", duration: "34s", delay: "-6s" },
  },
  {
    cx: 50, cy: 87, rx: 46, ry: 5, opacity: 0.18,
    planet: { size: 14, theme: "purple", duration: "38s", delay: "-14s", reverse: true },
  },
  {
    cx: 50, cy: 50, rx: 68, ry: 46, opacity: 0.06,
    // decorative — no planet
  },
]

function Planet({ size, theme }: { size: number; theme: ThemeKey }) {
  const t = THEMES[theme]
  return (
    <div
      className="relative rounded-full"
      style={{
        width: size,
        height: size,
        background: t.surface,
        boxShadow: [
          `inset ${-size * 0.1}px ${-size * 0.14}px ${size * 0.4}px rgba(0,0,0,0.45)`,
          `inset ${size * 0.04}px ${size * 0.05}px ${size * 0.18}px rgba(255,255,255,0.18)`,
          `0 ${size * 0.15}px ${size * 0.35}px -${size * 0.1}px ${t.halo}`,
          `0 0 ${size * 0.9}px ${t.halo}`,
        ].join(", "),
      }}
    >
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: "12%",
          left: "20%",
          width: "38%",
          height: "28%",
          background: `radial-gradient(ellipse at center, ${t.rimLight} 0%, transparent 70%)`,
          filter: "blur(1.5px)",
        }}
      />
    </div>
  )
}

export function HeroAurora() {
  const stars = [
    { top: "12%", left: "24%", size: 2,   delay: "0s",   dur: "3.6s" },
    { top: "24%", left: "72%", size: 1.5, delay: "0.9s", dur: "4.2s" },
    { top: "35%", left: "10%", size: 2,   delay: "1.8s", dur: "3.2s" },
    { top: "50%", left: "92%", size: 2,   delay: "0.4s", dur: "5.0s" },
    { top: "64%", left: "30%", size: 1.5, delay: "2.4s", dur: "3.8s" },
    { top: "72%", left: "64%", size: 2,   delay: "1.1s", dur: "4.6s" },
    { top: "18%", left: "46%", size: 1.5, delay: "2.8s", dur: "3.4s" },
    { top: "86%", left: "22%", size: 1.5, delay: "1.6s", dur: "4.0s" },
    { top: "6%",  left: "78%", size: 2,   delay: "3.1s", dur: "3.6s" },
    { top: "56%", left: "8%",  size: 1.5, delay: "0.2s", dur: "4.4s" },
    { top: "92%", left: "70%", size: 1.5, delay: "2.0s", dur: "3.0s" },
    { top: "42%", left: "96%", size: 1,   delay: "1.4s", dur: "4.8s" },
  ]

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Very soft violet wash from top */}
      <div
        className="absolute -top-1/3 left-0 right-0 h-[60%]"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 40%, rgba(139,92,246,0.09) 0%, transparent 65%)",
          filter: "blur(16px)",
        }}
      />

      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-white twinkle shadow-[0_0_6px_rgba(167,139,250,0.7)]"
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

      {/* Orbit lines drawn as stretched SVG ellipses — strokes stay 1px */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {ORBITS.map((o, i) => (
          <ellipse
            key={i}
            cx={o.cx}
            cy={o.cy}
            rx={o.rx}
            ry={o.ry}
            fill="none"
            stroke={`rgba(167, 139, 250, ${o.opacity})`}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Planets — each rides its orbit via CSS offset-path: ellipse() */}
      {ORBITS.map((o, i) => {
        if (!o.planet) return null
        const style: CSSProperties & {
          offsetPath?: string
          offsetDistance?: string
          offsetRotate?: string
        } = {
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          offsetPath: `ellipse(${o.rx}% ${o.ry}% at ${o.cx}% ${o.cy}%)`,
          offsetDistance: "0%",
          offsetRotate: "0deg",
          animationName: "orbit-travel",
          animationDuration: o.planet.duration,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: o.planet.reverse ? "reverse" : "normal",
          animationDelay: o.planet.delay,
          willChange: "offset-distance",
        }
        return (
          <div key={`p-${i}`} style={style}>
            <div
              style={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Planet size={o.planet.size} theme={o.planet.theme} />
            </div>
          </div>
        )
      })}

      {/* Filmic noise */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  )
}
