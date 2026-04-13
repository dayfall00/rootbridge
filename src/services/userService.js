import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../constants/appConstants';
import { normalizeRole, normalizeCity } from '../utils/normalize';

export const getUser = async (uid) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
};

export const createUserIfNotExists = async (uid, phone) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newUser = {
      uid,
      phone,
      roles: [],
      primaryRole: null,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, newUser);
    return newUser;
  }
  return snap.data();
};

export const updateUserRoles = async (uid, roles, primaryRole) => {
  // Validate + normalize the role before persisting
  const normalizedRole = normalizeRole(primaryRole);
  const normalizedRoles = roles.map(r => normalizeRole(r));
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(userRef, { roles: normalizedRoles, primaryRole: normalizedRole });
};

export const updateUserProfile = async (uid, profileData) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  // Normalize city if present
  const normalized = { ...profileData };
  if (normalized.city !== undefined) {
    normalized.city = normalizeCity(normalized.city) ?? normalized.city;
  }
  await updateDoc(userRef, normalized);
};

export const getCustomerJobs = async (uid) => {
  const jobsRef = collection(db, COLLECTIONS.JOBS);
  const q = query(jobsRef, where('postedBy', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCustomerReviews = async (uid) => {
  const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
  const q = query(reviewsRef, where('customerId', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
