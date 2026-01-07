'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const isActive = (path: string) => pathname === path;

    if (loading || !user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Loading Home Care...</div>
                    <style jsx>{`
                        @keyframes spin { to { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div className="app-shell">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="brand-title">Home Care</h1>
                    <p className="brand-subtitle">{user.role} PORTAL</p>
                </div>

                <nav className="sidebar-nav">
                    <a href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                        <span style={{ fontSize: '1.1rem' }}>📊</span> Dashboard
                    </a>
                    <a href="/dashboard/services" className={`nav-link ${isActive('/dashboard/services') ? 'active' : ''}`}>
                        <span style={{ fontSize: '1.1rem' }}>🛠️</span> Services
                    </a>
                    <a href="/dashboard/tasks" className={`nav-link ${isActive('/dashboard/tasks') ? 'active' : ''}`}>
                        <span style={{ fontSize: '1.1rem' }}>📋</span> Tasks
                    </a>
                    <a href="/dashboard/calendar" className={`nav-link ${isActive('/dashboard/calendar') ? 'active' : ''}`}>
                        <span style={{ fontSize: '1.1rem' }}>📅</span> Calendar
                    </a>
                    {user.role === 'ADMIN' && (
                        <a href="/dashboard/admin" className={`nav-link ${isActive('/dashboard/admin') ? 'active' : ''}`}>
                            <span style={{ fontSize: '1.1rem' }}>⚙️</span> Admin
                        </a>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <a href="/dashboard/profile" className="user-profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="user-avatar" style={{ overflow: 'hidden' }}>
                            {user.avatarUrl ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${user.avatarUrl}`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <>{user.firstName[0]}{user.lastName[0]}</>
                            )}
                        </div>
                        <div className="user-info">
                            <h4>{user.firstName} {user.lastName}</h4>
                            <p>{user.email}</p>
                        </div>
                    </a>
                    <button onClick={logout} className="btn btn-ghost">
                        <span>🚪</span> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

