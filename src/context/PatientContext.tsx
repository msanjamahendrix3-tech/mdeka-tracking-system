import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  clinic: string;
  phone: string;
  email: string;
  address: string;
  allergies?: string;
  medications?: string;
  registeredAt: string;
  status: 'Normal' | 'At Risk' | 'Critical';
}

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'registeredAt' | 'status'>) => void;
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

  const addPatient = (patientData: Omit<Patient, 'id' | 'registeredAt' | 'status'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substr(2, 9),
      registeredAt: new Date().toISOString(),
      status: 'Normal'
    };
    setPatients(prev => [newPatient, ...prev]);
  };

  const exportPatients = () => {
    if (patients.length === 0) return;
    
    const headers = ['ID', 'Name', 'DOB', 'Gender', 'Clinic', 'Phone', 'Email', 'Address', 'Status', 'Registered At'];
    const csvContent = [
      headers.join(','),
      ...patients.map(p => [
        p.id,
        `"${p.name}"`,
        p.dob,
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
    <PatientContext.Provider value={{ patients, addPatient, exportPatients }}>
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
