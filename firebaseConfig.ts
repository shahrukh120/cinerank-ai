import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <--- NEW IMPORTS

const firebaseConfig = {
  apiKey: "AIzaSyAbsQ6puUqM6UXYYyyJCwZ10yYkZJliaOA",
  authDomain: "movieapp-b7637.firebaseapp.com",
  projectId: "movieapp-b7637",
  storageBucket: "movieapp-b7637.firebasestorage.app",
  messagingSenderId: "647988914558",
  appId: "1:647988914558:web:8a6503ed9fc0c90b02eb2f",
  measurementId: "G-PHXNZJVCXK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // <--- EXPORT AUTH
export const googleProvider = new GoogleAuthProvider(); // <--- EXPORT PROVIDER