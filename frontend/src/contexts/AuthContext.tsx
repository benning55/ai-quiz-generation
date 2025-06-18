"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';

// Admin emails list
export const ADMIN_EMAILS = ['bmaisonti@gmail.com'];

// User data type
export interface UserData {
  userId: string;
  email: string;
  has_active_payment: boolean;
}

// Context type
interface AuthContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoaded, userId } = useClerkAuth();
  const { user } = useUser();
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  const isAdmin = userData?.email ? ADMIN_EMAILS.includes(userData.email) : false;

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData);
        setUserDataState(parsed);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  // Sync with Clerk user data
  useEffect(() => {
    if (isLoaded && user) {
      const newUserData: UserData = {
        userId: userId || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        has_active_payment: userData?.has_active_payment || false, // Preserve payment status
      };
      
      // Only update if data has changed
      if (JSON.stringify(newUserData) !== JSON.stringify(userData)) {
        setUserDataState(newUserData);
        localStorage.setItem('userData', JSON.stringify(newUserData));
      }
    } else if (isLoaded && !user) {
      // User signed out
      setUserDataState(null);
      localStorage.removeItem('userData');
    }
  }, [isLoaded, user, userId, userData?.has_active_payment]);

  // Set user data function with localStorage sync
  const setUserData = (data: UserData | null) => {
    setUserDataState(data);
    if (data) {
      localStorage.setItem('userData', JSON.stringify(data));
    } else {
      localStorage.removeItem('userData');
    }
  };

  const value: AuthContextType = {
    userData,
    setUserData,
    isAdmin,
    isLoading: isLoading || !isLoaded,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 