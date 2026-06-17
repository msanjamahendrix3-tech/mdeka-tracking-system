import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  userId: string;
  type: 'MISSED_APPOINTMENT' | 'NEW_ASSIGNMENT' | 'INFO';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  sendNotification: (userId: string, notification: Omit<AppNotification, 'id' | 'userId' | 'read' | 'createdAt'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user, isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !user?.uid) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      
      // Sort in memory since we don't want to create an index for every query immediately if not needed
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotifications(notifs);
    }, (error) => {
      console.warn("Notifications subscription error:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, isAuthenticated, user]);

  const sendNotification = async (userId: string, notification: Omit<AppNotification, 'id' | 'userId' | 'read' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        ...notification,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send notification', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, sendNotification, markAsRead, deleteNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
