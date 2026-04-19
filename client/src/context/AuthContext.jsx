import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('token', token);
        
        try {
          // Sync with backend to get MongoDB User info
          const { data } = await API.post('/auth/sync');
          setUser({
            id: data.id, // Use MongoDB _id for history queries
            name: data.name,
            email: data.email,
            uid: firebaseUser.uid // Keep Firebase UID just in case
          });
        } catch (err) {
          console.error('Failed to sync user:', err);
          // Fallback to basic firebase info if sync fails
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
