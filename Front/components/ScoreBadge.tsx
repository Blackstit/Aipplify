import { cn } from "@/lib/utils"

type Size = "sm" | "md"

export function ScoreBadge({
  score,
  size = "md",
  className,
}: {
  score: number | null | undefined
  size?: Size
  className?: string
}) {
  if (score == null || Number.isNaN(score)) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500",
          size === "sm" && "text-[9px] px-1",
          className
        )}
      >
        —
      </span>
    )
  }
  const s = Math.min(10, Math.max(0, score))
  const tone =
    s >= 8 ? "bg-emerald-100 text-emerald-800" : s >= 5 ? "bg-amber-100 text-amber-900" : "bg-rose-100 text-rose-800"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
        size === "sm" && "text-[9px] px-1",
        tone,
        className
      )}
    >
      {s.toFixed(1)}
    </span>
  )
}
