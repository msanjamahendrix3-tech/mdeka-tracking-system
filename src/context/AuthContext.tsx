import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
  where,
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CLINICAL' | 'CHW';

interface UserProfile {
  username: string;
  name: string;
  role: UserRole;
  clinic: string;
  clinicId: string;
  status: 'APPROVED' | 'PENDING';
  email: string;
  uid: string;
}

export interface Clinic {
  id: string;
  name: string;
  code: string;
  address: string;
  village?: string;
  ta?: string;
  ownerUid: string;
  status: 'ACTIVE' | 'SUSPENDED';
  subscriptionStatus: 'PAID' | 'UNPAID';
  createdAt: number;
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
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
  registerWithEmail: (email: string, password: string, userData: Omit<UserProfile, 'status' | 'uid' | 'email'>, clinicData?: Omit<Clinic, 'id' | 'ownerUid' | 'status' | 'createdAt' | 'subscriptionStatus'>) => Promise<{ success: boolean; message?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  approvePasswordReset: (requestId: string) => Promise<void>;
  rejectPasswordReset: (requestId: string) => Promise<void>;
  requestResource: (topic: string, message: string) => Promise<{ success: boolean; message?: string }>;
  resolveResourceRequest: (requestId: string) => Promise<void>;
  pendingUsers: UserProfile[];
  resetRequests: PasswordResetRequest[];
  resourceRequests: ResourceRequest[];
  allUsers: UserProfile[];
  allClinics: Clinic[];
  approveUser: (uid: string) => void;
  rejectUser: (uid: string) => void;
  deleteUser: (uid: string) => Promise<void>;
  deleteClinic: (clinicId: string) => Promise<void>;
  updateClinicStatus: (clinicId: string, status: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
  updateClinicSubscription: (clinicId: string, status: 'PAID' | 'UNPAID') => Promise<void>;
  createClinic: (clinicData: Omit<Clinic, 'id' | 'ownerUid' | 'status' | 'createdAt' | 'subscriptionStatus'>) => Promise<{ success: boolean; clinicId?: string; message?: string }>;
  getClinicByCode: (code: string) => Promise<Clinic | null>;
  getClinicById: (id: string) => Promise<Clinic | null>;
  getPublicClinics: () => Promise<Clinic[]>;
  regenerateClinicCode: (clinicId: string) => Promise<{ success: boolean; newCode?: string; message?: string }>;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

export interface ResourceRequest {
  id: string;
  userId: string;
  userName: string;
  clinicId: string;
  clinicName: string;
  topic: string;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  requestedAt: number;
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  name?: string;
  clinic?: string;
  clinicId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allClinics, setAllClinics] = useState<Clinic[]>([]);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    console.log('AuthContext: Initializing auth listener...');
    let unsubscribeUserDoc: (() => void) | null = null;
    
    // Safety timeout: Ensure app becomes "ready" even if Firebase hangs
    const safetyTimeout = setTimeout(() => {
      if (!isAuthReady) {
        console.warn('AuthContext: Safety timeout reached. Forcing isAuthReady to true.');
        setIsAuthReady(true);
      }
    }, 10000);

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthContext: onAuthStateChanged fired', firebaseUser?.email || 'No user');
      
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time updates to the user profile (e.g. approval status)
        unsubscribeUserDoc = onSnapshot(userDocRef, async (docSnap) => {
          console.log('AuthContext: User snapshot received', docSnap.exists() ? 'Exists' : 'Does not exist');
          try {
            if (docSnap.exists()) {
              let profile = docSnap.data() as UserProfile;
              if (!profile) {
                console.error('AuthContext: User profile data is empty');
                setUser(null);
                return;
              }
              
              // Check clinic status/subscription if not SUPER_ADMIN
              if (profile.role !== 'SUPER_ADMIN' && profile.clinicId && profile.clinicId !== 'SYSTEM') {
                try {
                  const clinicRef = doc(db, 'clinics', profile.clinicId);
                  const clinicSnap = await getDoc(clinicRef);
                  if (clinicSnap.exists()) {
                    const clinicData = clinicSnap.data() as Clinic;
                    if (clinicData.status === 'SUSPENDED' || clinicData.subscriptionStatus === 'UNPAID') {
                      setUser({ ...profile, status: 'PENDING' }); // Force to pending or restricted state
                      return;
                    }
                  }
                } catch (clinicErr) {
                  console.warn('AuthContext: Clinic check failed:', clinicErr);
                }
              }

              if (firebaseUser.email === 'msanjamahendrix3@gmail.com') {
                profile = { ...profile, status: 'APPROVED', role: 'SUPER_ADMIN', clinicId: 'SYSTEM', clinic: 'System' };
              }
              setUser(profile);
            } else if (firebaseUser.email === 'msanjamahendrix3@gmail.com') {
              console.log('AuthContext: Creating profile for Super Admin (email match)');
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || 'Admin',
                username: 'admin',
                role: 'SUPER_ADMIN',
                clinic: 'System',
                clinicId: 'SYSTEM',
                status: 'APPROVED'
              });
            } else {
              console.log('AuthContext: No profile found, user not approved');
              setUser(null);
            }
          } catch (err) {
            console.error('AuthContext: Error processing user snapshot:', err);
            setUser(null);
          } finally {
            clearTimeout(safetyTimeout);
            setIsAuthReady(true);
          }
        }, (error) => {
          console.warn('AuthContext: User profile listener error:', error);
          clearTimeout(safetyTimeout);
          setIsAuthReady(true);
        });
      } else {
        console.log('AuthContext: No authenticated user');
        setUser(null);
        clearTimeout(safetyTimeout);
        setIsAuthReady(true);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  useEffect(() => {
    if ((user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && user?.status === 'APPROVED') {
      const resetsRef = collection(db, 'password_reset_requests');
      const q = user.role === 'SUPER_ADMIN' 
        ? resetsRef 
        : query(resetsRef, where('clinicId', '==', user.clinicId));

      const unsubscribeResets = onSnapshot(q, (snapshot) => {
        const resetList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as PasswordResetRequest);
        setResetRequests(resetList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'password_reset_requests');
      });

      const resourcesRef = collection(db, 'resource_requests');
      const qResources = user.role === 'SUPER_ADMIN' 
        ? resourcesRef 
        : query(resourcesRef, where('clinicId', '==', user.clinicId));

      const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
        const reqList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ResourceRequest);
        setResourceRequests(reqList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'resource_requests');
      });

      return () => {
        unsubscribeResets();
        unsubscribeResources();
      };
    }
  }, [user]);

  useEffect(() => {
    if ((user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && user?.status === 'APPROVED') {
      const usersRef = collection(db, 'users');
      const q = user.role === 'SUPER_ADMIN' 
        ? usersRef 
        : query(usersRef, where('clinicId', '==', user.clinicId));

      const unsubscribeUsers = onSnapshot(q, (snapshot) => {
        const usersList = snapshot.docs.map(doc => doc.data() as UserProfile);
        setAllUsers(usersList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });
      return () => unsubscribeUsers();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      const q = collection(db, 'clinics');
      const unsubscribeClinics = onSnapshot(q, (snapshot) => {
        const clinicsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Clinic);
        setAllClinics(clinicsList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'clinics');
      });
      return () => unsubscribeClinics();
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
        let profile = userDoc.data() as UserProfile;
        if (firebaseUser.email === 'msanjamahendrix3@gmail.com') {
          profile = { ...profile, status: 'APPROVED', role: 'SUPER_ADMIN', clinicId: 'SYSTEM', clinic: 'System' };
          try {
            await updateDoc(userDocRef, { status: 'APPROVED', role: 'SUPER_ADMIN', clinicId: 'SYSTEM', clinic: 'System' });
          } catch(e) {
             console.warn("Could not auto-upgrade admin doc", e);
          }
        }
        
        if (profile.status === 'PENDING') {
          return { success: false, message: 'Your account is pending admin approval.' };
        }
        setUser(profile);
        return { success: true };
      } else if (firebaseUser.email === 'msanjamahendrix3@gmail.com') {
        const adminProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'Admin',
          username: 'admin',
          role: 'SUPER_ADMIN',
          clinic: 'System',
          clinicId: 'SYSTEM',
          status: 'APPROVED'
        };
        await setDoc(userDocRef, adminProfile);
        setUser(adminProfile);
        return { success: true };
      } else {
        // First time login - need to register
        return { success: true, message: 'NEW_USER' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Login was cancelled because the popup was closed. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Login popup was blocked by your browser. Please enable popups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = 'Only one login popup can be opened at a time.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Connectivity issue: Please check your internet connection or disable any ad-blockers/VPNs that might be blocking Google services.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with the same email address but different sign-in credentials.';
      }
      
      return { success: false, message };
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        let profile = userDoc.data() as UserProfile;

        // Check clinic status
        if (profile.role !== 'SUPER_ADMIN' && profile.clinicId && profile.clinicId !== 'SYSTEM') {
          const clinicSnap = await getDoc(doc(db, 'clinics', profile.clinicId));
          if (clinicSnap.exists()) {
            const clinic = clinicSnap.data() as Clinic;
            if (clinic.status === 'SUSPENDED' || clinic.subscriptionStatus === 'UNPAID') {
              await signOut(auth);
              return { success: false, message: 'Your clinic subscription is inactive or unpaid. Access is locked.' };
            }
          }
        }

        if (email === 'msanjamahendrix3@gmail.com') {
          profile = { ...profile, status: 'APPROVED', role: 'SUPER_ADMIN', clinicId: 'SYSTEM', clinic: 'System' };
          try {
            await updateDoc(userDocRef, { status: 'APPROVED', role: 'SUPER_ADMIN', clinicId: 'SYSTEM', clinic: 'System' });
          } catch(e) {
             console.warn("Could not auto-upgrade admin doc", e);
          }
        }

        if (profile.status === 'PENDING') {
          return { success: false, message: 'Your account is pending admin approval.' };
        }
        setUser(profile);
        return { success: true };
      } else if (email === 'msanjamahendrix3@gmail.com') {
        const adminProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: email,
          name: 'Admin',
          username: 'admin',
          role: 'SUPER_ADMIN',
          clinic: 'System',
          clinicId: 'SYSTEM',
          status: 'APPROVED'
        };
        await setDoc(userDocRef, adminProfile);
        setUser(adminProfile);
        return { success: true };
      } else {
        return { success: false, message: 'User profile not found. Please register.' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let message = error.message || 'Login failed. Please check your credentials.';
      
      // Map common Firebase Auth errors to user-friendly messages
      const errorCode = error.code || '';
      const errorMessage = error.message || '';

      if (errorCode === 'auth/user-not-found' || 
          errorCode === 'auth/wrong-password' || 
          errorCode === 'auth/invalid-credential' ||
          errorCode === 'auth/invalid-login-credentials' ||
          errorCode === 'auth/invalid-email' ||
          errorMessage.includes('auth/invalid-credential') ||
          errorMessage.includes('invalid-login-credentials')) {
        message = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorCode === 'auth/user-disabled') {
        message = 'This account has been disabled. Please contact support.';
      } else if (errorCode === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.';
      } else if (errorCode === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is not enabled. Please use Google Login or contact the administrator.';
      } else if (errorCode === 'auth/network-request-failed') {
        message = 'Connectivity issue: Please check your internet connection or disable any ad-blockers/VPNs that might be blocking Google services.';
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

  const registerWithEmail = async (
    email: string, 
    password: string, 
    userData: Omit<UserProfile, 'status' | 'uid' | 'email'>,
    clinicData?: Omit<Clinic, 'id' | 'ownerUid' | 'status' | 'createdAt' | 'subscriptionStatus'>
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      const isBootstrapAdmin = email === 'msanjamahendrix3@gmail.com';
      let finalClinicId = userData.clinicId;
      let finalClinicName = userData.clinic;

      // Handle clinic creation if it's an admin registration
      if (userData.role === 'ADMIN' && clinicData) {
        const clinicId = Math.random().toString(36).substr(2, 9).toUpperCase();
        const newClinic: Clinic = {
          ...clinicData,
          id: clinicId,
          ownerUid: firebaseUser.uid,
          status: 'ACTIVE',
          subscriptionStatus: 'UNPAID', // Start as unpaid
          createdAt: Date.now()
        };
        try {
          await setDoc(doc(db, 'clinics', clinicId), newClinic);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `clinics/${clinicId}`);
          return { success: false, message: 'Failed to create clinic document. Please check security rules.' };
        }
        finalClinicId = clinicId;
        finalClinicName = clinicData.name;
      }
      
      const newUser: UserProfile = { 
        ...userData, 
        status: isBootstrapAdmin ? 'APPROVED' : 'PENDING', 
        uid: firebaseUser.uid,
        email: email,
        role: isBootstrapAdmin ? 'SUPER_ADMIN' : userData.role,
        clinic: isBootstrapAdmin ? 'System' : finalClinicName,
        clinicId: isBootstrapAdmin ? 'SYSTEM' : finalClinicId
      };
      
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
        return { success: false, message: 'Failed to create user profile. Please check security rules.' };
      }
      
      setUser(newUser);
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already in use. Try signing in instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is not enabled. Please enable it in Firebase Authentication settings.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'The email address is invalid.';
      } else if (error.message) {
        message = error.message;
      }
      
      return { success: false, message };
    }
  };

  const createClinic = async (clinicData: Omit<Clinic, 'id' | 'ownerUid' | 'status' | 'createdAt' | 'subscriptionStatus'>): Promise<{ success: boolean; clinicId?: string; message?: string }> => {
    try {
      if (!auth.currentUser) return { success: false, message: 'Not authenticated' };
      
      const clinicId = Math.random().toString(36).substr(2, 9).toUpperCase();
      const newClinic: Clinic = {
        ...clinicData,
        id: clinicId,
        ownerUid: auth.currentUser.uid,
        status: 'ACTIVE',
        subscriptionStatus: 'UNPAID',
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'clinics', clinicId), newClinic);
      return { success: true, clinicId };
    } catch (error) {
      console.error('Create clinic error:', error);
      return { success: false, message: 'Failed to create clinic.' };
    }
  };

  const approveUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'APPROVED' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };
  
  const updateClinicStatus = async (clinicId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    try {
      await updateDoc(doc(db, 'clinics', clinicId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}`);
    }
  };

  const updateClinicSubscription = async (clinicId: string, subscriptionStatus: 'PAID' | 'UNPAID') => {
    try {
      await updateDoc(doc(db, 'clinics', clinicId), { subscriptionStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}`);
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const requestId = Math.random().toString(36).substr(2, 9).toUpperCase();
      const newRequest: PasswordResetRequest = {
        id: requestId,
        email,
        status: 'PENDING',
        requestedAt: Date.now()
      };
      await setDoc(doc(db, 'password_reset_requests', requestId), newRequest);
      return { success: true, message: 'Password reset request submitted. Please wait for admin approval.' };
    } catch (error) {
      console.error('Reset request error:', error);
      return { success: false, message: 'Failed to submit reset request.' };
    }
  };

  const approvePasswordReset = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'password_reset_requests', requestId);
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) return;
      
      const requestData = requestDoc.data() as PasswordResetRequest;
      await sendPasswordResetEmail(auth, requestData.email);
      await updateDoc(requestRef, { 
        status: 'APPROVED',
        resolvedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `password_reset_requests/${requestId}`);
    }
  };

  const rejectPasswordReset = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'password_reset_requests', requestId), { 
        status: 'REJECTED',
        resolvedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `password_reset_requests/${requestId}`);
    }
  };

  const requestResource = async (topic: string, message: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'You must be logged in to request a resource.' };
    try {
      const requestId = Math.random().toString(36).substr(2, 9).toUpperCase();
      const newRequest: ResourceRequest = {
        id: requestId,
        userId: user.uid,
        userName: user.name,
        clinicId: user.clinicId || '',
        clinicName: user.clinic || '',
        topic,
        message,
        status: 'PENDING',
        requestedAt: Date.now()
      };
      await setDoc(doc(db, 'resource_requests', requestId), newRequest);
      return { success: true, message: 'Resource request submitted successfully.' };
    } catch (error) {
      console.error('Resource request error:', error);
      return { success: false, message: 'Failed to submit resource request.' };
    }
  };

  const resolveResourceRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'resource_requests', requestId), { 
        status: 'RESOLVED',
        resolvedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `resource_requests/${requestId}`);
    }
  };

  const rejectUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      if (uid === auth.currentUser?.uid) {
        throw new Error("You cannot delete your own account.");
      }
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  const deleteClinic = async (clinicId: string) => {
    try {
      // 1. Delete all users belonging to this clinic
      const usersQuery = query(collection(db, 'users'), where('clinicId', '==', clinicId));
      const usersSnapshot = await getDocs(usersQuery);
      
      const deleteUserPromises = usersSnapshot.docs.map(userDoc => 
        deleteDoc(doc(db, 'users', userDoc.id))
      );
      await Promise.all(deleteUserPromises);

      // 2. Delete all patients belonging to this clinic
      const patientsQuery = query(collection(db, 'patients'), where('clinicId', '==', clinicId));
      const patientsSnapshot = await getDocs(patientsQuery);
      
      const deletePatientPromises = patientsSnapshot.docs.map(patientDoc => 
        deleteDoc(doc(db, 'patients', patientDoc.id))
      );
      await Promise.all(deletePatientPromises);

      // 3. Delete the clinic itself
      await deleteDoc(doc(db, 'clinics', clinicId));
    } catch (error: any) {
      console.error("deleteClinic Error:", error);
      alert("Failed to delete clinic: " + (error.message || String(error)));
      handleFirestoreError(error, OperationType.DELETE, `clinics/${clinicId}`);
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
      requestPasswordReset,
      approvePasswordReset,
      rejectPasswordReset,
      requestResource,
      resolveResourceRequest,
      pendingUsers,
      resetRequests,
      resourceRequests,
      allUsers,
      allClinics,
      approveUser, 
      rejectUser,
      deleteUser,
      deleteClinic,
      updateClinicStatus,
      updateClinicSubscription,
      createClinic,
      getClinicByCode: async (code: string) => {
        const q = query(collection(db, 'clinics'), where('code', '==', code.toUpperCase()));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Clinic;
      },
      getClinicById: async (id: string) => {
        const docRef = doc(db, 'clinics', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Clinic;
        }
        return null;
      },
      getPublicClinics: async () => {
        const clinicsRef = collection(db, 'clinics');
        const snapshot = await getDocs(clinicsRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Clinic);
      },
      regenerateClinicCode: async (clinicId: string) => {
        try {
          const charset = '0123456789';
          let newCode = '';
          for (let i = 0; i < 6; i++) {
            newCode += charset.charAt(Math.floor(Math.random() * charset.length));
          }
          await updateDoc(doc(db, 'clinics', clinicId), { code: newCode });
          return { success: true, newCode };
        } catch (error) {
          console.error('Regenerate code error:', error);
          return { success: false, message: 'Failed to regenerate code.' };
        }
      },
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
