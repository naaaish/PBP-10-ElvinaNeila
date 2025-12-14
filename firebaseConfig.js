import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// PASTIKAN KUNCI INI SUDAH BENAR
const firebaseConfig = {
  apiKey: "AIzaSyDymRz3bcteg88gRhdw75uZvwwkk9dEc7I",
  authDomain: "pbp-1-83044.firebaseapp.com",
  projectId: "pbp-1-83044",
  storageBucket: "pbp-1-83044.firebasestorage.app",
  messagingSenderId: "577431938272",
  appId: "1:577431938272:web:157df50133852a7a955c85",
  measurementId: "G-7DLKPZ0GT5",
};

const app = initializeApp(firebaseConfig);

let authInstance = null;
let dbInstance = null;

// FUNGSI MALAS untuk mendapatkan Auth instance (Mencegah Crash di Server Metro)
export const getAuth = () => {
  if (!authInstance) {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  }
  return authInstance;
};

// FUNGSI MALAS untuk mendapatkan Firestore instance (Mencegah Crash)
export const getDb = () => {
  if (!dbInstance) {
    dbInstance = getFirestore(app);
  }
  return dbInstance;
};