import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/auth'
import { API_BASE } from '../api/client'

type WsMessage = {
  channel: string
  bot: string
  data: Record<string, unknown>
}

/**
 * Maintains a persistent WebSocket connection to /ws?token=...
 * On each message, invalidates the relevant TanStack Query keys so
 * components automatically re-fetch with fresh data.
 *
 * Reconnects automatically on disconnect (5 second backoff).
 */
export function useWebSocket() {
  const { token } = useAuthStore()
  const qc = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!token) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    // Resolve the WS endpoint off API_BASE so cross-origin works once
    // the SPA moves to CF Pages (window.location.host = CF edge, but
    // /ws lives on admin-api.glitchexecutor.com). https → wss.
    const wsBase = API_BASE.replace(/^http/, 'ws')
    const url = `${wsBase}/ws?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (retryRef.current) {
        clearTimeout(retryRef.current)
        retryRef.current = null
      }
    }

    ws.onmessage = (e: MessageEvent) => {
      try {
        const msg: WsMessage = JSON.parse(e.data)
        const ch = msg.channel

        if (ch === 'bot:heartbeat') {
          qc.invalidateQueries({ queryKey: ['botHeartbeats'] })
          qc.invalidateQueries({ queryKey: ['botStats'] })
        } else if (ch === 'position:open') {
          qc.invalidateQueries({ queryKey: ['botPositions'] })
          qc.invalidateQueries({ queryKey: ['botEvents'] })
          qc.invalidateQueries({ queryKey: ['botStats'] })
        } else if (ch === 'position:update') {
          qc.invalidateQueries({ queryKey: ['botPositions'] })
          qc.invalidateQueries({ queryKey: ['botEvents'] })
        } else if (ch === 'position:close') {
          qc.invalidateQueries({ queryKey: ['botPositions'] })
          qc.invalidateQueries({ queryKey: ['botEvents'] })
          qc.invalidateQueries({ queryKey: ['botStats'] })
        } else if (ch === 'bot:rejected') {
          qc.invalidateQueries({ queryKey: ['botEvents'] })
        } else if (ch === 'oracle:alert') {
          qc.invalidateQueries({ queryKey: ['oracleAlerts'] })
        } else if (ch === 'oracle:heartbeat') {
          qc.invalidateQueries({ queryKey: ['oracleStatus'] })
        }
      } catch {}
    }

    ws.onerror = () => {}

    ws.onclose = () => {
      wsRef.current = null
      // Auto-reconnect after 5s
      retryRef.current = setTimeout(connect, 5000)
    }
  }, [token, qc])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      if (retryRef.current) clearTimeout(retryRef.current)
    }
  }, [connect])

  return wsRef
}
