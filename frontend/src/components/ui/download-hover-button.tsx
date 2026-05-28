"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface AnimatedDownloadButtonProps {
  href?: string
  filename?: string
  onClick?: () => void
  label?: string
}

export default function AnimatedDownloadButton({
  href,
  filename,
  onClick,
  label = "Download",
}: AnimatedDownloadButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const inner = (
    <motion.div
      initial={{ width: 56, height: 56 }}
      whileHover={{ width: 200 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative cursor-pointer"
      style={{ borderRadius: 28 }}
    >
      <motion.div
        className="absolute"
        animate={{
          opacity: isHovered ? 0 : 1,
          scale: isHovered ? 0.7 : 1,
        }}
        transition={{ duration: 0.18 }}
      >
        <svg className="h-5 w-5 text-[#f5f0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </motion.div>

      <motion.div
        className="w-full flex justify-center items-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.18, delay: isHovered ? 0.08 : 0 }}
      >
        <span className="text-[#f5f0e8] text-sm font-bold whitespace-nowrap tracking-wide">
          {label}
        </span>
      </motion.div>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} download={filename}>
        {inner}
      </a>
    )
  }

  return (
    <div onClick={handleClick}>
      {inner}
    </div>
  )
}
