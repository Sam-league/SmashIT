import admin from 'firebase-admin'
import Notification from '../models/Notification'

// Track whether init was attempted so we don't retry on bad config
let initAttempted = false

function initFirebaseAdmin(): boolean {
  // Already successfully initialized
  if (admin.apps.length > 0) return true
  // Already tried and failed — don't retry
  if (initAttempted) return false

  initAttempted = true

  const key = process.env.FIREBASE_ADMIN_SDK_KEY
  if (!key) {
    console.warn('FIREBASE_ADMIN_SDK_KEY not set — push notifications disabled')
    return false
  }

  try {
    // Railway (and many CI systems) store \n as literal \\n in env vars
    const normalized = key.replace(/\\n/g, '\n')
    const serviceAccount = JSON.parse(normalized) as admin.ServiceAccount
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    console.log('Firebase Admin SDK initialized')
    return true
  } catch (err) {
    console.error('Firebase Admin SDK init failed:', err)
    return false
  }
}

export async function sendPushNotification(
  userId: string,
  fcmToken: string,
  title: string,
  body: string
): Promise<void> {
  // Always save to DB so the notifications page works regardless of FCM status
  await Notification.create({ userId, title, body })

  // Send FCM push only if admin SDK is ready and token is available
  if (!initFirebaseAdmin() || !fcmToken) return

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        },
      },
    })
  } catch (err) {
    console.error('FCM send failed:', err)
  }
}
