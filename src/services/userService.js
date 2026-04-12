import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const getUser = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};

export const createUserIfNotExists = async (uid, phone) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    const newUser = {
      uid,
      phone,
      roles: [],
      primaryRole: null,
      createdAt: serverTimestamp()
    };
    await setDoc(userRef, newUser);
    return newUser;
  }
  return snap.data();
};

export const updateUserRoles = async (uid, roles, primaryRole) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { roles, primaryRole });
};

export const updateUserProfile = async (uid, profileData) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, profileData);
};
