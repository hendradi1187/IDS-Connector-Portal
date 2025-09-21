// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5glMe-w7ry6_DI-CWPvTPuUCg63S-sl8",
  authDomain: "studio-433787308-386a9.firebaseapp.com",
  projectId: "studio-433787308-386a9",
  storageBucket: "studio-433787308-386a9.appspot.com",
  messagingSenderId: "551711991050",
  appId: "1:551711991050:web:1dd748d3ef4df2764506f3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
