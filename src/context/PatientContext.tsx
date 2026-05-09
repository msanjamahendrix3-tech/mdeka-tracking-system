import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth, handleFirestoreError } from './AuthContext';

export interface FollowUpRecord {
  id: string;
  date: string;
  officer: string;
  notes: string;
  status: 'Completed' | 'Missed' | 'Scheduled';
}

export interface Patient {
  id: string;
  name: string;
  age: string;
  gender: string;
  clinic: string;
  clinicId: string;
  department: string;
  phone: string;
  email?: string;
  address: string;
  sector?: string;
  allergies?: string;
  medications?: string;
  ncdRegNumber?: string;
  bpMeasurement?: string;
  diabetesReading?: string;
  registeredAt: string;
  status: 'Normal' | 'At Risk' | 'Critical';
  assignedCHW?: string;
  followUps?: FollowUpRecord[];
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'registeredAt' | 'status' | 'followUps' | 'clinic' | 'clinicId'>) => Promise<void>;
  addFollowUp: (patientId: string, followUp: Omit<FollowUpRecord, 'id'>) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  exportPatients: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const { user, isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    // Only subscribe if auth is ready and user is authorized (Approved or Admin)
    const isAdminEmail = auth.currentUser?.email === 'msanjamahendrix3@gmail.com';
    const canAccess = isAuthenticated || (user?.role === 'ADMIN') || isAdminEmail;

    if (!isAuthReady || !canAccess) {
      setPatients([]);
      return;
    }

    let q;
    if (user?.role === 'SUPER_ADMIN') {
      q = query(collection(db, 'patients'), orderBy('registeredAt', 'desc'));
    } else if (user?.clinicId) {
      q = query(
        collection(db, 'patients'), 
        where('clinicId', '==', user.clinicId),
        orderBy('registeredAt', 'desc')
      );
    } else {
      setPatients([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      setPatients(patientsList);
    }, (error) => {
      // If we still get a permission error, it might be because the user document 
      // hasn't been created yet or status hasn't updated in the rule's cache.
      if (error.message.includes('insufficient permissions')) {
        console.warn('Patient subscription: Insufficient permissions. User might not be fully approved yet.');
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'patients');
    });

    return () => unsubscribe();
  }, [isAuthReady, isAuthenticated, user]);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'registeredAt' | 'status' | 'followUps' | 'clinic' | 'clinicId'>) => {
    if (!user?.clinicId) return;
    
    const newPatient = {
      ...patientData,
      clinic: user.clinic,
      clinicId: user.clinicId,
      registeredAt: new Date().toISOString(),
      status: 'Normal',
      followUps: []
    };
    try {
      await addDoc(collection(db, 'patients'), newPatient);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'patients');
    }
  };

  const addFollowUp = async (patientId: string, followUpData: Omit<FollowUpRecord, 'id'>) => {
    const newFollowUp: FollowUpRecord = {
      ...followUpData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedFollowUps = [newFollowUp, ...(patient.followUps || [])];
    
    try {
      await updateDoc(doc(db, 'patients', patientId), {
        followUps: updatedFollowUps
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `patients/${patientId}`);
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `patients/${patientId}`);
    }
  };

  const exportPatients = () => {
    if (patients.length === 0) return;
    
    const headers = ['ID', 'Name', 'Age', 'Gender', 'Clinic', 'Clinic ID', 'Department', 'Phone', 'Email', 'Address', 'Status', 'NCD ID', 'BP Measurement', 'Diabetes Reading', 'Registered At'];
    const csvContent = [
      headers.join(','),
      ...patients.map(p => [
        p.id,
        `"${p.name}"`,
        p.age,
        p.gender,
        p.clinic,
        p.clinicId,
        p.department,
        p.phone,
        p.email || '',
        `"${p.address}"`,
        p.status,
        `"${p.ncdRegNumber || ''}"`,
        `"${p.bpMeasurement || ''}"`,
        `"${p.diabetesReading || ''}"`,
        p.registeredAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mdek_patients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PatientContext.Provider value={{ patients, addPatient, addFollowUp, deletePatient, exportPatients }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}
