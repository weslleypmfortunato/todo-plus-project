import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyARHKHvp3q6JxrGRtygtKCNOtt7YgYmSHw",
  authDomain: "taskplus-d2c46.firebaseapp.com",
  projectId: "taskplus-d2c46",
  storageBucket: "taskplus-d2c46.appspot.com",
  messagingSenderId: "546018350219",
  appId: "1:546018350219:web:bfb594522e28538e72708e"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export { db }