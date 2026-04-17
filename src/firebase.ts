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

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
