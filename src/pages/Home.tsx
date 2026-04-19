import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>SongUp AI Blog</h1>
        <button onClick={() => navigate('/admin')} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Admin</button>
      </div>
      <p>Your AI-powered music promotion engine.</p>
      
      <div style={{ marginTop: '40px' }}>
        <h2>Latest News</h2>
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3>Coming soon...</h3>
          <p>The AI blog agent is posting three times daily.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
