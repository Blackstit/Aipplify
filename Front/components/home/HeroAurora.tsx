export function HeroAurora() {
  // 12 stable "stars" — positioned deterministically so hydration is happy.
  const stars = [
    { top: "12%", left: "18%", size: 4,   delay: "0s",   dur: "3.6s" },
    { top: "22%", left: "74%", size: 3,   delay: "0.9s", dur: "4.2s" },
    { top: "35%", left: "12%", size: 2.5, delay: "1.8s", dur: "3.2s" },
    { top: "48%", left: "85%", size: 3,   delay: "0.4s", dur: "5.0s" },
    { top: "62%", left: "30%", size: 2,   delay: "2.4s", dur: "3.8s" },
    { top: "70%", left: "65%", size: 4,   delay: "1.1s", dur: "4.6s" },
    { top: "18%", left: "48%", size: 2.5, delay: "2.8s", dur: "3.4s" },
    { top: "80%", left: "20%", size: 3,   delay: "1.6s", dur: "4.0s" },
    { top: "8%",  left: "60%", size: 2,   delay: "3.1s", dur: "3.6s" },
    { top: "52%", left: "50%", size: 2.5, delay: "0.2s", dur: "4.4s" },
    { top: "28%", left: "35%", size: 2,   delay: "2.0s", dur: "3.0s" },
    { top: "75%", left: "90%", size: 3,   delay: "1.4s", dur: "4.8s" },
  ]

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Top spotlight sweep — gives that "high-end product page" feeling */}
      <div
        className="absolute -top-1/3 left-0 right-0 h-[80%] spotlight-sweep"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 30%, rgba(139,92,246,0.22) 0%, rgba(99,102,241,0.10) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Aurora orbs — wrapped in aurora-hue for subtle color shifting */}
      <div className="absolute inset-0 aurora-hue">
        {/* A — big violet, top-left */}
        <div
          className="absolute -top-32 -left-24 h-[560px] w-[560px] rounded-full opacity-70 blur-3xl mix-blend-multiply orb-a"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #a855f7 0%, #6366f1 45%, transparent 72%)",
          }}
        />
        {/* B — indigo, top-right */}
        <div
          className="absolute -top-16 right-[-12%] h-[520px] w-[520px] rounded-full opacity-65 blur-3xl mix-blend-multiply orb-b"
          style={{
            background:
              "radial-gradient(circle at 65% 30%, #818cf8 0%, #a78bfa 40%, transparent 75%)",
          }}
        />
        {/* C — fuchsia, bottom */}
        <div
          className="absolute bottom-[-20%] left-[18%] h-[480px] w-[480px] rounded-full opacity-55 blur-3xl mix-blend-multiply orb-c"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #c084fc 0%, #7c3aed 42%, transparent 75%)",
          }}
        />
        {/* D — small accent orb */}
        <div
          className="absolute top-[40%] left-[42%] h-[240px] w-[240px] rounded-full opacity-55 blur-2xl orb-d"
          style={{
            background:
              "radial-gradient(circle, rgba(232,121,249,0.55) 0%, transparent 65%)",
          }}
        />
        {/* E — deep accent, bottom-right */}
        <div
          className="absolute bottom-[5%] right-[5%] h-[300px] w-[300px] rounded-full opacity-45 blur-3xl mix-blend-multiply orb-a"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, #8b5cf6 0%, #4f46e5 50%, transparent 75%)",
            animationDelay: "-8s",
          }}
        />
      </div>

      {/* Conic gradient ring — tiny premium signature around top */}
      <div
        className="absolute left-1/2 top-[6%] h-[620px] w-[620px] -translate-x-1/2 rounded-full opacity-[0.18] blur-2xl"
        style={{
          background:
            "conic-gradient(from 120deg at 50% 50%, rgba(168,85,247,0) 0deg, rgba(168,85,247,0.6) 80deg, rgba(99,102,241,0.6) 180deg, rgba(236,72,153,0.5) 260deg, rgba(168,85,247,0) 360deg)",
          WebkitMaskImage:
            "radial-gradient(closest-side, rgba(0,0,0,0.9), transparent 70%)",
          maskImage:
            "radial-gradient(closest-side, rgba(0,0,0,0.9), transparent 70%)",
        }}
      />

      {/* Twinkling stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-white twinkle shadow-[0_0_10px_rgba(167,139,250,0.9)]"
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

      {/* Subtle noise texture — kills gradient banding, adds "filmic" feel */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  )
}
