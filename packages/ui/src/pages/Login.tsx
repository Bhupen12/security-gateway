import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export const Login = () => {
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('admin_token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid Credentials');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>🔐 Security Gateway Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          placeholder="Username" 
          value={username} 
          onChange={e => setUser(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPass(e.target.value)} 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};