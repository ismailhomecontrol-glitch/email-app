import React from 'react';

const Home = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to SongUp AI</h1>
      <p>Your AI-powered music promotion engine.</p>
      <div style={{ marginTop: '40px' }}>
        <h2>Latest News</h2>
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3>Coming soon...</h3>
          <p>Our automated blog agent will start posting here 3 times a day.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
