'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import styles from './page.module.css';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Character Avatar */}
                <div className={styles.avatarContainer}>
                    <Image
                        src={isPasswordFocused
                            ? "/worker-closed.png"
                            : "/worker-open.png"
                        }
                        alt="Home Care Worker"
                        width={120}
                        height={120}
                        className={styles.avatar}
                        priority
                    />
                </div>

                <div className={styles.header}>
                    <h1 className={styles.title}>Home Care Service</h1>
                    <p className={styles.subtitle}>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className="label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className="label">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Don't have an account?{' '}
                        <Link href="/signup" className={styles.link}>
                            Sign up
                        </Link>
                    </p>
                </div>

                <div className={styles.demoAccounts}>
                    <p className={styles.demoTitle}>Demo Accounts:</p>
                    <div className={styles.demoList}>
                        <div className={styles.demoItem}>
                            <strong>Client:</strong> client@homecare.com / Password123!
                        </div>
                        <div className={styles.demoItem}>
                            <strong>Contractor:</strong> contractor@homecare.com / Password123!
                        </div>
                        <div className={styles.demoItem}>
                            <strong>Admin:</strong> admin@homecare.com / Password123!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
