import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBXmIk4ugPK1WUZQOwWTQA0PQu4hZOfAFw",
  authDomain: "rootbridge-142cb.firebaseapp.com",
  projectId: "rootbridge-142cb",
  storageBucket: "rootbridge-142cb.firebasestorage.app",
  messagingSenderId: "605030565974",
  appId: "1:605030565974:web:ac71e95ade141904cb93f7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
