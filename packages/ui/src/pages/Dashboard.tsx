import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export const Dashboard = () => {
  const [ips, setIps] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');
  const navigate = useNavigate();

  const fetchIps = async () => {
    try {
      const res = await api.get('/blocked-ips');
      setIps(res.data.ips);
    } catch (err) {
      console.error(err);
      navigate('/'); // Redirect to login if failed
    }
  };
  
  // Load Data on Mount
  useEffect(() => {
    // Defer the fetch so setState isn't called synchronously during the effect
    const id = setTimeout(() => {
      fetchIps();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const blockIp = async () => {
    if(!newIp) return;
    await api.post('/block-ip', { ip: newIp });
    setNewIp('');
    fetchIps(); // Refresh list
  };

  const unblockIp = async (ip: string) => {
    await api.post('/unblock-ip', { ip });
    fetchIps(); // Refresh list
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>🛡️ Admin Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <div style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h3>🚫 Block New IP</h3>
        <input 
          placeholder="192.168.x.x" 
          value={newIp} 
          onChange={e => setNewIp(e.target.value)}
        />
        <button onClick={blockIp} style={{ marginLeft: '10px' }}>Block IP</button>
      </div>

      <h3>Blocked IPs List</h3>
      {ips.length === 0 ? <p>No IPs blocked. Safe!</p> : (
        <ul>
          {ips.map(ip => (
            <li key={ip} style={{ marginBottom: '0.5rem' }}>
              {ip} 
              <button 
                onClick={() => unblockIp(ip)} 
                style={{ marginLeft: '1rem', background: 'red', color: 'white' }}
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};