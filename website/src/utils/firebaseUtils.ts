import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export const requestFCMToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission denied')
    }

    const currentToken = await getToken(messaging, { vapidKey })
    if (currentToken) return currentToken
    return null
  } catch (err) {
    console.error('Error getting FCM token:', err)
    return null
  }
}

let onMessageCallback: ((payload: any) => void) | null = null

export const onMessageListener = (callback: (payload: any) => void) => {
  if (typeof callback === 'function') onMessageCallback = callback

  onMessage(messaging, (payload) => {
    if (onMessageCallback) onMessageCallback(payload)
    else console.warn('No callback registered for foreground messages.')
  })
}

export default {
  requestFCMToken,
  onMessageListener,
}
