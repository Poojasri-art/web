import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');

    const handleReset = (e) => {
        e.preventDefault();
        setStatus('If the email is associated with an account, instructions have been sent.');
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
            </header>

            <div style={styles.content} className="animate-fade-in fade-delay-1">
                <div style={styles.iconContainer}>
                    <KeyRound size={48} color="var(--primary)" />
                </div>
                <h1 style={styles.title}>Forgot Password</h1>
                <p style={styles.subtitle}>Enter your email to receive reset instructions</p>

                <form onSubmit={handleReset} style={styles.form}>
                    {status && <div style={styles.successBanner}>{status}</div>}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn}>
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: 'var(--background)' },
    header: { padding: '20px' },
    backBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer' },
    content: { maxWidth: '400px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    iconContainer: { padding: '20px', background: 'var(--surface)', borderRadius: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' },
    title: { fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' },
    subtitle: { fontSize: '15px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' },
    form: { width: '100%', background: 'var(--surface)', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' },
    successBanner: { background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: '600' },
    input: { padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--background)', fontSize: '16px' },
    submitBtn: { background: 'var(--primary-gradient)', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', border: 'none' }
};
