import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlpMON9gaadWOyiX2rdjBp7zKaGxtJTQ0",
  authDomain: "ai-waste-classification-system.firebaseapp.com",
  projectId: "ai-waste-classification-system",
  storageBucket: "ai-waste-classification-system.firebasestorage.app",
  messagingSenderId: "1069701315927",
  appId: "1:1069701315927:web:4c2fc2f3a7f7a051ed1212",
  measurementId: "G-0QQ6THCEJC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
