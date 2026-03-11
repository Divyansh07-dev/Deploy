import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "loginonecart-d6df1.firebaseapp.com",
  projectId: "loginonecart-d6df1",
  storageBucket: "loginonecart-d6df1.firebasestorage.app",
  messagingSenderId: "437607548342",
  appId: "1:437607548342:web:e605038cf020e32e776d17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth,provider}