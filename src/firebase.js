// firebase.js
import { initializeApp, getApps } from 'firebase/app'
import { 
  getFirestore, connectFirestoreEmulator 
} from 'firebase/firestore'
import { 
  getAuth, connectAuthEmulator 
} from 'firebase/auth'
import { 
  getStorage, connectStorageEmulator 
} from 'firebase/storage'

// Firebase config (from Vite env or fallback)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'opensource-demo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:demo',
}

// Ensure single app instance (fixes Vite hot reload issue)
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

// Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Emulator setup (only on localhost + if enabled)
if (
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' &&
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname)
) {
  try {
    // Firestore emulator
    connectFirestoreEmulator(
      db,
      '127.0.0.1',
      Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT) || 8080
    )
    // Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099')
    // Storage emulator
    connectStorageEmulator(storage, '127.0.0.1', 9199)

    if (import.meta.env.DEV) {
      console.info('[Firebase] Connected to local emulators.')
    }
  } catch (e) {
    console.warn('[Firebase] Emulator connection failed. Using real services.', e.message)
  }
} else {
  if (import.meta.env.DEV) {
    console.info('[Firebase] Using real Firebase project:', firebaseConfig.projectId)
  }
}
