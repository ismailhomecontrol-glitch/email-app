import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const initDb = async () => {
  try {
    // Initial configuration
    await setDoc(doc(db, 'campaign_config', 'settings'), {
      dailyLimit: 20,
      isPaused: true,
      lastProcessed: null
    });

    // Sample contact
    await setDoc(doc(db, 'contacts', 'sample-music-creator'), {
      name: 'Sample Producer',
      email: 'sample@example.com',
      status: 'pending',
      last_contacted: null
    });

    console.log('Firestore initialized successfully.');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
};

initDb();
