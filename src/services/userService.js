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

export const getCustomerJobs = async (uid) => {
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const jobsRef = collection(db, "jobs");
  const q = query(jobsRef, where("postedBy", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCustomerReviews = async (uid) => {
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, where("customerId", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
