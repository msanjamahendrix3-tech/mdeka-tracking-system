import React, { createContext, useContext, useState, useEffect } from 'react';

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
  phone: string;
  email: string;
  address: string;
  allergies?: string;
  medications?: string;
  registeredAt: string;
  status: 'Normal' | 'At Risk' | 'Critical';
  assignedCHW?: string;
  followUps?: FollowUpRecord[];
}

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'registeredAt' | 'status' | 'followUps'>) => void;
  addFollowUp: (patientId: string, followUp: Omit<FollowUpRecord, 'id'>) => void;
  exportPatients: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('mdeka_patients');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mdeka_patients', JSON.stringify(patients));
  }, [patients]);

  const addPatient = (patientData: Omit<Patient, 'id' | 'registeredAt' | 'status' | 'followUps'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substr(2, 9),
      registeredAt: new Date().toISOString(),
      status: 'Normal',
      followUps: []
    };
    setPatients(prev => [newPatient, ...prev]);
  };

  const addFollowUp = (patientId: string, followUpData: Omit<FollowUpRecord, 'id'>) => {
    const newFollowUp: FollowUpRecord = {
      ...followUpData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { ...p, followUps: [newFollowUp, ...(p.followUps || [])] } 
        : p
    ));
  };

  const exportPatients = () => {
    if (patients.length === 0) return;
    
    const headers = ['ID', 'Name', 'Age', 'Gender', 'Clinic', 'Phone', 'Email', 'Address', 'Status', 'Registered At'];
    const csvContent = [
      headers.join(','),
      ...patients.map(p => [
        p.id,
        `"${p.name}"`,
        p.age,
        p.gender,
        p.clinic,
        p.phone,
        p.email,
        `"${p.address}"`,
        p.status,
        p.registeredAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mdeka_patients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PatientContext.Provider value={{ patients, addPatient, addFollowUp, exportPatients }}>
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
