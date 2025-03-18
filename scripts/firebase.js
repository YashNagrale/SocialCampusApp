// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  doc,
  addDoc, 
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  query, 
  orderBy,
  serverTimestamp,
  where 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js"; // ✅ Updated to 11.4.0

import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js"; // ✅ Updated to 11.4.0

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRoEu4SU8AkFKp7JkAayv3Tsl4K8as-zU",
  authDomain: "campus-community-app.firebaseapp.com",
  projectId: "campus-community-app",
  storageBucket: "campus-community-app.appspot.com",
  messagingSenderId: "733225026477",
  appId: "1:733225026477:web:4cda4c1d990e27a35f9724",
  measurementId: "G-433RBCYV2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase modules
export {  
  auth, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  db, 
  storage, 
  collection, 
  addDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  doc, 
  getDoc,
  ref, 
  uploadBytes, 
  getDownloadURL,
  increment,
  onSnapshot,
  query, 
  orderBy,
  serverTimestamp,
  where 
};

// ---------------------------------------------------------------------------

