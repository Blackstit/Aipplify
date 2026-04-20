"use client"

import { useEffect, useRef, useState } from "react"

export function AnimatedCounter({
  target,
  suffix = "",
  initial,
}: {
  target: number
  suffix?: string
  /** Значение, которое уже отрисовано на сервере (показываем его сразу) */
  initial?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(initial ?? target)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || startedRef.current) return

    const start = () => {
      startedRef.current = true
      setCount(0)
      const duration = 1500
      const steps = 40
      const inc = target / steps
      let current = 0
      const timer = setInterval(() => {
        current += inc
        if (current >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          obs.disconnect()
          start()
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}
