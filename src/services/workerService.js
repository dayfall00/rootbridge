import { collection, doc, getDoc, setDoc, updateDoc, query, where, onSnapshot, runTransaction, serverTimestamp } from "firebase/firestore";
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

export const toggleAvailability = async (uid, value) => {
  const workerRef = doc(db, "workers", uid);
  // Ensure document exists via setDoc merge before updating availability
  await setDoc(workerRef, { isAvailable: value, uid }, { merge: true });
};

export const fetchAvailableJobs = (callback) => {
  const jobsRef = collection(db, "jobs");
  const q = query(jobsRef, where("status", "==", "open"));
  return onSnapshot(q, (snapshot) => {
    const jobs = [];
    snapshot.forEach((docSnap) => {
      jobs.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(jobs);
  });
};

export const fetchMyJobs = (uid, callback) => {
  const jobsRef = collection(db, "jobs");
  const q = query(jobsRef, where("assignedTo", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const jobs = [];
    snapshot.forEach((docSnap) => {
      jobs.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(jobs);
  });
};

export const acceptJob = async (jobId, uid) => {
  const jobRef = doc(db, "jobs", jobId);
  await runTransaction(db, async (transaction) => {
    const jobDoc = await transaction.get(jobRef);
    if (!jobDoc.exists()) {
      throw new Error("Job does not exist!");
    }
    const data = jobDoc.data();
    if (data.status !== "open") {
      throw new Error("Job is no longer open for assignment.");
    }
    transaction.update(jobRef, {
      assignedTo: uid,
      status: "assigned"
    });
  });
};

/**
 * Worker requests completion — does NOT immediately set status to "completed".
 * Shopkeeper gets 48h to confirm or reject.
 */
export const requestJobCompletion = async (jobId, workerId) => {
  const jobRef = doc(db, "jobs", jobId);
  await runTransaction(db, async (transaction) => {
    const jobSnap = await transaction.get(jobRef);
    if (!jobSnap.exists()) throw new Error("Job not found.");
    const data = jobSnap.data();
    if (data.assignedTo !== workerId) throw new Error("Only the assigned worker can mark this job.");
    if (data.status !== "assigned") throw new Error("Job is not in assigned state.");
    if (data.completionRequested) throw new Error("Completion already requested.");
    transaction.update(jobRef, {
      completionRequested: true,
      completedByWorker:   true,
      completedAt:         serverTimestamp(),
    });
  });
};

/** Internal / fallback forceComplete – used by auto-completion logic. */
export const forceCompleteJob = async (jobId) => {
  const jobRef = doc(db, "jobs", jobId);
  await updateDoc(jobRef, { status: "completed" });
};
