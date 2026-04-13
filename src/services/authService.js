import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

// 0. Email + Password Registration
export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registration success:", result.user);
    return result.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// 1. Email + Password Login
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Email login success:", result.user);
    return result.user;
  } catch (error) {
    console.error("Email login error:", error);
    throw error;
  }
};

// 2. Google Auth Flow
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google login success:", user);
    return user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// 3. Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User successfully logged out");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
