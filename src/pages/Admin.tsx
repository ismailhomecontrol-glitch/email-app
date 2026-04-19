import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'stats' | 'contacts' | 'logs'>('stats');
  const [config, setConfig] = useState({ dailyLimit: 20, isPaused: true });
  const [stats, setStats] = useState({ total: 0, sent: 0, pending: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (data.stats) setStats(data.stats);
      if (data.config) setConfig(data.config);
    } catch (error) {
      addLog(`Error fetching data: ${error}`);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleSendNext = async () => {
    if (isSending) return;
    setIsSending(true);
    addLog("Triggering send...");
    try {
      const response = await fetch('/api/send', { method: 'POST' });
      const data = await response.json();
      if (data.error) addLog(`Error: ${data.error}`);
      else addLog(`Success: Sent to ${data.contact}`);
      fetchData();
    } catch (error) {
      addLog(`Exception: ${error}`);
    } finally {
      setIsSending(false);
    }
  };

  const toggleCampaign = async () => {
    const newState = !config.isPaused;
    addLog(`Setting campaign to: ${newState ? 'Paused' : 'Running'}`);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaused: newState }),
      });
      setConfig({ ...config, isPaused: newState });
    } catch (error) {
      addLog(`Error toggling campaign: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <nav style={navStyle}>
        <button onClick={() => setView('stats')} style={view === 'stats' ? activeBtn : btn}>📊 Stats</button>
        <button onClick={() => setView('logs')} style={view === 'logs' ? activeBtn : btn}>📜 Logs</button>
        <button onClick={() => navigate('/admin/cms')} style={btn}>📝 CMS</button>
      </nav>

      {view === 'stats' && (
        <div style={{ marginTop: '20px' }}>
          <div style={cardStyle}>
            <h3>Campaign Status: {config.isPaused ? '🔴 Paused' : '🟢 Running'}</h3>
            <button onClick={toggleCampaign} style={toggleBtn(config.isPaused)}>
              {config.isPaused ? 'Start Campaign' : 'Stop Campaign'}
            </button>
            <button onClick={handleSendNext} disabled={isSending} style={secondaryBtn}>Test Send</button>
          </div>
          <div style={cardStyle}>
            <p>Sent: {stats.sent} / Remaining: {stats.pending}</p>
          </div>
        </div>
      )}

      {view === 'logs' && (
        <div style={{ backgroundColor: '#000', color: '#0f0', padding: '15px', borderRadius: '8px', height: '300px', overflowY: 'auto' }}>
          <button onClick={() => setLogs([])} style={{ marginBottom: '10px' }}>Clear Logs</button>
          {logs.map((log, i) => <div key={i} style={{ fontSize: '0.8rem' }}>{log}</div>)}
        </div>
      )}
    </div>
  );
};

const navStyle = { display: 'flex', justifyContent: 'space-around', padding: '15px' };
const btn = { border: 'none', background: 'none', color: '#666', cursor: 'pointer' };
const activeBtn = { ...btn, fontWeight: 'bold', color: '#3b82f6' };
const secondaryBtn = { padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' };
const toggleBtn = (isPaused: boolean) => ({ padding: '10px', background: isPaused ? '#10b981' : '#ef4444', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' });
const cardStyle = { padding: '20px', border: '1px solid #ddd', marginTop: '20px', borderRadius: '8px' };

export default Admin;
