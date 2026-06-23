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
import { useNotifications } from './NotificationContext';
import { getSupabaseClient } from '../lib/supabase';

export interface FollowUpRecord {
  id: string;
  date: string;
  officer: string;
  notes: string;
  status: 'Completed' | 'Missed' | 'Scheduled';
  opdNumber?: string;
  medications?: string;
  symptoms?: string;
  temperature?: string;
  bloodPressure?: string;
  photoUrl?: string;
  photoComment?: string;
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
  assignCHW: (patientId: string, chwName: string) => Promise<void>;
  addFollowUp: (patientId: string, followUp: Omit<FollowUpRecord, 'id'>, chwName?: string) => Promise<void>;
  updateFollowUpStatus: (patientId: string, followUpId: string, status: 'Completed' | 'Missed' | 'Scheduled') => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  exportPatients: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const { user, isAuthenticated, isAuthReady, allUsers } = useAuth();
  const { addNotification } = useNotifications();

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

  const assignCHW = async (patientId: string, chwName: string) => {
    try {
      await updateDoc(doc(db, 'patients', patientId), {
        assignedCHW: chwName
      });
      const chwUser = allUsers.find(u => u.name === chwName && u.role === 'CHW');
      if (chwUser) {
        const patient = patients.find(p => p.id === patientId);
        await addNotification({
          userId: chwUser.uid,
          title: 'New Patient Assignment',
          message: `You have been assigned to patient ${patient?.name || 'Unknown'}.`,
          type: 'INFO',
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `patients/${patientId}`);
    }
  };

  const addFollowUp = async (patientId: string, followUpData: Omit<FollowUpRecord, 'id'>, chwName?: string) => {
    const newFollowUp: FollowUpRecord = {
      ...followUpData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedFollowUps = [newFollowUp, ...(patient.followUps || [])];
    
    try {
      const updateData: any = {
        followUps: updatedFollowUps
      };

      if (chwName) {
        updateData.assignedCHW = chwName;
      }

      await updateDoc(doc(db, 'patients', patientId), updateData);
      
      if (chwName && followUpData.status === 'Scheduled') {
         const chwUser = allUsers.find(u => u.name === chwName && u.role === 'CHW');
         if (chwUser) {
           await addNotification({
             userId: chwUser.uid,
             title: 'New Follow-up Assignment',
             message: `You have been assigned a scheduled follow-up appointment for ${patient.name}.`,
             type: 'INFO'
           });
         }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `patients/${patientId}`);
    }
  };

  const updateFollowUpStatus = async (patientId: string, followUpId: string, status: 'Completed' | 'Missed' | 'Scheduled') => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient || !patient.followUps) return;

    const updatedFollowUps = patient.followUps.map(f =>
      f.id === followUpId ? { ...f, status } : f
    );

    try {
      await updateDoc(doc(db, 'patients', patientId), {
        followUps: updatedFollowUps
      });

      // Send notification if missed
      if (status === 'Missed' && patient.assignedCHW) {
        const chwUser = allUsers.find(u => u.name === patient.assignedCHW && u.role === 'CHW');
        if (chwUser) {
          await addNotification({
            userId: chwUser.uid,
            title: 'Patient Missed Appointment',
            message: `Patient ${patient.name} missed their appointment. You have been assigned their scheduled follow-up appointment.`,
            type: 'ALERT'
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `patients/${patientId}`);
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
      
      // Attempt to delete from Supabase if configured/active
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from('patients').delete().eq('id', patientId);
          console.log(`Successfully deleted patient ${patientId} from Supabase syncing reservoir.`);
        }
      } catch (sbErr) {
        console.warn('Supabase synchronized deletion failed (this is expected if not fully connected:', sbErr);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `patients/${patientId}`);
    }
  };

  const exportPatients = () => {
    if (patients.length === 0) return;
    
    const headers = ['ID', 'Name', 'Age', 'Gender', 'Clinic', 'Clinic ID', 'Department', 'Phone', 'Email', 'Address', 'Status', 'NCD ID', 'BP Measurement', 'Diabetes Reading', 'Registered At'];
    
    let csvContent = `HOSPITAL TRACKING SYSTEM - ALL PATIENTS REPORT\n`;
    csvContent += `Generated On,${new Date().toLocaleString()}\n\n`;
    csvContent += [
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
    <PatientContext.Provider value={{ patients, addPatient, assignCHW, addFollowUp, updateFollowUpStatus, deletePatient, exportPatients }}>
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
