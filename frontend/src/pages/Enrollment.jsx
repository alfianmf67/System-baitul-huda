import React, { useState } from 'react';
import CameraCapture from '../components/CameraCapture';

const Enrollment = () => {
    const [step, setStep] = useState(0); // 0: Form, 1: Front, 2: Right, 3: Left
    const [formData, setFormData] = useState({
        name: '',
        gender: 'Laki-laki',
        dob: '',
        address: ''
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCapture = (blob) => {
        setImages([...images, blob]);
        if (step < 3) {
            setStep(step + 1);
        } else {
            // All captured, ready to submit?
            // Actually step 3 is last capture.
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('gender', formData.gender);
        data.append('dob', formData.dob);
        data.append('address', formData.address);

        images.forEach((img, index) => {
            data.append('files', img, `face_${index}.jpg`);
        });

        try {
            const response = await fetch('http://localhost:8000/api/participants/enroll', {
                method: 'POST',
                body: data
            });
            if (response.ok) {
                alert("Pendaftaran berhasil!");
                window.location.href = '/';
            } else {
                alert("Gagal mendaftar.");
            }
        } catch (err) {
            console.error(err);
            alert("Error connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Pendaftaran Peserta Baru</h1>

            {step === 0 && (
                <div className="card">
                    <h3>Data Diri</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Nama Lengkap"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ padding: '0.5rem' }}
                        />
                        <select
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            style={{ padding: '0.5rem' }}
                        >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                        <input
                            type="date"
                            value={formData.dob}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            style={{ padding: '0.5rem' }}
                        />
                        <textarea
                            placeholder="Alamat"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            style={{ padding: '0.5rem' }}
                        />
                        <button className="btn btn-primary" onClick={() => setStep(1)}>Lanjut ke Foto</button>
                    </div>
                </div>
            )}

            {step >= 1 && step <= 3 && (
                <div className="card">
                    <h3>
                        {step === 1 && "Ambil Foto: Menghadap Depan"}
                        {step === 2 && "Ambil Foto: Serong Kanan"}
                        {step === 3 && "Ambil Foto: Serong Kiri"}
                    </h3>
                    <CameraCapture onCapture={(blob) => {
                        setImages([...images, blob]);
                        setStep(step + 1);
                    }} />
                    <p>Mohon posisikan wajah sesuai instruksi lalu tekan "Take Photo"</p>
                </div>
            )}

            {step === 4 && (
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3>Konfirmasi</h3>
                    <p>Data siap dikirim.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {images.map((img, i) => (
                            <img key={i} src={URL.createObjectURL(img)} alt={`capture-${i}`} width="80" height="80" style={{ objectFit: 'cover', borderRadius: '50%' }} />
                        ))}
                    </div>
                    <br />
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Menyimpan..." : "Simpan Data"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Enrollment;
