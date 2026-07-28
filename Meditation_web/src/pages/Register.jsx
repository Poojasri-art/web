import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Brain, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        userId: 'web_' + Math.random().toString(36).substr(2, 9), // Auto-generate simple ID
        email: '',
        password: '',
        age: '',
        gender: 'Prefer not to say'
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.age) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const resp = await api.register(
                formData.userId,
                formData.email,
                formData.password,
                formData.age,
                formData.gender
            );

            if (resp.status === 'success') {
                const loginResp = await api.login(formData.email, formData.password);
                if (loginResp.status === 'success') {
                    login({ email: loginResp.email, username: loginResp.email.split('@')[0], user_id: loginResp.user_id });
                    navigate('/home');
                } else {
                    navigate('/login');
                }
            } else {
                setError(resp.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content} className="animate-fade-in fade-delay-1">
                <div style={styles.header}>
                    <h1 style={styles.title}>Join CogniSync</h1>
                    <p style={styles.subtitle}>Begin your cognitive enhancement</p>
                </div>

                <form onSubmit={handleRegister} style={styles.form} className="glass-panel card">
                    {error && <div style={styles.errorBanner}>{error}</div>}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address *</label>
                        <input
                            type="email" name="email"
                            value={formData.email} onChange={handleInputChange}
                            style={styles.input} placeholder="you@example.com"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Age *</label>
                            <input
                                type="number" name="age"
                                value={formData.age} onChange={handleInputChange}
                                style={styles.input} placeholder="e.g. 25"
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Gender</label>
                            <select
                                name="gender" value={formData.gender} onChange={handleInputChange}
                                style={{ ...styles.input, height: '52px', appearance: 'none' }}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Non-binary</option>
                                <option>Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"} name="password"
                                value={formData.password} onChange={handleInputChange}
                                style={styles.input} placeholder="Create a strong password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div style={styles.footer}>
                        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                        <Link to="/login" style={styles.link}>Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Reuse Login styles and add row
const styles = {
    container: {
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px', background: 'var(--background)'
    },
    content: { maxWidth: '450px', width: '100%' },
    header: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' },
    subtitle: { color: 'var(--text-secondary)', fontSize: '16px' },
    form: { padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
    input: {
        padding: '16px', borderRadius: '12px', border: '1px solid rgba(124, 77, 255, 0.2)',
        background: 'var(--background)', color: 'var(--text-primary)', fontSize: '16px', width: '100%', outline: 'none'
    },
    eyeBtn: {
        position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '4px'
    },
    submitBtn: {
        background: 'var(--primary-gradient)', color: '#ffffff', padding: '16px', borderRadius: '12px',
        fontSize: '16px', fontWeight: '700', marginTop: '8px', boxShadow: 'var(--shadow-md)', cursor: 'pointer', border: 'none'
    },
    errorBanner: { background: 'rgba(255, 59, 48, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' },
    footer: { textAlign: 'center', marginTop: '16px', fontSize: '14px' },
    link: { color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }
};
