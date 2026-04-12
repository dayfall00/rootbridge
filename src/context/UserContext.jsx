import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { createUserIfNotExists } from '../services/userService';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let unsubscribe;

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      unsubscribe = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          
          if (data.primaryRole && !activeRole) {
            setActiveRole(data.primaryRole);
          } else if (!activeRole && data.roles && data.roles.length > 0) {
            setActiveRole(data.roles[0]);
          }
          setLoadingUser(false);
        } else {
          // CREATE IF MISSING: Create user in Firestore
          try {
            const newUserData = await createUserIfNotExists(currentUser.uid, currentUser.phoneNumber || currentUser.email || 'Unknown');
            setUserData(newUserData);
          } catch (error) {
            console.error("Error creating missing user in Firestore:", error);
            setUserData(null);
          }
          setLoadingUser(false);
        }
      }, (error) => {
        console.error("UserContext Snapshot Error:", error);
        setLoadingUser(false);
      });
    } else {
      setUserData(null);
      setActiveRole(null);
      setLoadingUser(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]); // Note: removing activeRole from dependency array to prevent activeRole resets on pure Data changes

  const value = {
    userData,
    loadingUser,
    activeRole,
    setActiveRole // Enables UI-only context switching
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
