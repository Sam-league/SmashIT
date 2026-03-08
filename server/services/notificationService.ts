import admin from 'firebase-admin'
import Notification from '../models/Notification'

let initialized = false

function initFirebaseAdmin() {
  if (initialized || admin.apps.length > 0) return
  const key = process.env.FIREBASE_ADMIN_SDK_KEY
  if (!key) {
    console.warn('FIREBASE_ADMIN_SDK_KEY not set — push notifications disabled')
    return
  }
  const serviceAccount = JSON.parse(key) as admin.ServiceAccount
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  initialized = true
}

export async function sendPushNotification(
  userId: string,
  fcmToken: string,
  title: string,
  body: string
): Promise<void> {
  // Save to DB so the notifications page can display it
  await Notification.create({ userId, title, body })

  // Send FCM push if token available
  initFirebaseAdmin()
  if (!initialized || !fcmToken) return

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
    })
  } catch (err) {
    console.error('Failed to send push notification:', err)
  }
}
