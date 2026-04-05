import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'CLINICAL' | 'CHW';

interface User {
  username: string;
  name: string;
  role: UserRole;
  clinic?: string;
  status: 'APPROVED' | 'PENDING';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (userData: Omit<User, 'status'>) => Promise<void>;
  pendingUsers: User[];
  allUsers: User[];
  approveUser: (username: string) => void;
  rejectUser: (username: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_USERS: User[] = [
  { username: 'admin', name: 'Dr. Athilo', role: 'ADMIN', status: 'APPROVED' },
  { username: 'clinician', name: 'Nurse Grace', role: 'CLINICAL', clinic: 'General', status: 'APPROVED' },
  { username: 'chw', name: 'Officer John', role: 'CHW', clinic: 'Community', status: 'APPROVED' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mdeka_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mdeka_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('mdeka_all_users', JSON.stringify(users));
  }, [users]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const foundUser = users.find(u => u.username === username);
    
    if (!foundUser) return { success: false, message: 'User not found.' };
    
    // Mock password check
    const isValidPassword = (username === 'admin' && password === 'admin123') || 
                          (username === 'clinician' && password === 'clinic123') || 
                          (username === 'chw' && password === 'chw123') ||
                          (password === 'password123'); // Default for new users

    if (!isValidPassword) return { success: false, message: 'Invalid password.' };

    if (foundUser.status === 'PENDING') {
      return { success: false, message: 'Your account is pending admin approval.' };
    }

    setUser(foundUser);
    localStorage.setItem('mdeka_user', JSON.stringify(foundUser));
    return { success: true };
  };

  const register = async (userData: Omit<User, 'status'>) => {
    const newUser: User = { ...userData, status: 'PENDING' };
    setUsers(prev => [...prev, newUser]);
  };

  const approveUser = (username: string) => {
    setUsers(prev => prev.map(u => u.username === username ? { ...u, status: 'APPROVED' } : u));
  };

  const rejectUser = (username: string) => {
    setUsers(prev => prev.filter(u => u.username !== username));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mdeka_user');
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING');

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      pendingUsers, 
      allUsers: users,
      approveUser, 
      rejectUser,
      isAuthenticated: !!user 
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
