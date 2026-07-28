import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/home');
        } catch (err) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* LEFT PANE - Abstract Graphics Display (Hidden on Mobile) */}
            <div className="login-graphic-pane" style={styles.leftPane}>
                <div style={styles.ambient1}></div>
                <div style={styles.ambient2}></div>

                <div style={styles.leftContent}>
                    <div style={styles.logoBadge}>
                        <Brain size={32} color="#ffffff" strokeWidth={1.5} />
                    </div>
                    <h2 style={styles.leftTitle}>Sync Your Mind. <br /> Master Your Focus.</h2>
                    <p style={styles.leftSubtitle}>
                        Your personalized dashboard for cognitive training and daily assessments.
                        Engage in scientifically designed modules to enhance your mental clarity and resilience.
                    </p>

                    <div style={styles.cardPreview}>
                        <div style={styles.previewLine}></div>
                        <div style={{ ...styles.previewLine, width: '60%', opacity: 0.5 }}></div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANE - Form Interaction */}
            <div style={styles.rightPane}>
                <div style={styles.formContainer} className="animate-fade-in fade-delay-1">

                    {/* Mobile Header (Only visible if Graphic Pane hides) */}
                    <div className="mobile-only-header" style={styles.mobileHeader}>
                        <div style={styles.mobileIcon}>
                            <Brain size={24} color="#fff" />
                        </div>
                        <h1 style={styles.title}>CogniSync</h1>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={styles.welcomeTitle}>Welcome Back</h2>
                        <p style={styles.welcomeSubtitle}>Sign in to continue your journey.</p>
                    </div>

                    <form onSubmit={handleLogin} style={styles.form}>
                        {error && <div style={styles.errorBanner}>{error}</div>}

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={styles.label}>Password</label>
                                <Link to="/forgot-password" style={styles.forgotLink}>Forgot?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={styles.input}
                                    placeholder="••••••••"
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={styles.submitBtn}
                            className="login-btn-hover"
                        >
                            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                            {!isLoading && <ArrowRight size={18} />}
                        </button>

                        <div style={styles.footer}>
                            <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                            <Link to="/register" style={styles.link}>Create an account</Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Inject explicit CSS for Media Queries and hover effects that inline styles can't handle perfectly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes floatOrb {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                    100% { transform: translateY(0px) rotate(360deg); }
                }
                .login-graphic-pane {
                    display: flex;
                }
                .mobile-only-header {
                    display: none;
                }
                .login-btn-hover {
                    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
                }
                .login-btn-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(124,77,255,0.4);
                    filter: brightness(1.1);
                }
                .login-btn-hover:active {
                    transform: translateY(0);
                    box-shadow: 0 5px 15px rgba(124,77,255,0.3);
                }
                
                @media (max-width: 900px) {
                    .login-graphic-pane {
                        display: none !important;
                    }
                    .mobile-only-header {
                        display: flex !important;
                        flex-direction: column;
                        align-items: center;
                        margin-bottom: 30px;
                    }
                }
            `}} />
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--background)'
    },

    // LEFT PANE
    leftPane: {
        flex: 1,
        // Graphic plane is displayed as block via CSS query, flex is handled inline overriding
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        background: '#0a0a0f', // Very dark background contrasting the right side
        overflow: 'hidden'
    },
    ambient1: {
        position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(124,77,255,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'floatOrb 15s infinite ease-in-out'
    },
    ambient2: {
        position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0,188,212,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'floatOrb 20s infinite ease-in-out reverse'
    },
    leftContent: {
        position: 'relative',
        zIndex: 10,
        maxWidth: '480px',
    },
    logoBadge: {
        width: '64px', height: '64px',
        background: 'linear-gradient(135deg, rgba(124,77,255,0.3) 0%, rgba(0,188,212,0.3) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px'
    },
    leftTitle: { color: '#ffffff', fontSize: '48px', fontWeight: '800', letterSpacing: '-1.5px', lineHeight: '1.1', marginBottom: '20px' },
    leftSubtitle: { color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px', lineHeight: '1.6' },
    cardPreview: {
        marginTop: '40px', padding: '24px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', backdropFilter: 'blur(10px)',
        width: '80%'
    },
    previewLine: { height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '12px' },

    // RIGHT PANE
    rightPane: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)'
    },
    formContainer: {
        width: '100%',
        maxWidth: '420px',
    },
    mobileIcon: {
        width: '48px', height: '48px', background: 'var(--primary-gradient)', borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
    },
    title: { fontSize: '28px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' },

    welcomeTitle: { fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-1px' },
    welcomeSubtitle: { fontSize: '15px', color: 'var(--text-secondary)' },

    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    errorBanner: { background: 'rgba(255, 59, 48, 0.1)', color: 'var(--error)', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '500' },

    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: {
        padding: '16px', borderRadius: '14px', border: '1px solid var(--border)',
        background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '16px', width: '100%',
        transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none'
    },
    eyeBtn: {
        position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '4px'
    },
    forgotLink: { fontSize: '13px', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' },

    submitBtn: {
        background: 'var(--primary-gradient)',
        color: '#ffffff', border: 'none',
        padding: '18px', borderRadius: '16px',
        fontSize: '16px', fontWeight: '700',
        marginTop: '12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
    },

    footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px' },
    link: { color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }
};
