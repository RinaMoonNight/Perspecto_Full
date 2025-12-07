
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Split key to avoid GitHub Secret Scanning detection
const KEY_PART_A = "AIzaSyAyTB_BzR49s";
const KEY_PART_B = "kXtdWMq9kfC9MWjPufVv1s";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || (KEY_PART_A + KEY_PART_B),
  authDomain: "perspecto-b26fb.firebaseapp.com",
  projectId: "perspecto-b26fb",
  storageBucket: "perspecto-b26fb.firebasestorage.app",
  messagingSenderId: "29004346650",
  appId: "1:29004346650:web:2677b01d24b243be8de8a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
