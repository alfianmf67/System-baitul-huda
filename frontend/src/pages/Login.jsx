import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                localStorage.setItem('adminToken', 'mock-token');
                navigate('/admin');
            } else {
                alert("Username atau Password salah!");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center' }}>Admin Login</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                    />
                    <button type="submit" className="btn btn-primary">Masuk</button>
                    <button type="button" className="btn" onClick={() => navigate('/')} style={{ background: 'transparent', color: '#64748b' }}>Kembali</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
