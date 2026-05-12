import { Menu, LogOut, User, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { useNavigate } from 'react-router-dom'
import CommandPalette from '../ui/CommandPalette'

interface Props {
  title: string
}

export default function Topbar({ title }: Props) {
  const { toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-14 bg-g-deep border-b border-g-border flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={toggleSidebar}
        className="text-g-muted hover:text-white transition-colors lg:hidden"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-sm font-semibold text-white flex-1">{title}</h1>

      <button
        onClick={() => setPaletteOpen(true)}
        className="hidden sm:flex items-center gap-2 px-2.5 h-8 rounded-lg border border-g-border text-g-muted hover:text-g-text hover:border-accent/40 transition-colors"
        title="Jump to… (⌘K)"
      >
        <Search size={14} />
        <span className="text-xs">Jump to…</span>
        <kbd className="text-[10px] font-mono text-g-dim border border-g-border rounded px-1 py-0.5 ml-1">⌘K</kbd>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-g-muted">
          <User size={14} />
          <span className="hidden sm:inline">{user?.email}</span>
          <span className="text-xs bg-g-border text-g-text px-2 py-0.5 rounded-full">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-g-muted hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  )
}
