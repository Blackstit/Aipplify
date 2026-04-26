interface BlogCoverProps {
  title: string
  category: string
  slug?: string
  size?: "card" | "hero"
}

type PatternType = "dots" | "diagonal" | "grid" | "plus" | "rings" | "stars"

interface CoverVariant {
  bg: string
  accent1: string
  accent2: string
  pattern: PatternType
  orbX: number
  orbY: number
  orbColor: string
  orbSize: number
  ring?: { cx: number; cy: number; r: number }
}

const VARIANTS: Record<string, CoverVariant> = {
  "AI Career": {
    bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)",
    accent1: "#818cf8",
    accent2: "#a78bfa",
    pattern: "dots",
    orbX: 85, orbY: -15, orbColor: "rgba(99,102,241,0.6)", orbSize: 65,
    ring: { cx: 370, cy: -30, r: 130 },
  },
  "Crypto Jobs": {
    bg: "linear-gradient(135deg, #1a0533 0%, #4c1d95 55%, #2e1065 100%)",
    accent1: "#c084fc",
    accent2: "#a855f7",
    pattern: "diagonal",
    orbX: -5, orbY: 90, orbColor: "rgba(168,85,247,0.6)", orbSize: 65,
    ring: { cx: -20, cy: 240, r: 110 },
  },
  "Productivity": {
    bg: "linear-gradient(135deg, #0a0a1a 0%, #0f2460 55%, #1a1a3e 100%)",
    accent1: "#60a5fa",
    accent2: "#818cf8",
    pattern: "grid",
    orbX: 90, orbY: 50, orbColor: "rgba(59,130,246,0.5)", orbSize: 60,
  },
  "Recruitment": {
    bg: "linear-gradient(135deg, #1a0030 0%, #581c87 50%, #701a75 100%)",
    accent1: "#f0abfc",
    accent2: "#e879f9",
    pattern: "plus",
    orbX: 10, orbY: 5, orbColor: "rgba(232,121,249,0.55)", orbSize: 60,
    ring: { cx: 40, cy: -30, r: 120 },
  },
  "Remote Work": {
    bg: "linear-gradient(135deg, #0a1628 0%, #0d3d56 50%, #1e2a4a 100%)",
    accent1: "#7dd3fc",
    accent2: "#a5b4fc",
    pattern: "rings",
    orbX: 100, orbY: 100, orbColor: "rgba(56,189,248,0.45)", orbSize: 70,
  },
  "Web3": {
    bg: "linear-gradient(135deg, #0d0520 0%, #2e1065 50%, #1a0533 100%)",
    accent1: "#c4b5fd",
    accent2: "#a5b4fc",
    pattern: "stars",
    orbX: 50, orbY: -10, orbColor: "rgba(192,132,252,0.5)", orbSize: 75,
  },
}

const VARIANT_LIST = Object.values(VARIANTS)

function slugHash(s: string): number {
  return Math.abs(s.split("").reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0))
}

function getVariant(category: string, slug: string): CoverVariant {
  return VARIANTS[category] ?? VARIANT_LIST[slugHash(slug || category) % VARIANT_LIST.length]
}

// --- Pattern renderers (SVG, viewBox 400×225) ---

function DotsPattern() {
  const dots = []
  for (let x = 12; x <= 400; x += 24) {
    for (let y = 12; y <= 225; y += 24) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill="white" fillOpacity={0.18} />)
    }
  }
  return <>{dots}</>
}

function DiagonalPattern() {
  const lines = []
  for (let s = -300; s <= 700; s += 30) {
    lines.push(
      <line key={`d${s}`} x1={s} y1={0} x2={s + 225} y2={225}
        stroke="white" strokeWidth={0.6} strokeOpacity={0.1} />
    )
  }
  return <>{lines}</>
}

function GridPattern() {
  const lines = []
  for (let x = 0; x <= 400; x += 40) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={225} stroke="white" strokeWidth={0.5} strokeOpacity={0.1} />)
  }
  for (let y = 0; y <= 225; y += 40) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={400} y2={y} stroke="white" strokeWidth={0.5} strokeOpacity={0.1} />)
  }
  return <>{lines}</>
}

function PlusPattern() {
  const items = []
  const arm = 5
  for (let x = 20; x <= 400; x += 38) {
    for (let y = 18; y <= 225; y += 38) {
      items.push(
        <g key={`${x}-${y}`}>
          <line x1={x - arm} y1={y} x2={x + arm} y2={y} stroke="white" strokeWidth={1} strokeOpacity={0.18} />
          <line x1={x} y1={y - arm} x2={x} y2={y + arm} stroke="white" strokeWidth={1} strokeOpacity={0.18} />
        </g>
      )
    }
  }
  return <>{items}</>
}

function RingsPattern() {
  const rings = []
  for (let r = 55; r <= 620; r += 50) {
    rings.push(
      <circle key={r} cx={400} cy={225} r={r}
        fill="none" stroke="white" strokeWidth={0.6} strokeOpacity={0.1} />
    )
  }
  return <>{rings}</>
}

function StarsPattern() {
  const stars: [number, number, number][] = [
    [28, 18, 1.8], [78, 42, 1.1], [145, 20, 2.0], [195, 55, 1.4], [278, 28, 1.8],
    [348, 14, 1.1], [388, 50, 2.0], [318, 78, 1.1], [248, 96, 1.8], [175, 118, 1.2],
    [98, 98, 2.0], [48, 128, 1.1], [118, 158, 1.8], [218, 168, 1.2], [298, 148, 2.2],
    [375, 128, 1.1], [338, 198, 1.8], [258, 208, 1.2], [158, 198, 1.4], [68, 188, 1.1],
    [18, 168, 2.0], [380, 108, 1.5], [228, 38, 1.3], [138, 82, 1.6],
  ]
  const conns: [number, number][] = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],
    [10,11],[11,12],[12,13],[13,14],[14,15],[14,16],[16,17],[17,18],
    [18,19],[19,20],[3,8],[4,8],[12,18],[21,6],[21,7],[22,2],[23,10],
  ]
  return (
    <>
      {conns.map(([a, b], i) => (
        <line key={`c${i}`}
          x1={stars[a][0]} y1={stars[a][1]}
          x2={stars[b][0]} y2={stars[b][1]}
          stroke="white" strokeWidth={0.35} strokeOpacity={0.18} />
      ))}
      {stars.map(([x, y, r], i) => (
        <circle key={`s${i}`} cx={x} cy={y} r={r} fill="white" fillOpacity={0.32} />
      ))}
    </>
  )
}

function renderPattern(type: PatternType) {
  switch (type) {
    case "dots": return <DotsPattern />
    case "diagonal": return <DiagonalPattern />
    case "grid": return <GridPattern />
    case "plus": return <PlusPattern />
    case "rings": return <RingsPattern />
    case "stars": return <StarsPattern />
  }
}

export function BlogCover({ title, category, slug = "", size = "card" }: BlogCoverProps) {
  const v = getVariant(category, slug)
  const isHero = size === "hero"

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: v.bg }}
      role="img"
      aria-label={`${category}: ${title}`}
    >
      {/* Pattern */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 225"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {renderPattern(v.pattern)}
        {v.ring && (
          <>
            <circle
              cx={v.ring.cx} cy={v.ring.cy} r={v.ring.r}
              fill="none" stroke={v.accent1} strokeWidth={1} strokeOpacity={0.22}
            />
            <circle
              cx={v.ring.cx} cy={v.ring.cy} r={v.ring.r * 0.62}
              fill="none" stroke={v.accent1} strokeWidth={0.6} strokeOpacity={0.12}
            />
          </>
        )}
      </svg>

      {/* Glow orb */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          left: `${v.orbX}%`,
          top: `${v.orbY}%`,
          transform: "translate(-50%, -50%)",
          width: `${v.orbSize}%`,
          aspectRatio: "1",
          background: `radial-gradient(ellipse at center, ${v.orbColor} 0%, transparent 70%)`,
          filter: "blur(22px)",
        }}
      />

      {/* Logo — top right */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/25 backdrop-blur-sm px-2 py-1 rounded-md">
        <div
          className="w-4 h-4 rounded-[3px] flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${v.accent1}, ${v.accent2})` }}
        />
        <span className="text-white/90 font-bold text-[11px] tracking-tight">
          Aipplify
        </span>
      </div>

      {/* Bottom scrim + category + title */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 pt-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
      >
        <span
          className="inline-block font-bold uppercase tracking-wider rounded mb-1.5"
          style={{
            fontSize: isHero ? "11px" : "9px",
            padding: isHero ? "3px 8px" : "2px 6px",
            background: `${v.accent1}20`,
            border: `1px solid ${v.accent1}55`,
            color: v.accent1,
          }}
        >
          {category}
        </span>
        <p
          className="text-white font-bold leading-snug line-clamp-2"
          style={{ fontSize: isHero ? "20px" : "13px", lineHeight: "1.3" }}
        >
          {title}
        </p>
      </div>
    </div>
  )
}
