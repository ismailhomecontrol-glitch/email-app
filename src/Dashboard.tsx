import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [view, setView] = useState<'stats' | 'contacts'>('stats');
  const [config, setConfig] = useState({ dailyLimit: 20, isPaused: true });
  const [stats, setStats] = useState({ total: 0, sent: 0, pending: 0 });
  const [contacts, setContacts] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (data.stats) setStats(data.stats);
      if (data.config) setConfig(data.config);
      if (data.contacts) setContacts(data.contacts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const toggleCampaign = async () => {
    const newState = !config.isPaused;
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaused: newState }),
      });
      setConfig({ ...config, isPaused: newState });
    } catch (error) {
      console.error("Error toggling campaign:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const text = await file.text();
    const emails = text.split(/\r?\n/).map(e => e.trim()).filter(e => e.includes('@'));
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      fetchData();
      alert("Upload complete!");
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div style={{ 
      fontFamily: '-apple-system, system-ui, sans-serif',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      padding: '10px'
    }}>
      {/* Mobile-Friendly Header */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '12px',
        marginBottom: '15px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => setView('stats')}
          style={{ 
            border: 'none', background: 'none', fontWeight: view === 'stats' ? 'bold' : 'normal',
            color: view === 'stats' ? '#3b82f6' : '#6b7280'
          }}
        >
          📊 Stats
        </button>
        <button 
          onClick={() => setView('contacts')}
          style={{ 
            border: 'none', background: 'none', fontWeight: view === 'contacts' ? 'bold' : 'normal',
            color: view === 'contacts' ? '#3b82f6' : '#6b7280'
          }}
        >
          👥 Contacts
        </button>
      </nav>

      {view === 'stats' ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ 
            backgroundColor: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '15px',
            border: `2px solid ${config.isPaused ? '#fee2e2' : '#dcfce7'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {config.isPaused ? '🔴 Paused' : '🟢 Running'}
              </span>
              <button 
                onClick={toggleCampaign}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  backgroundColor: config.isPaused ? '#10b981' : '#ef4444',
                  color: '#fff', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {config.isPaused ? 'Start' : 'Stop'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div style={cardStyle}><small>Total</small><br/><b>{stats.total}</b></div>
            <div style={cardStyle}><small>Sent</small><br/><b>{stats.sent}</b></div>
            <div style={cardStyle}><small>Remaining</small><br/><b>{stats.pending}</b></div>
            <div style={cardStyle}><small>Daily Limit</small><br/><b>{config.dailyLimit}</b></div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Upload List</h3>
            <input type="file" accept=".txt" onChange={handleFileUpload} disabled={isUploading} style={{ width: '100%' }} />
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{c.email}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                      backgroundColor: c.status === 'sent' ? '#dcfce7' : '#f3f4f6',
                      color: c.status === 'sent' ? '#166534' : '#6b7280'
                    }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const cardStyle = {
  backgroundColor: '#fff', padding: '15px', borderRadius: '12px', textAlign: 'center' as const,
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};
const thStyle = { padding: '12px', textAlign: 'left' as const, fontSize: '0.85rem', color: '#6b7280' };
const tdStyle = { padding: '12px', fontSize: '0.9rem' };

export default Dashboard;
