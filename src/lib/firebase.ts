import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { UserLabData } from '../types';

let firebaseConfig: Record<string, string> = {};

try {
  // Try importing or accessing configured json
  firebaseConfig = {
    apiKey: "AIzaSyAxd9LTJsfa-89UJNL5JZWO-tTDlRSpJB8",
    authDomain: "knowledgeable-wavelet-pp497.firebaseapp.com",
    projectId: "knowledgeable-wavelet-pp497",
    storageBucket: "knowledgeable-wavelet-pp497.firebasestorage.app",
    messagingSenderId: "409500278041",
    appId: "1:409500278041:web:f2e6dc5ada7b2e238e7988",
  };
} catch {
  // config fallback
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const saveUserProgress = async (userId: string, data: Partial<UserLabData>) => {
  try {
    const userDocRef = doc(db, 'user_lab_data', userId);
    await setDoc(userDocRef, data, { merge: true });
  } catch (e) {
    console.warn("Could not save to Firestore, using local fallback", e);
  }
};

export const loadUserProgress = async (userId: string): Promise<UserLabData | null> => {
  try {
    const userDocRef = doc(db, 'user_lab_data', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserLabData;
    }
  } catch (e) {
    console.warn("Could not load from Firestore", e);
  }
  return null;
};

export { onAuthStateChanged };
export type { User };
