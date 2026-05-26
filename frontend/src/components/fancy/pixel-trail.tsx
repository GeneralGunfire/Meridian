"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, useAnimationControls } from "motion/react"

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}

function useDimensions(ref: React.RefObject<HTMLElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return
    const update = () => {
      if (ref.current) {
        setDimensions({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight,
        })
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  return dimensions
}

interface PixelTrailProps {
  pixelSize?: number
  fadeDuration?: number
  delay?: number
  className?: string
  pixelClassName?: string
}

const PixelTrail: React.FC<PixelTrailProps> = ({
  pixelSize = 24,
  fadeDuration = 400,
  delay = 0,
  className,
  pixelClassName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useDimensions(containerRef as React.RefObject<HTMLElement>)
  const trailId = useRef(`pt-${Math.random().toString(36).slice(2)}`)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / pixelSize)
      const y = Math.floor((e.clientY - rect.top) / pixelSize)
      const pixelElement = document.getElementById(
        `${trailId.current}-pixel-${x}-${y}`
      )
      if (pixelElement) {
        const animatePixel = (pixelElement as unknown as { __animatePixel?: () => void }).__animatePixel
        if (animatePixel) animatePixel()
      }
    },
    [pixelSize]
  )

  const columns = useMemo(
    () => Math.ceil(dimensions.width / pixelSize),
    [dimensions.width, pixelSize]
  )
  const rows = useMemo(
    () => Math.ceil(dimensions.height / pixelSize),
    [dimensions.height, pixelSize]
  )

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 w-full h-full pointer-events-auto", className)}
      onMouseMove={handleMouseMove}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <PixelDot
              key={`${colIndex}-${rowIndex}`}
              id={`${trailId.current}-pixel-${colIndex}-${rowIndex}`}
              size={pixelSize}
              fadeDuration={fadeDuration}
              delay={delay}
              className={pixelClassName}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default PixelTrail

interface PixelDotProps {
  id: string
  size: number
  fadeDuration: number
  delay: number
  className?: string
}

const PixelDot: React.FC<PixelDotProps> = React.memo(
  ({ id, size, fadeDuration, delay, className }) => {
    const controls = useAnimationControls()

    const animatePixel = useCallback(() => {
      controls.start({
        opacity: [0.7, 0],
        transition: { duration: fadeDuration / 1000, delay: delay / 1000 },
      })
    }, [controls, fadeDuration, delay])

    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          ;(node as unknown as { __animatePixel: () => void }).__animatePixel = animatePixel
        }
      },
      [animatePixel]
    )

    return (
      <motion.div
        id={id}
        ref={ref}
        className={cn(className)}
        style={{ width: `${size}px`, height: `${size}px` }}
        initial={{ opacity: 0 }}
        animate={controls}
      />
    )
  }
)

PixelDot.displayName = "PixelDot"
