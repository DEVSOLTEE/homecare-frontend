'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

interface Task {
    id: string;
    status: string;
    service: { name: string };
    createdAt: string;
    proposedDate?: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        active: 0,
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            const tasksData = response.data;
            setTasks(tasksData);

            setStats({
                total: tasksData.length,
                pending: tasksData.filter((t: Task) => ['REQUESTED', 'PROPOSED', 'AWAITING_CONTRACTOR_PROPOSAL'].includes(t.status)).length,
                confirmed: tasksData.filter((t: Task) => ['APPROVED', 'SCHEDULED'].includes(t.status)).length,
                active: tasksData.filter((t: Task) => t.status === 'IN_PROGRESS').length,
                completed: tasksData.filter((t: Task) => t.status === 'COMPLETED').length,
            });
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        if (['COMPLETED'].includes(status)) return 'status-completed';
        if (['APPROVED', 'SCHEDULED'].includes(status)) return 'status-confirmed';
        if (['REQUESTED', 'PROPOSED', 'IN_PROGRESS', 'AWAITING_CONTRACTOR_PROPOSAL'].includes(status)) return 'status-requested';
        return 'status-cancelled';
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 className="h1">
                    Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-sub">
                    Here's what's happening with your {user?.role === 'CLIENT' ? 'home services' : 'tasks'} today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3.5rem'
            }}>
                <Link href="/dashboard/tasks?filter=all" style={{ textDecoration: 'none' }}>
                    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks</div>
                            <div style={{ width: '32px', height: '32px', background: 'var(--info-light)', color: 'var(--info)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.total}</div>
                    </div>
                </Link>

                <Link href="/dashboard/tasks?filter=pending" style={{ textDecoration: 'none' }}>
                    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
                            <div style={{ width: '32px', height: '32px', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳</div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.pending}</div>
                    </div>
                </Link>

                <Link href="/dashboard/tasks?filter=confirmed" style={{ textDecoration: 'none' }}>
                    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmed</div>
                            <div style={{ width: '32px', height: '32px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✅</div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.confirmed}</div>
                    </div>
                </Link>

                <Link href="/dashboard/tasks?filter=active" style={{ textDecoration: 'none' }}>
                    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress</div>
                            <div style={{ width: '32px', height: '32px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.active}</div>
                    </div>
                </Link>

                <Link href="/dashboard/tasks?filter=completed" style={{ textDecoration: 'none' }}>
                    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
                            <div style={{ width: '32px', height: '32px', background: '#f5f3ff', color: '#8b5cf6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏆</div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.completed}</div>
                    </div>
                </Link>
            </div>

            {/* Recent Tasks */}
            <div className="card">
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="h2">Recent Tasks</h2>
                    {tasks.length > 0 && (
                        <a href="/dashboard/tasks" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            View all <span>→</span>
                        </a>
                    )}
                </div>

                {loading ? (
                    <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                        <div style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p className="text-sub">Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'grayscale(0.5)' }}>📋</div>
                        <p className="h2" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No tasks found</p>
                        <p className="text-sub" style={{ marginBottom: '2rem' }}>You haven't requested any services yet.</p>
                        {user?.role === 'CLIENT' && (
                            <a href="/dashboard/services" className="btn btn-primary">
                                <span>✨</span> Request a Service
                            </a>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.slice(0, 5).map((task) => (
                            <Link
                                key={task.id}
                                href={`/dashboard/tasks/${task.id}`}
                                style={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.5rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: '1rem',
                                    background: '#fff',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                }}
                                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-body)', color: 'var(--text-main)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', border: '1px solid var(--border)' }}>
                                        🏠
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                            {task.service.name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>🕒</span>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className={`badge ${getStatusColor(task.status)}`}>
                                        {task.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

