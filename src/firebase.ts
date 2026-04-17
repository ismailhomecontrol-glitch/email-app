import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "placeholder-key",
  authDomain: "placeholder.firebaseapp.com",
  projectId: "placeholder-id",
  storageBucket: "placeholder.appspot.com",
  messagingSenderId: "placeholder-sender",
  appId: "placeholder-app"
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.error("Firebase initialization failed:", e);
}
export const db = app ? getFirestore(app) : null;
