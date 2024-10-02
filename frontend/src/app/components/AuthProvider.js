/**
 * This file is for setting up the AuthProvider.
 * It helps to manage and provide authentication info to the rest of the app.
 */
"use client";
import React, { createContext, useContext } from 'react';
import { useAuth } from '../lib/useAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}