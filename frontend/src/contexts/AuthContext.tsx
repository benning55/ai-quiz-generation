"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';

// Admin emails list
export const ADMIN_EMAILS = ["bmaisonti@gmail.com", "liliantsang1414@gmail.com"]

// User data type
export interface UserData {
  userId: string;
  email: string;
  has_active_payment: boolean;
  member_tier?: string;
  expires_at?: string;
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
  const { isLoaded, userId, getToken } = useClerkAuth();
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

  // Sync with Clerk user data and fetch payment status from backend
  useEffect(() => {
    const syncUserData = async () => {
      if (isLoaded && user && userId) {
        try {
          // Get proper Clerk token
          const token = await getToken();
          if (!token) {
            console.log('No token available, skipping backend sync');
            return;
          }

          // Fetch user data from backend API
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
          const response = await fetch(`${API_URL}/api/user/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const backendUserData = await response.json();
            console.log('Backend user data:', backendUserData);
            
            const newUserData: UserData = {
              userId: userId,
              email: user.primaryEmailAddress?.emailAddress || '',
              has_active_payment: backendUserData.has_active_payment || false,
              member_tier: backendUserData.member_tier || '',
              expires_at: backendUserData.expires_at || '',
            };
            
            // Only update if data has changed
            if (JSON.stringify(newUserData) !== JSON.stringify(userData)) {
              console.log('Updating user data with backend response:', newUserData);
              setUserDataState(newUserData);
              localStorage.setItem('userData', JSON.stringify(newUserData));
            }
          } else {
            console.error('Failed to fetch user data from backend:', response.status);
            // Fallback to basic user data
            const basicUserData: UserData = {
              userId: userId,
              email: user.primaryEmailAddress?.emailAddress || '',
              has_active_payment: userData?.has_active_payment || false,
            };
            setUserDataState(basicUserData);
            localStorage.setItem('userData', JSON.stringify(basicUserData));
          }
        } catch (error) {
          console.error('Error fetching user data from backend:', error);
          // Fallback to basic user data
          const basicUserData: UserData = {
            userId: userId,
            email: user.primaryEmailAddress?.emailAddress || '',
            has_active_payment: userData?.has_active_payment || false,
          };
          setUserDataState(basicUserData);
          localStorage.setItem('userData', JSON.stringify(basicUserData));
        }
      } else if (isLoaded && !user) {
        // User signed out
        setUserDataState(null);
        localStorage.removeItem('userData');
      }
    };

    syncUserData();
  }, [isLoaded, user, userId]); // Removed userData dependency to avoid infinite loops

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