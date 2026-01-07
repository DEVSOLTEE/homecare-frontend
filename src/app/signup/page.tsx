'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'CLIENT',
        phone: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { signup, contractorSignup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (formData.role === 'CONTRACTOR') {
                if (!file) {
                    setError('Please upload an identification document');
                    setLoading(false);
                    return;
                }
                const data = new FormData();
                data.append('email', formData.email);
                data.append('password', formData.password);
                data.append('firstName', formData.firstName);
                data.append('lastName', formData.lastName);
                data.append('phone', formData.phone);
                data.append('identification', file);

                await contractorSignup(data);
                setSuccess(true);
            } else {
                await signup(
                    formData.email,
                    formData.password,
                    formData.firstName,
                    formData.lastName,
                    formData.role,
                    formData.phone || undefined
                );
            }
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⏳</div>
                    <h1 className={styles.title}>Application Received</h1>
                    <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
                        Thank you for applying to be a contractor. Our administrators will review your identification and documents. You'll be able to sign in once approved.
                    </p>
                    <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Background decorative elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>

            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join Home Care for premium services</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                className={styles.input}
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                className={styles.input}
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={styles.input}
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone (Optional)</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            className={styles.input}
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="role">Account Type</label>
                        <select
                            id="role"
                            name="role"
                            className={`${styles.input} ${styles.select}`}
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="CLIENT">Client (Homeowner)</option>
                            <option value="CONTRACTOR">Contractor (Service Provider)</option>
                        </select>
                    </div>

                    {formData.role === 'CONTRACTOR' && (
                        <div className={styles.formGroup} style={{ animation: 'slideIn 0.3s ease-out' }}>
                            <label htmlFor="identification">Identification Document (ID/Passport)</label>
                            <div className={styles.filePrompt} onClick={() => document.getElementById('identification')?.click()}>
                                <input
                                    id="identification"
                                    name="identification"
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📄</div>
                                <div style={{ fontSize: '0.85rem', color: file ? 'var(--primary)' : 'var(--text-muted)', fontWeight: file ? '700' : '500' }}>
                                    {file ? file.name : 'Click to upload identification'}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span style={{ width: '1.25rem', height: '1.25rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                                Creating account...
                            </>
                        ) : (
                            'Get Started'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Already have an account?
                        <Link href="/login" className={styles.link}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
