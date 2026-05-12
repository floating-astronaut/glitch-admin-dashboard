import { LucideIcon, Inbox } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon = Inbox, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="p-3 rounded-full bg-white/5 text-g-muted mb-3">
        <Icon size={20} />
      </div>
      <p className="text-sm font-medium text-white">{title}</p>
      {description && <p className="text-xs text-g-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
