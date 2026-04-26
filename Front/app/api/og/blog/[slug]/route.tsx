import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { getBlogPostBySlug } from "@/lib/mockBlog"

export const runtime = "nodejs"

const W = 1200
const H = 628

type Config = {
  bg: string
  accent1: string
  accent2: string
  orbLeft: number
  orbTop: number
  orbSize: number
  orbColor: string
  ring?: { cx: number; cy: number; r: number }
  pattern: "dots" | "diagonal" | "grid" | "plus" | "rings" | "stars"
}

const CONFIGS: Record<string, Config> = {
  "AI Career": {
    bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)",
    accent1: "#818cf8", accent2: "#a78bfa",
    orbLeft: 0.82, orbTop: -0.2, orbSize: 0.65, orbColor: "rgba(99,102,241,0.45)",
    pattern: "dots", ring: { cx: 1110, cy: -50, r: 380 },
  },
  "Crypto Jobs": {
    bg: "linear-gradient(135deg, #1a0533 0%, #4c1d95 55%, #2e1065 100%)",
    accent1: "#c084fc", accent2: "#a855f7",
    orbLeft: -0.05, orbTop: 0.85, orbSize: 0.65, orbColor: "rgba(168,85,247,0.45)",
    pattern: "diagonal", ring: { cx: -60, cy: H + 50, r: 310 },
  },
  "Productivity": {
    bg: "linear-gradient(135deg, #0a0a1a 0%, #0f2460 55%, #1a1a3e 100%)",
    accent1: "#60a5fa", accent2: "#818cf8",
    orbLeft: 0.9, orbTop: 0.5, orbSize: 0.6, orbColor: "rgba(59,130,246,0.4)",
    pattern: "grid",
  },
  "Recruitment": {
    bg: "linear-gradient(135deg, #1a0030 0%, #581c87 50%, #701a75 100%)",
    accent1: "#f0abfc", accent2: "#e879f9",
    orbLeft: 0.05, orbTop: -0.12, orbSize: 0.6, orbColor: "rgba(232,121,249,0.45)",
    pattern: "plus", ring: { cx: 130, cy: -100, r: 350 },
  },
  "Remote Work": {
    bg: "linear-gradient(135deg, #0a1628 0%, #0d3d56 50%, #1e2a4a 100%)",
    accent1: "#7dd3fc", accent2: "#a5b4fc",
    orbLeft: 1.0, orbTop: 1.05, orbSize: 0.7, orbColor: "rgba(56,189,248,0.38)",
    pattern: "rings",
  },
  "Web3": {
    bg: "linear-gradient(135deg, #0d0520 0%, #2e1065 50%, #1a0533 100%)",
    accent1: "#c4b5fd", accent2: "#a5b4fc",
    orbLeft: 0.5, orbTop: -0.15, orbSize: 0.75, orbColor: "rgba(192,132,252,0.42)",
    pattern: "stars",
  },
}

const CONFIG_LIST = Object.values(CONFIGS)

function slugHash(s: string) {
  return Math.abs(s.split("").reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0))
}

function getConfig(category: string, slug: string): Config {
  return CONFIGS[category] ?? CONFIG_LIST[slugHash(slug || category) % CONFIG_LIST.length]
}

// Build pattern elements as plain arrays — Satori needs flat, no Fragment wrappers
function buildPattern(pattern: Config["pattern"]): JSX.Element[] {
  if (pattern === "dots") {
    const xs = Array.from({ length: Math.ceil((W - 24) / 48) + 1 }, (_, i) => 24 + i * 48)
    const ys = Array.from({ length: Math.ceil((H - 24) / 48) + 1 }, (_, i) => 24 + i * 48)
    return xs.flatMap(x =>
      ys.map(y => <circle key={`${x},${y}`} cx={x} cy={y} r={2.5} fill="white" fillOpacity={0.15} />)
    )
  }
  if (pattern === "diagonal") {
    return Array.from({ length: Math.ceil((W + H * 2) / 60) + 1 }, (_, i) => {
      const s = -H + i * 60
      return <line key={`d${s}`} x1={s} y1={0} x2={s + H} y2={H} stroke="white" strokeWidth={1} strokeOpacity={0.08} />
    })
  }
  if (pattern === "grid") {
    const vlines = Array.from({ length: Math.ceil(W / 80) + 1 }, (_, i) => i * 80).map(x =>
      <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="white" strokeWidth={0.8} strokeOpacity={0.08} />
    )
    const hlines = Array.from({ length: Math.ceil(H / 80) + 1 }, (_, i) => i * 80).map(y =>
      <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="white" strokeWidth={0.8} strokeOpacity={0.08} />
    )
    return [...vlines, ...hlines]
  }
  if (pattern === "plus") {
    const arm = 10
    const xs = Array.from({ length: Math.ceil((W - 40) / 76) + 1 }, (_, i) => 40 + i * 76)
    const ys = Array.from({ length: Math.ceil((H - 40) / 76) + 1 }, (_, i) => 40 + i * 76)
    return xs.flatMap(x => ys.flatMap(y => [
      <line key={`h${x},${y}`} x1={x - arm} y1={y} x2={x + arm} y2={y} stroke="white" strokeWidth={1.5} strokeOpacity={0.15} />,
      <line key={`v${x},${y}`} x1={x} y1={y - arm} x2={x} y2={y + arm} stroke="white" strokeWidth={1.5} strokeOpacity={0.15} />,
    ]))
  }
  if (pattern === "rings") {
    return Array.from({ length: Math.ceil(W / 100) }, (_, i) => (i + 1) * 100).map(r =>
      <circle key={`r${r}`} cx={W} cy={H} r={r} fill="none" stroke="white" strokeWidth={1} strokeOpacity={0.08} />
    )
  }
  // stars
  const stars: [number, number, number][] = [
    [70,45,4.5],[195,105,2.8],[360,55,5],[490,138,3.5],[695,72,4.5],
    [870,36,2.8],[970,125,5],[795,196,2.8],[620,240,4.5],[438,295,3],
    [244,244,5],[120,320,2.8],[294,396,4.5],[545,420,3],[745,370,5.5],
    [938,320,2.8],[845,495,4.5],[645,520,3],[396,495,3.5],[168,470,2.8],
    [44,420,5],[950,270,3.8],[570,95,3.2],
  ]
  const conns: [number,number][] = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],
    [10,11],[11,12],[12,13],[13,14],[14,15],[14,16],[16,17],[17,18],
    [18,19],[19,20],[3,8],[4,8],[12,18],[21,6],[21,7],[22,2],
  ]
  return [
    ...conns.map(([a,b], i) =>
      <line key={`c${i}`} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]}
        stroke="white" strokeWidth={0.7} strokeOpacity={0.15} />
    ),
    ...stars.map(([x,y,r], i) =>
      <circle key={`s${i}`} cx={x} cy={y} r={r} fill="white" fillOpacity={0.28} />
    ),
  ]
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    return new ImageResponse(
      (
        <div style={{ width: W, height: H, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)" }}>
          <span style={{ color: "white", fontSize: 64, fontWeight: 800 }}>Aipplify Blog</span>
        </div>
      ),
      { width: W, height: H }
    )
  }

  const c = getConfig(post.category, post.slug)
  const orbW = Math.round(c.orbSize * W)
  const orbLeft = Math.round(c.orbLeft * W - orbW / 2)
  const orbTop = Math.round(c.orbTop * H - orbW / 2)
  const title = post.title.length > 90 ? post.title.slice(0, 87) + "…" : post.title
  const patternEls = buildPattern(c.pattern)

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", overflow: "hidden", background: c.bg }}>
        {/* Pattern */}
        <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
          {patternEls}
          {c.ring && <circle cx={c.ring.cx} cy={c.ring.cy} r={c.ring.r} fill="none" stroke={c.accent1} strokeWidth={2} strokeOpacity={0.22} />}
          {c.ring && <circle cx={c.ring.cx} cy={c.ring.cy} r={c.ring.r * 0.62} fill="none" stroke={c.accent1} strokeWidth={1} strokeOpacity={0.12} />}
        </svg>

        {/* Orb */}
        <div style={{ position: "absolute", left: orbLeft, top: orbTop, width: orbW, height: orbW, borderRadius: "50%", background: `radial-gradient(circle, ${c.orbColor} 0%, transparent 70%)` }} />

        {/* Logo */}
        <div style={{ position: "absolute", top: 40, right: 48, display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "10px 20px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: `linear-gradient(135deg, ${c.accent1}, ${c.accent2})` }} />
          <span style={{ color: "rgba(255,255,255,0.92)", fontSize: 26, fontWeight: 800 }}>Aipplify</span>
        </div>

        {/* Bottom content */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", flexDirection: "column", padding: "80px 72px 56px", background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)" }}>
          <div style={{ display: "flex", alignSelf: "flex-start", fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: c.accent1, background: `${c.accent1}20`, border: `1.5px solid ${c.accent1}60`, borderRadius: 8, padding: "6px 18px", marginBottom: 24 }}>
            {post.category}
          </div>
          <div style={{ fontSize: 62, fontWeight: 800, color: "white", lineHeight: 1.2, maxWidth: 950 }}>
            {title}
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  )
}
