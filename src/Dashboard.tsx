import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const Dashboard = () => {
  const [config, setConfig] = useState({ dailyLimit: 20, isPaused: true });

  useEffect(() => {
    // Load config from Firestore
    const fetchConfig = async () => {
      const docRef = doc(db, 'campaign_config', 'settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as any);
      }
    };
    fetchConfig();
  }, []);

  const toggleCampaign = async () => {
    const newState = !config.isPaused;
    await updateDoc(doc(db, 'campaign_config', 'settings'), { isPaused: newState });
    setConfig({ ...config, isPaused: newState });
  };

  const updateLimit = async (newLimit: number) => {
    await updateDoc(doc(db, 'campaign_config', 'settings'), { dailyLimit: newLimit });
    setConfig({ ...config, dailyLimit: newLimit });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Campaign Dashboard</h1>
      <button onClick={toggleCampaign}>
        {config.isPaused ? 'Start Campaign' : 'Stop Campaign'}
      </button>
      <div>
        <label>Daily Limit: </label>
        <input 
          type="number" 
          value={config.dailyLimit} 
          onChange={(e) => updateLimit(Number(e.target.value))} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
