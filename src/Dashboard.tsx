import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [config, setConfig] = useState({ dailyLimit: 20, isPaused: true });
  const [stats, setStats] = useState({ total: 0, sent: 0, pending: 0 });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (data.stats) setStats(data.stats);
      if (data.config) setConfig(data.config);
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  const updateLimit = async (newLimit: number) => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyLimit: newLimit }),
      });
      setConfig({ ...config, dailyLimit: newLimit });
    } catch (error) {
      console.error("Error updating limit:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const text = await file.text();
    const emails = text.split(/\r?\n/).map(e => e.trim()).filter(e => e.includes('@'));

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      const data = await response.json();
      alert(`Successfully added ${data.count} emails.`);
      fetchStats();
    } catch (error) {
      console.error("Error uploading emails:", error);
      alert("Error uploading emails. Check console.");
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '30px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ marginTop: 0, color: '#111827' }}>Campaign Dashboard (D1 Cloudflare)</h1>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px', 
          marginBottom: '30px',
          padding: '15px',
          backgroundColor: config.isPaused ? '#fee2e2' : '#dcfce7',
          borderRadius: '8px'
        }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: config.isPaused ? '#ef4444' : '#22c55e'
          }} />
          <span style={{ 
            fontWeight: 'bold', 
            color: config.isPaused ? '#991b1b' : '#166534',
            fontSize: '1.1rem'
          }}>
            Status: {config.isPaused ? 'Paused' : 'Running'}
          </span>
          <button 
            onClick={toggleCampaign}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              backgroundColor: config.isPaused ? '#22c55e' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {config.isPaused ? 'Start Campaign' : 'Stop Campaign'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <StatCard label="Total Emails" value={stats.total} color="#3b82f6" />
          <StatCard label="Emails Sent" value={stats.sent} color="#10b981" />
          <StatCard label="Remaining" value={stats.pending} color="#f59e0b" />
        </div>

        <div style={{ marginBottom: '30px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Campaign Settings</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ color: '#4b5563' }}>Daily Limit: </label>
            <input 
              type="number" 
              value={config.dailyLimit} 
              onChange={(e) => updateLimit(Number(e.target.value))} 
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                width: '80px'
              }}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Upload Email List (.txt)</h3>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '15px' }}>
            One email per line. Only valid emails will be imported.
          </p>
          <input 
            type="file" 
            accept=".txt" 
            onChange={handleFileUpload} 
            disabled={isUploading}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          />
          {isUploading && <p style={{ color: '#3b82f6', marginTop: '10px' }}>Uploading emails...</p>}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div style={{ 
    backgroundColor: '#ffffff', 
    padding: '20px', 
    borderRadius: '10px', 
    border: `1px solid ${color}44`,
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>{label}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: color }}>{value}</div>
  </div>
);

export default Dashboard;
