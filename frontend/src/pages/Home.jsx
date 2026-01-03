import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <nav style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <Link to="/admin" style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: 'bold' }}>
                    Admin Portal &rarr;
                </Link>
            </nav>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#1e293b' }}>Majelis Ta'lim Baitul Huda</h1>
                <p style={{ color: '#64748b' }}>Sistem Absensi Wajah Cerdas</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <Link to="/attendance" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                        <h2 style={{ margin: 0 }}>Catat Kehadiran</h2>
                        <p style={{ color: '#64748b' }}>Absensi wajah otomatis</p>
                    </div>
                </Link>

                <Link to="/register" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                        <h2 style={{ margin: 0 }}>Daftar Peserta Baru</h2>
                        <p style={{ color: '#64748b' }}>Registrasi wajah baru</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Home;
