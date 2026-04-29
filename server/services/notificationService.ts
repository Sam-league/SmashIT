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

  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase env vars not set (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) — push notifications disabled')
    return false
  }

  try {
    // Railway stores \n as literal \\n — convert back to real newlines
    const normalizedKey = privateKey.replace(/\\n/g, '\n')
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey: normalizedKey }),
    })
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
