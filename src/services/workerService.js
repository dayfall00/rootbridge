import { collection, doc, getDoc, setDoc, updateDoc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export const createOrUpdateWorker = async (uid, data) => {
  const workerRef = doc(db, "workers", uid);
  const snap = await getDoc(workerRef);
  
  if (!snap.exists()) {
    const defaultData = {
      uid,
      category: data.category || null,
      isAvailable: false,
      rating: 0,
      completedJobs: 0,
      city: data.city || null
    };
    await setDoc(workerRef, defaultData);
  } else {
    await updateDoc(workerRef, data);
  }
};

export const updateWorkerAvailability = async (uid, isAvailable) => {
  const workerRef = doc(db, "workers", uid);
  await updateDoc(workerRef, { isAvailable });
};

export const subscribeToWorkers = (category, city, callback) => {
  const workersRef = collection(db, "workers");
  let q = query(workersRef, where("isAvailable", "==", true));
  
  if (category) {
    q = query(q, where("category", "==", category));
  }
  if (city) {
    q = query(q, where("city", "==", city));
  }
  
  return onSnapshot(q, (snapshot) => {
    const workers = [];
    snapshot.forEach((doc) => {
      workers.push(doc.data());
    });
    callback(workers);
  });
};
