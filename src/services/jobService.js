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
