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
      // Simulate/Fetch logs if you have an endpoint, 
      // otherwise, we will rely on client-side capture
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

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    alert('Logs copied to clipboard!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <nav style={navStyle}>
        <button onClick={() => setView('stats')} style={view === 'stats' ? activeBtn : btn}>📊 Stats</button>
        <button onClick={() => setView('logs')} style={view === 'logs' ? activeBtn : btn}>📜 Logs</button>
        <button onClick={() => navigate('/admin/cms')} style={btn}>📝 CMS</button>
      </nav>

      {view === 'stats' && (
        <div>
          <button onClick={handleSendNext} style={secondaryBtn}>Test Send</button>
          <div style={cardStyle}>
            <h3>Status: {config.isPaused ? 'Paused' : 'Running'}</h3>
            <p>Sent: {stats.sent} / Remaining: {stats.pending}</p>
          </div>
        </div>
      )}

      {view === 'logs' && (
        <div style={{ backgroundColor: '#000', color: '#0f0', padding: '15px', borderRadius: '8px', height: '300px', overflowY: 'auto' }}>
          <button onClick={copyLogs} style={{ marginBottom: '10px' }}>Copy Logs</button>
          {logs.map((log, i) => <div key={i} style={{ fontSize: '0.8rem' }}>{log}</div>)}
        </div>
      )}
    </div>
  );
};

const navStyle = { display: 'flex', justifyContent: 'space-around', padding: '15px' };
const btn = { border: 'none', background: 'none', color: '#666' };
const activeBtn = { ...btn, fontWeight: 'bold', color: '#3b82f6' };
const secondaryBtn = { padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px' };
const cardStyle = { padding: '20px', border: '1px solid #ddd', marginTop: '20px' };

export default Admin;
