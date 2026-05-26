import { CheckCircle2, XCircle } from 'lucide-react'

interface StatusIndicatorProps {
  name: string
  success: boolean
  lastUpdated: string
  error?: string | null
}

export function StatusIndicator({ name, success, lastUpdated, error }: StatusIndicatorProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-50 capitalize">{name}</span>
        {success ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>

      <p className="text-xs text-slate-400 mb-2">
        {success ? '✓ Updated' : '✗ Failed'}
      </p>

      <p className="text-xs text-slate-500">
        {lastUpdated}
      </p>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
