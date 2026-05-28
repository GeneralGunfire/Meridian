import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface DataCategoryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  imageAlt: string
  logo?: React.ReactNode
  title: string
  subtitle: string
  overview: string
  badge: string
  onExplore: () => void
}

const DataCategoryCard = React.forwardRef<HTMLDivElement, DataCategoryCardProps>(
  (
    {
      className,
      imageUrl,
      imageAlt,
      logo,
      title,
      subtitle,
      overview,
      badge,
      onExplore,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl border border-black/12 bg-white shadow-sm",
          "transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
          className
        )}
        {...props}
      >
        {/* Background Image */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative flex h-72 flex-col justify-between p-6 text-white">
          {/* Top: logo + badge */}
          <div className="flex items-start justify-between">
            {logo && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 backdrop-blur-sm">
                {logo}
              </div>
            )}
            <span className="rounded-full border border-white/30 bg-black/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
              {badge}
            </span>
          </div>

          {/* Middle — slides up on hover */}
          <div className="space-y-2 transition-transform duration-500 ease-in-out group-hover:-translate-y-14">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-sm text-white/75">{subtitle}</p>
            <p className="text-xs text-white/65 leading-relaxed">{overview}</p>
          </div>

          {/* Bottom CTA — revealed on hover */}
          <div className="absolute -bottom-16 left-0 w-full px-6 pb-6 opacity-0 transition-all duration-500 ease-in-out group-hover:bottom-0 group-hover:opacity-100">
            <button
              onClick={onExplore}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#0a0a0a] transition-colors hover:bg-[#f5f0e8]"
            >
              Explore datasets <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }
)
DataCategoryCard.displayName = "DataCategoryCard"

export { DataCategoryCard }
