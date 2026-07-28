import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SECTIONS = [
    { title: '1. What Data We Collect', text: 'We collect only essential information such as your email address, meditation session time, streak data, efficiency score, and progress statistics to provide a personalized experience.' },
    { title: '2. How We Use Your Data', text: 'Your data is used only to track your meditation progress, maintain streaks, calculate efficiency, and improve your overall mindfulness journey.' },
    { title: '3. Data Security', text: 'Your information is securely stored and protected. We do not share, sell, or distribute your personal data to third parties.' },
    { title: '4. Notification Usage', text: 'Notifications are used only to send meditation reminders, progress updates, and motivational messages to support your consistency.' },
];

export default function Privacy() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div style={s.container}>
            {showConfirm && (
                <div style={s.overlay}>
                    <div style={s.dialog}>
                        <h3 style={{ marginBottom: '8px' }}>Confirm Deletion</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                            Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={s.cancelBtn} onClick={() => setShowConfirm(false)}>Cancel</button>
                            <button style={s.deleteConfirmBtn} onClick={() => { logout(); navigate('/login'); }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <header style={s.header}>
                <button style={s.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
                <span style={s.headerTitle}>Privacy</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={s.content}>
                <h2 style={s.mainTitle}>Privacy & Data Protection 🔒</h2>

                {SECTIONS.map((sec, i) => (
                    <div key={i} style={s.section}>
                        <h3 style={s.secTitle}>{sec.title}</h3>
                        <p style={s.secText}>{sec.text}</p>
                    </div>
                ))}

                <button style={s.deleteBtn} onClick={() => setShowConfirm(true)}>
                    Delete My Account
                </button>
            </div>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: 'var(--background)' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' },
    dialog: { background: 'var(--surface)', borderRadius: '24px', padding: '28px', maxWidth: '340px', width: '100%', textAlign: 'center' },
    cancelBtn: { flex: 1, padding: '14px', borderRadius: '12px', background: 'var(--background)', border: 'none', fontWeight: '700', cursor: 'pointer' },
    deleteConfirmBtn: { flex: 1, padding: '14px', borderRadius: '12px', background: 'var(--error)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' },
    header: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 },
    backBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex' },
    headerTitle: { fontSize: '18px', fontWeight: '700' },
    content: { maxWidth: '800px', margin: '0 auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '20px' },
    mainTitle: { fontSize: '22px', fontWeight: '800', color: 'var(--primary)', textAlign: 'center' },
    section: { background: 'var(--surface)', padding: '20px', borderRadius: '16px' },
    secTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '8px' },
    secText: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 },
    deleteBtn: { background: 'rgba(255,59,48,0.9)', color: '#fff', padding: '16px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '8px' },
};
