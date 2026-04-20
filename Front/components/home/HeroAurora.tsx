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
  radius: number
  /** optional planet riding this orbit; if absent it's decorative */
  planet?: { size: number; theme: ThemeKey }
  /** CSS duration, e.g. "32s" */
  duration?: string
  /** Negative delay starts mid-orbit — so planets don't all line up */
  delay?: string
  /** 0..1, how visible the orbit line is */
  lineOpacity?: number
  /** spin direction */
  reverse?: boolean
}

type System = {
  /** center of the orbital system, % relative to hero */
  top: string
  left: string
  orbits: Orbit[]
}

// All centers sit in the corners / outer 15–18% of the hero,
// so planets stay well away from the central text.
const SYSTEMS: System[] = [
  {
    top: "18%",
    left: "9%",
    orbits: [
      { radius: 60,  planet: { size: 14, theme: "violetLight" }, duration: "28s", delay: "-6s",  lineOpacity: 0.22 },
      { radius: 110, planet: { size: 22, theme: "indigo" },      duration: "48s", delay: "-14s", lineOpacity: 0.15, reverse: true },
      { radius: 170,                                              lineOpacity: 0.08 },
    ],
  },
  {
    top: "16%",
    left: "91%",
    orbits: [
      { radius: 70,  planet: { size: 16, theme: "fuchsia" },    duration: "32s", delay: "-4s",  lineOpacity: 0.2 },
      { radius: 130, planet: { size: 26, theme: "purple" },     duration: "56s", delay: "-22s", lineOpacity: 0.12 },
    ],
  },
  {
    top: "82%",
    left: "10%",
    orbits: [
      { radius: 55,  planet: { size: 12, theme: "pink" },       duration: "24s", delay: "-3s",  lineOpacity: 0.22, reverse: true },
      { radius: 105,                                              lineOpacity: 0.1 },
    ],
  },
  {
    top: "80%",
    left: "90%",
    orbits: [
      { radius: 85,  planet: { size: 20, theme: "violetDark" }, duration: "40s", delay: "-11s", lineOpacity: 0.18 },
      { radius: 140, planet: { size: 14, theme: "indigo" },     duration: "62s", delay: "-26s", lineOpacity: 0.1,  reverse: true },
    ],
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
      {/* specular highlight */}
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

function OrbitalSystem({ system }: { system: System }) {
  return (
    <div
      className="absolute"
      style={{
        top: system.top,
        left: system.left,
        width: 0,
        height: 0,
      }}
    >
      {system.orbits.map((o, i) => (
        <div key={i}>
          {/* The visible orbit line — thin, faint, dashed-less ring */}
          <div
            className="absolute rounded-full"
            style={{
              top: -o.radius,
              left: -o.radius,
              width: o.radius * 2,
              height: o.radius * 2,
              border: `1px solid rgba(167, 139, 250, ${o.lineOpacity ?? 0.15})`,
              boxShadow: `0 0 1px rgba(167,139,250, ${(o.lineOpacity ?? 0.15) * 0.8}) inset`,
            }}
          />
          {/* Rotating pivot (0x0) that carries the planet around the center */}
          {o.planet && (
            <div
              className={o.reverse ? "orbit-spin-reverse" : "orbit-spin"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                animationDuration: o.duration ?? "40s",
                animationDelay: o.delay,
                willChange: "transform",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: o.radius,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Planet size={o.planet.size} theme={o.planet.theme} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function HeroAurora() {
  const stars = [
    { top: "12%", left: "24%", size: 2,   delay: "0s",   dur: "3.6s" },
    { top: "24%", left: "72%", size: 1.5, delay: "0.9s", dur: "4.2s" },
    { top: "35%", left: "16%", size: 2,   delay: "1.8s", dur: "3.2s" },
    { top: "50%", left: "88%", size: 2,   delay: "0.4s", dur: "5.0s" },
    { top: "64%", left: "30%", size: 1.5, delay: "2.4s", dur: "3.8s" },
    { top: "72%", left: "62%", size: 2,   delay: "1.1s", dur: "4.6s" },
    { top: "18%", left: "46%", size: 1.5, delay: "2.8s", dur: "3.4s" },
    { top: "86%", left: "44%", size: 1.5, delay: "1.6s", dur: "4.0s" },
    { top: "6%",  left: "78%", size: 2,   delay: "3.1s", dur: "3.6s" },
    { top: "56%", left: "24%", size: 1.5, delay: "0.2s", dur: "4.4s" },
    { top: "92%", left: "70%", size: 1.5, delay: "2.0s", dur: "3.0s" },
    { top: "42%", left: "54%", size: 1,   delay: "1.4s", dur: "4.8s" },
  ]

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Very faint spotlight wash from top — depth without drama */}
      <div
        className="absolute -top-1/3 left-0 right-0 h-[60%]"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 40%, rgba(139,92,246,0.08) 0%, transparent 65%)",
          filter: "blur(16px)",
        }}
      />

      {/* Tiny stars */}
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

      {/* Orbital systems in the four corner regions */}
      {SYSTEMS.map((sys, i) => (
        <OrbitalSystem key={i} system={sys} />
      ))}

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
