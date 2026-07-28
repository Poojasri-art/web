import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ArrowLeft, UserRoundPen, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function UpdateInfo() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({ age: '', gender: '', newPassword: '', confirmPassword: '', profile_image: '' });
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }

    // Load current profile so fields show existing values
    useEffect(() => {
        if (!user?.email) { setFetching(false); return; }
        api.getProfile(user.email)
            .then(res => {
                let imgSrc = res.profile_image ?? '';
                if (imgSrc && !imgSrc.startsWith('data:image')) {
                    imgSrc = `data:image/jpeg;base64,${imgSrc}`;
                }
                setFormData(prev => ({
                    ...prev,
                    age: res.age ?? '',
                    gender: res.gender ?? '',
                    profile_image: imgSrc,
                }));
            })
            .catch(() => {
                // Fallback to what's in localStorage
                setFormData(prev => ({
                    ...prev,
                    age: user.age ?? '',
                    gender: user.gender ?? '',
                }));
            })
            .finally(() => setFetching(false));
    }, [user]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profile_image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        // Validate password match if provided
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', msg: 'Passwords do not match.' });
            return;
        }
        if (formData.newPassword && formData.newPassword.length < 8) {
            setStatus({ type: 'error', msg: 'Password must be at least 8 characters.' });
            return;
        }

        setLoading(true);
        const fields = {};
        if (formData.age) fields.age = parseInt(formData.age);
        if (formData.gender) fields.gender = formData.gender;
        if (formData.newPassword) fields.password = formData.newPassword;
        if (formData.profile_image) fields.profile_image = formData.profile_image;

        try {
            const res = await api.updateProfile(user.email, fields);
            if (res.status === 'success') {
                // Refresh local auth state
                updateUser({ age: formData.age, gender: formData.gender });
                setStatus({ type: 'success', msg: 'Profile updated successfully!' });
                // Clear password fields
                setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            } else {
                setStatus({ type: 'error', msg: res.message || 'Update failed. Please try again.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: err.message || 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <button style={s.backBtn} onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <span style={s.headerTitle}>Update Profile</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={s.content}>
                {/* Avatar */}
                <div style={{ ...s.avatarWrap, cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                    <div style={s.avatar}>
                        {formData.profile_image ? (
                            <img src={formData.profile_image} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '44px', objectFit: 'cover' }} />
                        ) : (
                            <span style={s.avatarText}>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                        )}
                    </div>
                    <div style={s.iconBadge}><UserRoundPen size={16} color="#fff" /></div>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageSelect} />
                </div>
                <h2 style={s.name}>{user?.username || user?.email}</h2>
                <p style={s.emailText}>{user?.email}</p>

                {/* Status Banner */}
                {status && (
                    <div style={{ ...s.banner, background: status.type === 'success' ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)', borderColor: status.type === 'success' ? '#34C759' : '#FF3B30' }}>
                        {status.type === 'success'
                            ? <CheckCircle size={18} color="#34C759" />
                            : <AlertCircle size={18} color="#FF3B30" />}
                        <span style={{ color: status.type === 'success' ? '#34C759' : '#FF3B30', fontWeight: 600, fontSize: 14 }}>{status.msg}</span>
                    </div>
                )}

                {fetching ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                        <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={s.form}>
                        {/* Age */}
                        <div style={s.group}>
                            <label style={s.label}>Age</label>
                            <input
                                type="number"
                                min="13" max="90"
                                placeholder="Your age"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                                style={s.input}
                            />
                        </div>

                        {/* Gender */}
                        <div style={s.group}>
                            <label style={s.label}>Gender</label>
                            <select
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                style={{ ...s.input, cursor: 'pointer' }}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div style={s.divider}><span style={s.dividerText}>Change Password (optional)</span></div>

                        {/* New Password */}
                        <div style={s.group}>
                            <label style={s.label}>New Password</label>
                            <div style={s.pwWrap}>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="New password (8+ chars)"
                                    value={formData.newPassword}
                                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                    style={{ ...s.input, paddingRight: 48 }}
                                />
                                <button type="button" style={s.eyeBtn} onClick={() => setShowPw(v => !v)}>
                                    {showPw ? <EyeOff size={18} color="var(--text-secondary)" /> : <Eye size={18} color="var(--text-secondary)" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div style={s.group}>
                            <label style={s.label}>Confirm New Password</label>
                            <div style={s.pwWrap}>
                                <input
                                    type={showConfirmPw ? 'text' : 'password'}
                                    placeholder="Repeat new password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    style={{ ...s.input, paddingRight: 48 }}
                                />
                                <button type="button" style={s.eyeBtn} onClick={() => setShowConfirmPw(v => !v)}>
                                    {showConfirmPw ? <EyeOff size={18} color="var(--text-secondary)" /> : <Eye size={18} color="var(--text-secondary)" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" style={s.submitBtn} disabled={loading}>
                            {loading
                                ? <Loader size={20} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                                : 'Save Changes'}
                        </button>
                    </form>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: 'var(--background)' },
    header: {
        padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface)', borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 10
    },
    backBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex' },
    headerTitle: { fontSize: '18px', fontWeight: '700' },
    content: { maxWidth: '540px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
    avatarWrap: { position: 'relative', marginBottom: '4px' },
    avatar: { width: '88px', height: '88px', borderRadius: '44px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124,77,255,0.3)' },
    avatarText: { color: '#fff', fontSize: '36px', fontWeight: '800' },
    iconBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--background)' },
    name: { fontSize: '20px', fontWeight: '800', margin: 0 },
    emailText: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' },
    banner: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '14px', border: '1px solid', boxSizing: 'border-box' },
    form: { width: '100%', background: 'var(--surface)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', boxSizing: 'border-box' },
    group: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { padding: '14px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '500', width: '100%', boxSizing: 'border-box', outline: 'none' },
    pwWrap: { position: 'relative' },
    eyeBtn: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 },
    divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' },
    dividerText: { fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', whiteSpace: 'nowrap', letterSpacing: '0.4px' },
    submitBtn: { background: 'var(--primary-gradient)', color: '#fff', padding: '16px', borderRadius: '14px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 1, transition: 'opacity 0.2s' },
};
