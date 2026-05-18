/**
 * System › User Management
 *
 * v1.4 IA: admin/operator users only. The earlier "Customers" tab
 * (which listed customer-user accounts from admin_api's customers
 * table) was removed in 2026-05-18 — customer users belong to the
 * owning vertical (Trade has /trade/users; Grow + Edge get their
 * own surfaces under their app's operator API). Two tabs now:
 *
 *   Admin Users — admin_users table on admin_api PG16 (add / edit
 *                 role / toggle active).
 *   Audit Log   — admin actions from the audit_log table. Same
 *                 underlying endpoint as /system/audit-logs; the
 *                 inline tab here keeps the two surfaces co-located
 *                 for the operator who's already in User Management.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminUsers, createAdminUser, updateAdminUser, getAuditLog,
} from '../../api/endpoints'
import {
  ShieldCheck, ClipboardList, Plus, Check, X,
} from 'lucide-react'
import clsx from 'clsx'
import { TableToolbar, Pagination } from '../../components/ui/TableToolbar'

// ── Create admin modal ────────────────────────────────────────────────────────
function CreateAdminModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ email: '', password: '', role: 'admin' })

  const mut = useMutation({
    mutationFn: () => createAdminUser(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin:users'] }); onClose() },
  })

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-g-deep border border-g-border rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-white">Create Admin User</p>
          <button onClick={onClose} className="text-g-dim hover:text-white"><X size={15} /></button>
        </div>
        <div className="space-y-3">
          {(['email','password'] as const).map(k => (
            <input
              key={k}
              type={k === 'password' ? 'password' : 'text'}
              placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
              value={form[k]}
              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className="w-full bg-g-card border border-g-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-g-dim focus:outline-none focus:border-accent/50"
            />
          ))}
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full bg-g-card border border-g-border rounded-lg px-3 py-2.5 text-sm text-g-text"
          >
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        {mut.isError && (
          <p className="text-xs text-red-400">{(mut.error as any)?.response?.data?.detail || 'Error creating user'}</p>
        )}
        <button
          onClick={() => mut.mutate()}
          disabled={!form.email || !form.password || mut.isPending}
          className="w-full py-2.5 rounded-lg bg-accent text-black text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40"
        >
          {mut.isPending ? 'Creating…' : 'Create User'}
        </button>
      </div>
    </div>
  )
}

// ── Admin users tab ───────────────────────────────────────────────────────────
function AdminUsersTab() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin:users'],
    queryFn: getAdminUsers,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateAdminUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin:users'] }),
  })

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-accent text-black font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus size={14} /> New Admin User
        </button>
      </div>

      <div className="rounded-xl border border-g-border bg-g-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-g-border">
              {['Email','Role','Active','Created'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs text-g-dim font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-g-dim text-xs">Loading…</td></tr>
            ) : (data as any[]).map((u: any) => (
              <tr key={u.id} className="border-b border-g-border/50 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={u.role}
                    onChange={e => updateMut.mutate({ id: u.id, data: { role: e.target.value } })}
                    className="text-xs bg-g-deep border border-g-border rounded px-2 py-1 text-g-text"
                  >
                    <option value="admin">admin</option>
                    <option value="viewer">viewer</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateMut.mutate({ id: u.id, data: { is_active: !u.is_active } })}
                    className={clsx('w-8 h-4 rounded-full transition-colors relative',
                      u.is_active ? 'bg-accent' : 'bg-white/20'
                    )}
                  >
                    <span className={clsx('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
                      u.is_active ? 'left-4' : 'left-0.5'
                    )} />
                  </button>
                </td>
                <td className="px-4 py-3 text-g-dim text-xs">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateAdminModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

// ── Audit log tab ─────────────────────────────────────────────────────────────
function AuditTab() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin:audit', { page, pageSize, dateFrom, dateTo }],
    queryFn: () => getAuditLog(page, pageSize, dateFrom || undefined, dateTo || undefined),
    keepPreviousData: true,
  } as any)

  const entries: any[] = (data as any)?.entries || []
  const total = (data as any)?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-3">
      <TableToolbar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={v => { setDateFrom(v); setPage(1) }}
        onDateToChange={v => { setDateTo(v); setPage(1) }}
        pageSize={pageSize}
        onPageSizeChange={n => { setPageSize(n); setPage(1) }}
        total={total}
      />
      <div className="rounded-xl border border-g-border bg-g-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-g-border">
                {['When','Actor','Action','Target','Detail'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs text-g-dim font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-g-dim text-xs">Loading…</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-g-dim text-xs">No audit entries</td></tr>
              ) : entries.map((e: any, i: number) => (
                <tr key={i} className="border-b border-g-border/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-g-dim text-xs whitespace-nowrap">
                    {e.created_at ? new Date(e.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-g-muted text-xs">{e.actor_email || e.actor || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">{e.action}</span>
                  </td>
                  <td className="px-4 py-3 text-g-muted text-xs">{e.target_type} #{e.target_id}</td>
                  <td className="px-4 py-3 text-g-dim text-xs font-mono truncate max-w-xs" title={JSON.stringify(e.detail)}>
                    {e.detail ? JSON.stringify(e.detail).slice(0, 60) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-g-border">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
type Tab = 'admins' | 'audit'

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'admins', label: 'Admin Users', icon: ShieldCheck },
  { id: 'audit',  label: 'Audit Log',   icon: ClipboardList },
]

export default function UserManagement() {
  const [tab, setTab] = useState<Tab>('admins')

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-g-muted text-sm mt-1">
          Admin/operator accounts and the platform audit trail. Customer
          users live under their owning vertical (Trade · Users, etc.).
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-g-border">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.id
                ? 'border-accent text-accent'
                : 'border-transparent text-g-muted hover:text-g-text'
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'admins' && <AdminUsersTab />}
      {tab === 'audit'  && <AuditTab />}
    </div>
  )
}
