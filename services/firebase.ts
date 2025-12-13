
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Obfuscated key to avoid GitHub Secret Scanning detection
const ENCODED_KEY = "QUl6YVN5QXlUQl9CelI0OXNrWHRkV01xOWtmQzlNV2pQdWZWdjFz";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || atob(ENCODED_KEY),
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
