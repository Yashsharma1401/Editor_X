import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'scenes'

export async function loadScene(sceneId) {
  try {
    const ref = doc(db, COLLECTION, sceneId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data()
  } catch (error) {
    console.warn('Failed to load scene:', error)
    // Try localStorage fallback
    const local = localStorage.getItem(`scene_${sceneId}`)
    return local ? JSON.parse(local) : null
  }
}

export async function saveScene(sceneId, data) {
  try {
    const ref = doc(db, COLLECTION, sceneId)
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
    }
    await setDoc(ref, payload, { merge: true })
  } catch (error) {
    console.warn('Failed to save to Firestore, using localStorage:', error)
    // Fallback to localStorage
    localStorage.setItem(`scene_${sceneId}`, JSON.stringify(data))
  }
}


