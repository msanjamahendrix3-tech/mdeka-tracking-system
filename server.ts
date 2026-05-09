import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // -- SECURITY MIDDLEWARE --
  app.use(helmet({
    contentSecurityPolicy: false, 
  }));
  app.use(cors());
  app.use(express.json());

  // -- FIREBASE INITIALIZATION --
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

  // -- API ROUTES --
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'Database Middleware is Active and Secure', timestamp: new Date() });
  });

  // Example: Get tracking data
  app.get('/api/tracking', async (req, res) => {
    try {
      const trackingCol = collection(db, 'tracking');
      const q = query(trackingCol, orderBy('timestamp', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(data);
    } catch (error) {
      console.error('Database Error:', error);
      res.status(500).json({ error: 'Blocked by Middleware: Unable to fetch data' });
    }
  });

  // Example: Add tracking data
  app.post('/api/tracking', async (req, res) => {
    try {
      const { latitude, longitude, deviceId } = req.body;

      if (!latitude || !longitude || !deviceId) {
        return res.status(400).json({ error: 'Malicious Request Blocked: Missing required fields' });
      }

      const trackingCol = collection(db, 'tracking');
      await addDoc(trackingCol, {
        latitude,
        longitude,
        deviceId,
        timestamp: new Date().toISOString(),
        ip: req.ip 
      });

      res.status(201).json({ message: 'Success: Data verified and stored' });
    } catch (error) {
       res.status(500).json({ error: 'Internal Security Error' });
    }
  });

  // route to fetch all users for the security dashboard (Super Admin only check would happen in frontend/middleware)
  app.get('/api/admin/users', async (req, res) => {
    try {
      const usersCol = collection(db, 'users');
      const snapshot = await getDocs(usersCol);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(data);
    } catch (error) {
      console.error('Admin user fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch user database' });
    }
  });

  // -- VITE MIDDLEWARE (Serving the Frontend) --
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Middleware] Server running at http://localhost:${PORT}`);
    console.log(`[Middleware] Acting as a shield between Mdeka App and Firebase`);
  });
}

startServer();
