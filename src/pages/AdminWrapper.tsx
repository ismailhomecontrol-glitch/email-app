import React, { useState } from 'react';
import Admin from '../pages/Admin';

const AdminWrapper = () => {
  const [pin, setPin] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkPin = () => {
    if (pin === '7511864') {
      setIsAuthorized(true);
    } else {
      alert('Invalid PIN');
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h2>Enter Admin PIN</h2>
        <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} style={{ padding: '10px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }} />
        <button onClick={checkPin} style={{ padding: '10px 20px', borderRadius: '5px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}>Login</button>
      </div>
    );
  }

  return <Admin />;
};

export default AdminWrapper;
