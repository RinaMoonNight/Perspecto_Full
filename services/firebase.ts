import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyTB_BzR49skXtdWMq9kfC9MWjPufVv1s",
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