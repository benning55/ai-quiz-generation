import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDmNbk1RgKdttRrdnwsgtqT-7PuFReCus",
  authDomain: "saveboost-1e0a0.firebaseapp.com",
  projectId: "saveboost-1e0a0",
  storageBucket: "saveboost-1e0a0.firebasestorage.app",
  messagingSenderId: "92753325779",
  appId: "1:92753325779:web:9b4a46e9f75201b48bae26",
  measurementId: "G-7DJTP56FFF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
