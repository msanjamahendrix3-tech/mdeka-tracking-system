import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.error("Firebase config is missing or invalid! Check firebase-applet-config.json");
  throw new Error("Critical: Firebase configuration is missing.");
}

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Firestore with IndexedDB persistent offline caching
// This allows clinicians to view patient records even when the device goes offline.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

export default app;
