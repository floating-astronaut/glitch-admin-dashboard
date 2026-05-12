import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import clsx from 'clsx'

interface Command {
  label: string
  to: string
  group: string
}

const COMMANDS: Command[] = [
  { group: 'Trade', label: 'Trade · Overview', to: '/trade' },
  { group: 'Trade', label: 'Trade · Bots', to: '/trade/bots' },
  { group: 'Trade', label: 'Trade · Signals', to: '/trade/signals' },
  { group: 'Trade', label: 'Trade · Trades', to: '/trade/trades' },
  { group: 'Trade', label: 'Trade · Oracle', to: '/trade/oracle' },
  { group: 'Trade', label: 'Trade · News', to: '/trade/news' },
  { group: 'Grow', label: 'Grow · Overview', to: '/grow' },
  { group: 'Grow', label: 'Grow · Budz · Overview', to: '/grow/budz' },
  { group: 'Grow', label: 'Grow · Budz · Leads', to: '/grow/budz/leads' },
  { group: 'Grow', label: 'Grow · Budz · Drafts', to: '/grow/budz/drafts' },
  { group: 'Grow', label: 'Grow · Budz · Sends', to: '/grow/budz/sends' },
  { group: 'Admin', label: 'Home', to: '/' },
  { group: 'Admin', label: 'Customers', to: '/clients' },
  { group: 'Admin', label: 'Billing', to: '/billing' },
  { group: 'Admin', label: 'Infrastructure', to: '/infrastructure' },
  { group: 'Admin', label: 'Control Centre', to: '/admin/control-centre' },
  { group: 'Admin', label: 'User Management', to: '/admin/users' },
  { group: 'Admin', label: 'Settings', to: '/settings' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: Props) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return COMMANDS
    return COMMANDS.filter(c => c.label.toLowerCase().includes(s))
  }, [q])

  useEffect(() => { setActive(0) }, [q])

  if (!open) return null

  const go = (cmd?: Command) => {
    const target = cmd ?? filtered[active]
    if (!target) return
    navigate(target.to)
    onClose()
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go() }
    else if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-g-card border border-g-border rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 h-11 border-b border-g-border">
          <Search size={16} className="text-g-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Jump to…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-g-dim outline-none"
          />
          <kbd className="text-[10px] text-g-dim font-mono border border-g-border rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <li className="px-3 py-3 text-xs text-g-muted">No matches</li>
          )}
          {filtered.map((c, i) => (
            <li
              key={c.to}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(c)}
              className={clsx(
                'flex items-center justify-between px-3 py-2 text-sm cursor-pointer',
                i === active ? 'bg-accent/10 text-accent' : 'text-g-text',
              )}
            >
              <span>{c.label}</span>
              <span className="text-[10px] text-g-dim font-mono uppercase tracking-wider">{c.group}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
