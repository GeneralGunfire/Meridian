import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

interface DatasetCardProps {
  category: string
  title: string
  source: string
  description: string
  format: string
  refreshRate: string
  imageUrl: string
}

export function DatasetCard({
  category,
  title,
  source,
  description,
  imageUrl,
}: DatasetCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} className="group flex flex-col bg-slate-900 rounded border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors">
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white px-2 py-1 text-xs font-semibold rounded">
            {category}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4">
        <h3 className="text-lg font-bold text-slate-50 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-3">{source}</p>
        <p className="text-sm text-slate-400 mb-4 flex-grow">{description}</p>

        <Link
          to="/downloads"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          View Data →
        </Link>
      </div>
    </motion.div>
  )
}
