"use client"

import { useCallback, useRef, useState } from "react"
import { MoveHorizontal } from "lucide-react"

type CompareSliderProps = {
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
}

export function CompareSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt }: CompareSliderProps) {
  const [position, setPosition] = useState(55)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, pct)))
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    updateFromClientX(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    updateFromClientX(e.clientX)
  }

  const onPointerUp = () => {
    dragging.current = false
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-[3/4] w-full select-none overflow-hidden rounded-2xl border border-border bg-muted"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      role="slider"
      aria-label="Сравнение до и после AI-примерки"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 4))
        if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 4))
      }}
    >
      {/* After (full background) */}
      <img
        src={afterSrc || "/placeholder.svg"}
        alt={afterAlt}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img
          src={beforeSrc || "/placeholder.svg"}
          alt={beforeAlt}
          className="absolute inset-0 h-full w-full max-w-none object-cover"
          style={{ width: containerRef.current?.clientWidth ?? "100%" }}
          draggable={false}
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
          До
        </span>
      </div>

      <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
        После · AI
      </span>

      {/* Handle */}
      <div className="absolute inset-y-0 z-10" style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-primary/90" />
        <div className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <MoveHorizontal className="size-5" />
        </div>
      </div>
    </div>
  )
}
