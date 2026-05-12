import { ReactNode } from 'react'
import clsx from 'clsx'

interface Props {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export default function Section({ title, description, action, children, className }: Props) {
  return (
    <section className={clsx('space-y-3', className)}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
            {description && <p className="text-xs text-g-muted mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
