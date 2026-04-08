import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBd6yYbRWUvmq-diATZGKLoJLFCo2G-ptA",
  authDomain: "myvocab-e4e18.firebaseapp.com",
  databaseURL: "https://myvocab-e4e18-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myvocab-e4e18",
  storageBucket: "myvocab-e4e18.firebasestorage.app",
  messagingSenderId: "450140128601",
  appId: "1:450140128601:web:49e42b21e687d19bceb848",
  measurementId: "G-MB15RC4R0W",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app)
export default app
