'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.post('/auth/profile', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone
            });
            updateUser(res.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await api.post('/auth/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(res.data);
            setMessage({ type: 'success', text: 'Avatar updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                    Profile Settings
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage your account information and preferences</p>
            </div>

            <div className="card" style={{ padding: '2.5rem', background: 'white', borderRadius: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                {/* Avatar Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '2rem',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#475569',
                            overflow: 'hidden',
                            border: '4px solid white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            {user?.avatarUrl ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${user.avatarUrl}`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                            )}
                        </div>
                        <label style={{
                            position: 'absolute',
                            bottom: '-10px',
                            right: '-10px',
                            background: '#4f46e5',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '4px solid white',
                            transition: 'transform 0.2s'
                        }}>
                            <input type="file" hidden onChange={handleAvatarChange} accept="image/*" />
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </label>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Your Avatar</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Upload a professional photo or use your initials.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="label" style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>First Name</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label" style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Last Name</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="label" style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            disabled
                            style={{ background: '#f8fafc', cursor: 'not-allowed', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Email cannot be changed for security reasons.</p>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="label" style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Phone Number</label>
                        <input
                            type="tel"
                            className="input"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+31 6 12345678"
                            style={{ borderRadius: '0.75rem', padding: '0.75rem 1rem' }}
                        />
                    </div>

                    {message.text && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '1rem',
                            marginBottom: '1.5rem',
                            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            color: message.type === 'success' ? '#16a34a' : '#dc2626',
                            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                            fontWeight: '500'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontWeight: '700', fontSize: '1rem' }}
                    >
                        {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Need to change your password? Contact support for assistance.
                </p>
            </div>
        </div>
    );
}
