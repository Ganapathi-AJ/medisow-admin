import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3qtbHfR_2LCABzxb02ajX_RltoCF9Kkk",
  authDomain: "medisowapp.firebaseapp.com",
  projectId: "medisowapp",
  storageBucket: "medisowapp.appspot.com",
  messagingSenderId: "364603134322",
  appId: "1:364603134322:web:43fe9c197b8c7e38d34deb",
  measurementId: "G-49Z7HR593Y"
};

// Initialize Firebase
let firebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize services
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export { db, auth, storage }; 