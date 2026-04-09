import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'ADMIN' | 'CLINICAL' | 'CHW';

interface UserProfile {
  username: string;
  name: string;
  role: UserRole;
  clinic?: string;
  status: 'APPROVED' | 'PENDING';
  email: string;
  uid: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Don't throw here to avoid crashing the app, but log it clearly
}

interface AuthContextType {
  user: UserProfile | null;
  login: () => Promise<{ success: boolean; message?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (userData: Omit<UserProfile, 'status' | 'uid' | 'email'>) => Promise<void>;
  registerWithEmail: (email: string, password: string, userData: Omit<UserProfile, 'status' | 'uid' | 'email'>) => Promise<{ success: boolean; message?: string }>;
  pendingUsers: UserProfile[];
  allUsers: UserProfile[];
  approveUser: (uid: string) => void;
  rejectUser: (uid: string) => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.warn('Auth state check: User document not accessible or not found.');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const q = collection(db, 'users');
      const unsubscribeUsers = onSnapshot(q, (snapshot) => {
        const usersList = snapshot.docs.map(doc => doc.data() as UserProfile);
        setAllUsers(usersList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });
      return () => unsubscribeUsers();
    }
  }, [user]);

  const login = async (): Promise<{ success: boolean; message?: string }> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        if (profile.status === 'PENDING') {
          return { success: false, message: 'Your account is pending admin approval.' };
        }
        setUser(profile);
        return { success: true };
      } else {
        // First time login - need to register
        return { success: true, message: 'NEW_USER' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        if (profile.status === 'PENDING') {
          return { success: false, message: 'Your account is pending admin approval.' };
        }
        setUser(profile);
        return { success: true };
      } else {
        return { success: false, message: 'User profile not found. Please register.' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is not enabled in the Firebase Console. Please contact the administrator.';
      }
      return { success: false, message };
    }
  };

  const register = async (userData: Omit<UserProfile, 'status' | 'uid' | 'email'>) => {
    if (!auth.currentUser) throw new Error('No authenticated user found');
    
    const newUser: UserProfile = { 
      ...userData, 
      status: 'PENDING', 
      uid: auth.currentUser.uid,
      email: auth.currentUser.email || ''
    };
    
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), newUser);
      setUser(newUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${auth.currentUser.uid}`);
    }
  };

  const registerWithEmail = async (email: string, password: string, userData: Omit<UserProfile, 'status' | 'uid' | 'email'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      const isBootstrapAdmin = email === 'msanjamahendrix3@gmail.com' && userData.role === 'ADMIN';
      
      const newUser: UserProfile = { 
        ...userData, 
        status: isBootstrapAdmin ? 'APPROVED' : 'PENDING', 
        uid: firebaseUser.uid,
        email: email
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already in use.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/Password registration is not enabled in the Firebase Console. Please contact the administrator.';
      }
      return { success: false, message };
    }
  };

  const approveUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'APPROVED' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const rejectUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const pendingUsers = allUsers.filter(u => u.status === 'PENDING');

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithEmail,
      logout, 
      register, 
      registerWithEmail,
      pendingUsers, 
      allUsers,
      approveUser, 
      rejectUser,
      isAuthenticated: !!user && user.status === 'APPROVED',
      isAuthReady
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
