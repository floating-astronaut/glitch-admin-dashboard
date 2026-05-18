import { X } from 'lucide-react'
import { ReactNode } from 'react'
import clsx from 'clsx'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Defaults to `md` (max-w-md). Use `lg` / `xl` for detail views. */
  size?: Size
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className={clsx(
          'relative z-10 bg-g-card border border-g-border rounded-2xl w-full shadow-2xl',
          'max-h-[85vh] flex flex-col',
          SIZE_CLASS[size],
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-g-border shrink-0">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-g-muted hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
