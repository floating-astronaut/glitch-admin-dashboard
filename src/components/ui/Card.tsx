import clsx from 'clsx'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  padded?: boolean
  accent?: boolean
}

export default function Card({ children, className, padded = true, accent }: Props) {
  return (
    <div className={clsx(
      'rounded-xl border bg-g-card',
      accent ? 'border-accent/30' : 'border-g-border',
      padded && 'p-4',
      className,
    )}>
      {children}
    </div>
  )
}
