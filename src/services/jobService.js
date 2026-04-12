import { collection, doc, setDoc, updateDoc, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";

export const createJob = async (jobData) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to post a job');
  }

  const jobPayload = {
    postedBy: user.uid,
    title: jobData.title,
    description: jobData.description,
    category: jobData.category,
    budget: Number(jobData.budget),
    status: 'open',
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, "jobs"), jobPayload);
  return { ...jobPayload, id: docRef.id };
};

export const updateJobStatus = async (jobId, status, assignedTo = null) => {
  const updateData = { status };
  if (assignedTo) updateData.assignedTo = assignedTo;
  await updateDoc(doc(db, "jobs", jobId), updateData);
};

// ── Shopkeeper: post a helper job ──────────────────────────────────────────
export const createHelperJob = async (jobData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be logged in to post a job');

  const jobPayload = {
    postedBy:      user.uid,
    assignedTo:    null,
    jobType:       'helper',
    status:        'open',
    title:         jobData.title,
    description:   jobData.description,
    category:      jobData.category,
    city:          jobData.city,
    budget:        Number(jobData.budget),
    workDuration:  jobData.workDuration,
    workingHours:  jobData.workingHours,
    contactNumber: jobData.contactNumber,
    createdAt:     serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'jobs'), jobPayload);
  return { ...jobPayload, id: docRef.id };
};

// ── Shopkeeper: subscribe to own helper jobs ────────────────────────────────
export const subscribeToShopkeeperJobs = (uid, callback) => {
  const q = query(
    collection(db, 'jobs'),
    where('postedBy', '==', uid),
    where('jobType', '==', 'helper')
  );
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(jobs);
  });
};

export const subscribeToJobs = (role, uid, callback) => {
  const jobsRef = collection(db, "jobs");
  let q;
  
  if (role === "business" || role === "customer") {
    // Jobs posted by this user
    q = query(jobsRef, where("postedBy", "==", uid));
  } else if (role === "worker") {
    // Jobs assigned to this worker
    q = query(jobsRef, where("assignedTo", "==", uid));
  } else {
    // Default fallback
    q = query(jobsRef, where("postedBy", "==", uid));
  }
  
  return onSnapshot(q, (snapshot) => {
    const jobs = [];
    snapshot.forEach((doc) => {
      jobs.push(doc.data());
    });
    callback(jobs);
  });
};

// ── Shopkeeper: confirm worker's completion request ─────────────────────────
export const confirmJobCompletion = async (jobId) => {
  await updateDoc(doc(db, 'jobs', jobId), {
    status: 'completed',
  });
};

// ── Shopkeeper: reject worker's completion request ──────────────────────────
export const rejectJobCompletion = async (jobId) => {
  await updateDoc(doc(db, 'jobs', jobId), {
    completionRequested: false,
    completedByWorker:   false,
    completedAt:         null,
  });
};
