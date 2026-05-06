import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache
} from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({})
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Test connection to Firestore
import { doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
async function testConnection() {
  try {
    // Try to get a non-existent doc from server to verify connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection successful.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connection failed: The client is offline. Please check your Firebase configuration or internet connection.");
    } else {
      console.log("Firestore connection test completed (ignoring non-offline errors).");
    }
  }
}
testConnection();

export default app;
