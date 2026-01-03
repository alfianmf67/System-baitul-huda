import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (confirm("Apakah anda yakin ingin keluar?")) {
            localStorage.removeItem('adminToken');
            navigate('/');
        }
    };

    const menuItems = [
        { label: 'Data Peserta', path: '/admin/participants' },
        { label: 'Kelola Kahadiran', path: '/admin/attendance' },
        { label: 'Kelola Kegiatan', path: '/admin/activities' },
        { label: 'Laporan', path: '/admin/reports' },
    ];

    return (
        <div style={{ width: '250px', background: '#ffffff', borderRight: '1px solid #e2e8f0', minHeight: '100vh', padding: '1rem' }}>
            <h3 style={{ marginBottom: '2rem', paddingLeft: '1rem' }}>Admin Panel</h3>
            <nav>
                {menuItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'block',
                            padding: '0.75rem 1rem',
                            marginBottom: '0.5rem',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            color: location.pathname === item.path ? 'white' : '#64748b',
                            backgroundColor: location.pathname === item.path ? '#4f46e5' : 'transparent'
                        }}
                    >
                        {item.label}
                    </Link>
                ))}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        marginTop: '2rem',
                        color: 'red',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Keluar
                </button>
            </nav>
        </div>
    );
};

const Participants = () => {
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', gender: '', dob: '', address: ''
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = () => {
        fetch('http://localhost:8000/api/participants/')
            .then(res => res.json())
            .then(data => setMembers(data))
            .catch(err => console.error(err));
    };

    const calculateAge = (dobString) => {
        if (!dobString) return '-';
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleEdit = (member) => {
        setFormData({
            name: member.name,
            gender: member.gender,
            dob: member.dob, // Assume YYYY-MM-DD from API
            address: member.address
        });
        setEditId(member.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Hapus peserta ini? Data wajah & kehadiran juga akan terhapus.")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/participants/${id}`, { method: 'DELETE' });
            if (res.ok) fetchMembers();
            else alert("Gagal menghapus.");
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('gender', formData.gender);
        data.append('dob', formData.dob);
        data.append('address', formData.address);

        // Note: Currently endpoint expects FormData for update too

        try {
            const res = await fetch(`http://localhost:8000/api/participants/${editId}`, {
                method: 'PUT',
                body: data
            });
            if (res.ok) {
                alert("Berhasil!");
                fetchMembers();
                setShowForm(false);
                setEditId(null);
            } else {
                alert("Gagal update.");
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <h2>Data Peserta</h2>

            {showForm && (
                <div className="card" style={{ marginBottom: '1rem', border: '1px solid #4f46e5' }}>
                    <h3>Edit Peserta</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label>Nama:</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} required />
                        </div>
                        <div>
                            <label>Jenis Kelamin:</label>
                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label>Tanggal Lahir:</label>
                            <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} required />
                        </div>
                        <div>
                            <label>Alamat:</label>
                            <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} required />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
                            <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ background: '#cbd5e1', color: '#334155' }}>Batal</button>
                        </div>
                    </form>
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Nama</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Gender</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Tanggal Lahir</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Umur</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Alamat</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '1rem' }}>{m.name}</td>
                            <td style={{ padding: '1rem' }}>{m.gender}</td>
                            <td style={{ padding: '1rem' }}>{m.dob}</td>
                            <td style={{ padding: '1rem' }}>{calculateAge(m.dob)} Tahun</td>
                            <td style={{ padding: '1rem' }}>{m.address}</td>
                            <td style={{ padding: '1rem' }}>
                                <button className="btn" style={{ marginRight: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleEdit(m)}>Edit</button>
                                <button className="btn" style={{ color: 'red', fontSize: '0.8rem' }} onClick={() => handleDelete(m.id)}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AttendanceManager = () => {
    const [stats, setStats] = useState({ total_members: 0, today_attendance: 0, ontime: 0, late: 0 });
    const [logs, setLogs] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState('');

    useEffect(() => {
        fetchStats();
        fetchActivities();
        fetchLogs();
    }, [selectedActivity]); // Re-fetch logs when filter changes

    useEffect(() => {
        const interval = setInterval(() => {
            fetchStats();
            fetchLogs();
        }, 5000); // Auto refresh every 5s
        return () => clearInterval(interval);
    }, [selectedActivity]);

    const fetchActivities = () => {
        fetch('http://localhost:8000/api/admin/activities')
            .then(res => res.json())
            .then(data => setActivities(data))
            .catch(err => console.error(err));
    };

    const fetchStats = () => {
        fetch('http://localhost:8000/api/admin/dashboard/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    };

    const fetchLogs = () => {
        let url = 'http://localhost:8000/api/admin/attendance-logs';
        if (selectedActivity) {
            url += `?activity_id=${selectedActivity}`;
        }
        fetch(url)
            .then(res => res.json())
            .then(data => setLogs(data))
            .catch(err => console.error(err));
    };

    const handleReset = async () => {
        if (!confirm("PERINGATAN: Apakah anda yakin ingin MENGHAPUS SEMUA data kehadiran hari ini? Tindakan ini tidak dapat dibatalkan.")) return;

        const secondConfirm = prompt("Ketik 'HAPUS' untuk mengkonfirmasi:");
        if (secondConfirm !== 'HAPUS') return;

        try {
            const res = await fetch('http://localhost:8000/api/attendance/today', { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchStats();
                fetchLogs();
            } else {
                alert(data.message || "Gagal menghapus.");
            }
        } catch (err) { console.error(err); }
    };

    // Calculate percentages for simple bar chart
    const total = stats.ontime + stats.late;
    const ontimePct = total > 0 ? (stats.ontime / total) * 100 : 0;
    const latePct = total > 0 ? (stats.late / total) * 100 : 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Kelola Kehadiran Hari Ini</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={selectedActivity}
                        onChange={(e) => setSelectedActivity(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '0.25rem', borderColor: '#cbd5e1' }}
                    >
                        <option value="">Semua Kegiatan</option>
                        {activities.map(act => (
                            <option key={act.id} value={act.id}>{act.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleReset}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reset Kehadiran Hari Ini
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                    <h3>Total Peserta</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total_members}</p>
                </div>
                <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                    <h3>Hadir Hari Ini</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.today_attendance}</p>
                </div>
            </div>

            {/* Simple Stats Chart using CSS Flex */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Statistik Kehadiran</h3>
                <div style={{ display: 'flex', alignItems: 'center', height: '40px', marginTop: '1rem', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${ontimePct}%`, height: '100%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>
                        {ontimePct > 0 && `Tepat Waktu (${stats.ontime})`}
                    </div>
                    <div style={{ width: `${latePct}%`, height: '100%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>
                        {latePct > 0 && `Telat (${stats.late})`}
                    </div>
                </div>
                {total === 0 && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '0.5rem' }}>Belum ada data kehadiran hari ini.</p>}
            </div>

            {/* Logs Table */}
            <div className="card">
                <h3>Riwayat Pencatatan (Terbaru)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tanggal</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama Kegiatan</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama Peserta</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Waktu</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.75rem' }}>{log.activity_date || '-'}</td>
                                <td style={{ padding: '0.75rem' }}>{log.activity_name}</td>
                                <td style={{ padding: '0.75rem' }}>{log.name}</td>
                                <td style={{ padding: '0.75rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: log.status === 'Tepat Waktu' ? '#dcfce7' : '#fee2e2',
                                        color: log.status === 'Tepat Waktu' ? '#166534' : '#991b1b'
                                    }}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>Belum ada data.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', activity_type: '', date: '', start_time: '', end_time: '', material: '', speaker: '', place: ''
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = () => {
        fetch('http://localhost:8000/api/admin/activities')
            .then(res => res.json())
            .then(data => setActivities(data))
            .catch(err => console.error(err));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editId
            ? `http://localhost:8000/api/admin/activities/${editId}`
            : 'http://localhost:8000/api/admin/activities';
        const method = editId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Berhasil!");
                fetchActivities();
                setShowForm(false);
                setEditId(null);
                setFormData({ name: '', activity_type: '', date: '', start_time: '', end_time: '', material: '', speaker: '', place: '' });
            } else {
                alert("Gagal menyimpan.");
            }
        } catch (err) {
            console.error(err);
            alert("Error.");
        }
    };

    const handleEdit = (act) => {
        setFormData(act);
        setEditId(act.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Hapus kegiatan?")) return;
        try {
            await fetch(`http://localhost:8000/api/admin/activities/${id}`, { method: 'DELETE' });
            fetchActivities();
        } catch (err) { console.error(err); }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Kelola Kegiatan</h2>
                <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ name: '', activity_type: '', date: '', start_time: '', end_time: '', material: '', speaker: '', place: '' }); }}>
                    {showForm ? 'Batal' : 'Tambah Kegiatan'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>{editId ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input type="text" placeholder="Nama Kegiatan" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ padding: '0.5rem' }} />
                        <input type="text" placeholder="Jenis Kegiatan" value={formData.activity_type} onChange={e => setFormData({ ...formData, activity_type: e.target.value })} required style={{ padding: '0.5rem' }} />
                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required style={{ padding: '0.5rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} required style={{ padding: '0.5rem', flex: 1 }} />
                            <input type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} required style={{ padding: '0.5rem', flex: 1 }} />
                        </div>
                        <textarea placeholder="Materi" value={formData.material} onChange={e => setFormData({ ...formData, material: e.target.value })} style={{ padding: '0.5rem', gridColumn: 'span 2' }} />
                        <input type="text" placeholder="Pemateri" value={formData.speaker} onChange={e => setFormData({ ...formData, speaker: e.target.value })} style={{ padding: '0.5rem' }} />
                        <input type="text" placeholder="Tempat" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} style={{ padding: '0.5rem' }} />

                        <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Simpan</button>
                    </form>
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Nama</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Tanggal</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Waktu</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Pemateri</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map(act => (
                        <tr key={act.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '1rem' }}>{act.name}</td>
                            <td style={{ padding: '1rem' }}>{act.date}</td>
                            <td style={{ padding: '1rem' }}>{act.start_time} - {act.end_time}</td>
                            <td style={{ padding: '1rem' }}>{act.speaker}</td>
                            <td style={{ padding: '1rem' }}>
                                <button className="btn" style={{ marginRight: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleEdit(act)}>Edit</button>
                                <button className="btn" style={{ color: 'red', fontSize: '0.8rem' }} onClick={() => handleDelete(act.id)}>Hapus</button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Reports = () => {
    const [period, setPeriod] = useState('weekly');
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/api/admin/reports?period=${period}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch reports");
                return res.json();
            })
            .then(d => setData(d))
            .catch(err => {
                console.error(err);
                // Set fallback data to prevent crash
                setData({
                    summary: { total_activities: 0, total_attendance: 0, unique_types: 0 },
                    activities: []
                });
            });
    }, [period]);

    if (!data) return <div>Loading...</div>;
    // Safeguard against malformed data
    if (!data.activities) return <div>Error: Invalid data format. Please restart Backend.</div>;

    const { summary, activities } = data;

    // Find max value for chart scaling
    const maxCount = Math.max(...activities.map(a => a.attendance_count), 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Laporan Kegiatan</h2>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                    <option value="weekly">Mingguan (7 Hari Terakhir)</option>
                    <option value="monthly">Bulanan (30 Hari Terakhir)</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ flex: 1 }}>
                    <h3>Total Kegiatan</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary.total_activities}</p>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <h3>Total Kehadiran</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary.total_attendance}</p>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <h3>Jenis Kegiatan</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary.unique_types}</p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Grafik Kehadiran per Kegiatan</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                    {activities.length === 0 && <p style={{ color: '#64748b' }}>Tidak ada data kegiatan di periode ini.</p>}
                    {activities.map(act => {
                        const heightPct = maxCount > 0 ? (act.attendance_count / maxCount) * 100 : 0;
                        return (
                            <div key={act.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', flex: 1 }}>
                                <div style={{
                                    width: '40px',
                                    height: `${Math.max(heightPct, 1)}%`, // Min 1% visibility
                                    background: '#4f46e5',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.5s ease'
                                }}></div>
                                <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>{act.attendance_count}</span>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={act.name}>
                                    {act.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detailed Table */}
            <div className="card">
                <h3>Detail Laporan</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tanggal</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama Kegiatan</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Jenis</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Jumlah Hadir</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map(act => (
                            <tr key={act.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.75rem' }}>{act.date}</td>
                                <td style={{ padding: '0.75rem' }}>{act.name}</td>
                                <td style={{ padding: '0.75rem' }}>{act.type}</td>
                                <td style={{ padding: '0.75rem' }}>{act.attendance_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '2rem' }}>
                <Routes>
                    <Route path="participants" element={<Participants />} />
                    <Route path="attendance" element={<AttendanceManager />} />
                    <Route path="activities" element={<Activities />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="*" element={<h3>Pilih menu disebelah kiri</h3>} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;
