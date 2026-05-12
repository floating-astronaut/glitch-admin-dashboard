import { AlertTriangle } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  title?: string
  description?: ReactNode
  onRetry?: () => void
}

export default function ErrorState({ title = 'Something went wrong', description, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="p-3 rounded-full bg-red-500/10 text-red-400 mb-3">
        <AlertTriangle size={20} />
      </div>
      <p className="text-sm font-medium text-white">{title}</p>
      {description && <p className="text-xs text-g-muted mt-1 max-w-sm">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-g-border text-g-text hover:border-accent hover:text-accent transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
