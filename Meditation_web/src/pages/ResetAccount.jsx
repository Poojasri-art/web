import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function ResetAccount() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isDelete = searchParams.get('mode') === 'delete';
    const { logout } = useAuth();

    const handleAction = () => {
        // Simulated action
        logout();
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <header style={{ padding: '20px' }}>
                <button style={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
            </header>

            <div style={styles.content}>
                <div style={{ ...styles.iconContainer, background: isDelete ? 'rgba(255,59,48,0.1)' : 'rgba(255,149,0,0.1)' }}>
                    <AlertTriangle size={48} color={isDelete ? "var(--error)" : "#FF9500"} />
                </div>
                <h1 style={styles.title}>{isDelete ? "Delete Account" : "Reset Data"}</h1>
                <p style={styles.subtitle}>
                    {isDelete ?
                        "This action is permanent and cannot be undone. All your data will be erased." :
                        "This will reset your cognitive progress and statistics. Your account will remain."}
                </p>

                <button style={{ ...styles.btn, background: isDelete ? 'var(--error)' : '#FF9500' }} onClick={handleAction}>
                    {isDelete ? "Permanently Delete" : "Confirm Reset"}
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: 'var(--background)' },
    backBtn: { padding: '8px', background: 'var(--surface)', borderRadius: '12px', border: 'none' },
    content: { maxWidth: '400px', margin: '60px auto 0', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    iconContainer: { padding: '24px', borderRadius: '24px', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '800', marginBottom: '12px' },
    subtitle: { fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.5 },
    btn: { width: '100%', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '16px', fontWeight: '700', border: 'none' }
};
