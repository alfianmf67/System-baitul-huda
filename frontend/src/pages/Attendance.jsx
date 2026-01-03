import React, { useState } from 'react';
import CameraCapture from '../components/CameraCapture';
import { Link } from 'react-router-dom';

const Attendance = () => {
    const [status, setStatus] = useState("Scan Wajah Anda...");
    const [lastAttended, setLastAttended] = useState(null);
    const [activity, setActivity] = useState(null);

    React.useEffect(() => {
        fetch('http://localhost:8000/api/attendance/today-activity')
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => setActivity(data))
            .catch(err => console.error(err));
    }, []);

    const handleCapture = async (blob) => {
        const data = new FormData();
        data.append('file', blob, 'attendance.jpg');

        try {
            // We assume the API handles rate limiting or we debounce here
            const response = await fetch('http://localhost:8000/api/attendance/clock-in', {
                method: 'POST',
                body: data
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                if (result.status === 'error') {
                    // Should not happen if HTTP 200, but just in case
                    alert(result.message);
                } else {
                    setStatus(`Selamat Datang, ${result.name}!`);
                    setLastAttended(result);
                    // Play sound or visual feedback
                }
            } else {
                // If we returned 200 with {status: error}, it enters above. 
                // But typically duplicate might return 200 OK with custom JSON. 
                // Let's check my python code: I returned a simple dict, which FastAPI returns as 200 OK by default unless I raise HTTPException.
                // In my edit I returned a dictionary directly. So it will be 200 OK.

                if (result.status === 'error') {
                    // Logic to prevent alert spamming could be added here, 
                    // but for now simple alert as requested
                    alert(result.message);
                    // Reset status text so user knows
                    setStatus(result.message);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <Link to="/" style={{ float: 'left', textDecoration: 'none' }}>&larr; Kembali</Link>
            <h1>Catat Kehadiran</h1>

            {activity && (
                <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #7dd3fc' }}>
                    <h2 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>{activity.name}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', color: '#0c4a6e' }}>
                        <span><strong>Waktu:</strong> {activity.start_time} - {activity.end_time}</span>
                        <span><strong>Tempat:</strong> {activity.place}</span>
                        <span><strong>Pemateri:</strong> {activity.speaker}</span>
                    </div>
                </div>
            )}

            <div className="card">
                {lastAttended ? (
                    <div>
                        <h2 style={{ color: 'green' }}>✓ Berhasil</h2>
                        <h3>{lastAttended.name}</h3>
                        <p>{new Date(lastAttended.timestamp).toLocaleString()}</p>

                        <div style={{
                            padding: '0.5rem',
                            background: lastAttended.attendance_status === 'On Time' ? '#dcfce7' : '#fee2e2',
                            color: lastAttended.attendance_status === 'On Time' ? '#166534' : '#991b1b',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            fontWeight: 'bold',
                            marginRight: '1rem'
                        }}>
                            Status: {lastAttended.attendance_status}
                        </div>

                        <div style={{
                            padding: '0.5rem',
                            background: '#f1f5f9',
                            color: '#334155',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            Akurasi: {(lastAttended.similarity * 100).toFixed(1)}%
                        </div>
                        <br /><br />

                        <button className="btn btn-primary" onClick={() => setLastAttended(null)}>Scan Lagi</button>
                    </div>
                ) : (
                    <>
                        <CameraCapture
                            onCapture={handleCapture}
                            autoCapture={true}
                            interval={2000} // Scan every 2 seconds
                        />
                        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{status}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Attendance;
