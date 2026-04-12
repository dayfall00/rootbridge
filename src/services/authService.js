import { RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase";

// 1. Initialize Recaptcha (Simple & Stable)
export const initRecaptcha = () => {
  if (window.recaptchaVerifier) return;

  const container = document.getElementById("recaptcha-container");

  if (!container) {
    console.error("recaptcha-container not found in DOM");
    return;
  }

  console.log("Initializing reCAPTCHA");

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA solved");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired");
      },
    }
  );

  window.recaptchaVerifier.render();

  console.log("reCAPTCHA initialized");
};

// 2. Normalize Phone Number
export const normalizePhoneNumber = (input) => {
  if (!input) throw new Error("Phone number is required");
  
  // Remove all non-digits
  const cleaned = input.replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  } else if (cleaned.length > 10 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  } else if (cleaned.length > 10 && input.startsWith("+")) {
    return `+${cleaned}`;
  }
  
  throw new Error("Invalid phone number format");
};

// Map Firebase errors
const mapFirebaseError = (error) => {
  switch (error.code) {
    case "auth/invalid-phone-number":
      return "The phone number entered is invalid. Please check the format.";
    case "auth/missing-app-credential":
      return "App verification failed. Please check your config and domain.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/quota-exceeded":
      return "SMS quota exceeded for this project.";
    default:
      return error.message || "Failed to send OTP. Please try again.";
  }
};

// 3. Send OTP Flow
export const sendOTP = async (phoneNumber) => {
  try {
    const appVerifier = window.recaptchaVerifier;

    if (!appVerifier) {
      throw new Error("reCAPTCHA not initialized properly");
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    console.log("Sending OTP to:", normalizedPhone);

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      normalizedPhone,
      appVerifier
    );

    window.confirmationResult = confirmationResult;

    console.log("OTP sent");

    return confirmationResult;
  } catch (error) {
    console.error("OTP error:", error.code, error);
    throw error;
  }
};

// 4. Verify OTP Flow
export const verifyOTP = async (otp) => {
  try {
    if (!window.confirmationResult) {
      throw new Error("Verification session expired");
    }
    
    const result = await window.confirmationResult.confirm(otp);
    return result.user;
  } catch (error) {
    console.error(`Verification error: ${error.code || 'UNKNOWN'}`, error);
    if (error.code === "auth/invalid-verification-code") {
      throw new Error("The OTP entered is incorrect.");
    }
    throw new Error(error.message || "Failed to verify OTP.");
  }
};

// 5. Google Auth Flow
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

// 6. Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User successfully logged out");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
