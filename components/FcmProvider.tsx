'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { requestNotificationPermission, onForegroundMessage } from '@/lib/fcm'
import api from '@/lib/api'

export default function FcmProvider() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) return

    // Request permission + register token
    requestNotificationPermission().then((token) => {
      if (token) {
        api.post('/api/users/fcm-token', { fcmToken: token }).catch(() => {})
      }
    })

    // Show foreground notifications as browser notifications
    const unsub = onForegroundMessage((payload: any) => {
      const { title, body } = payload?.notification ?? {}
      if (title && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon' })
      }
    })

    return () => { if (typeof unsub === 'function') unsub() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id])

  return null
}
