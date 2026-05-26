"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"
import {
  animate,
  AnimationPlaybackControls,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react"

interface NumberTickerProps {
  from?: number
  target: number
  duration?: number
  className?: string
  onStart?: () => void
  onComplete?: () => void
  autoStart?: boolean
}

export interface NumberTickerRef {
  startAnimation: () => void
}

const NumberTicker = forwardRef<NumberTickerRef, NumberTickerProps>(
  (
    {
      from = 0,
      target,
      duration = 2.5,
      className,
      onStart,
      onComplete,
      autoStart = true,
    },
    ref
  ) => {
    const count = useMotionValue(from)
    const rounded = useTransform(count, (latest) => Math.round(latest))
    const [controls, setControls] = useState<AnimationPlaybackControls | null>(null)

    const startAnimation = useCallback(() => {
      if (controls) controls.stop()
      onStart?.()
      count.set(from)
      const newControls = animate(count, target, {
        duration,
        type: "tween",
        ease: "easeOut",
        onComplete: () => onComplete?.(),
      })
      setControls(newControls)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useImperativeHandle(ref, () => ({ startAnimation }))

    useEffect(() => {
      if (autoStart) startAnimation()
      return () => controls?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart])

    return (
      <motion.span className={className}>
        {rounded}
      </motion.span>
    )
  }
)

NumberTicker.displayName = "NumberTicker"
export default NumberTicker
