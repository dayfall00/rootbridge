import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { createUserIfNotExists } from '../services/userService';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData]     = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ── CRITICAL: Track the active role in a ref so it NEVER triggers re-runs ──
  // Using a mutable ref prevents the stale-closure → setActiveRole → re-render
  // → onSnapshot eval → setActiveRole cycle that caused infinite re-renders.
  const activeRoleRef  = useRef(null);
  const [activeRole, _setActiveRole] = useState(null);

  const setActiveRole = (role) => {
    activeRoleRef.current = role;
    _setActiveRole(role);
  };

  useEffect(() => {
    if (!currentUser) {
      setUserData(null);
      setActiveRole(null);
      setLoadingUser(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(
      userRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);

          // Only set activeRole ONCE (on first load, not on every Firestore update).
          // Read from ref — no stale closure, no state dependency.
          if (!activeRoleRef.current) {
            const role = data.primaryRole || data.roles?.[0] || null;
            if (role) setActiveRole(role);
          }
        } else {
          // Auto-create user document if missing
          try {
            const newUser = await createUserIfNotExists(
              currentUser.uid,
              currentUser.phoneNumber || null
            );
            setUserData(newUser);
          } catch (err) {
            console.error('[UserContext] Failed to create user doc:', err);
            setUserData(null);
          }
        }
        setLoadingUser(false);
      },
      (err) => {
        console.error('[UserContext] Snapshot error:', err);
        setLoadingUser(false);
      }
    );

    // Cleanup on uid change or unmount — prevents duplicate listeners
    return () => unsubscribe();
  }, [currentUser]); // ← depends ONLY on currentUser, never on activeRole

  const value = {
    userData,
    loadingUser,
    activeRole,
    setActiveRole, // Enables UI-only role switching without Firestore write
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
