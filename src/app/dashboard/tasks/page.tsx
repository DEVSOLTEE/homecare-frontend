'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

interface Task {
    id: string;
    status: string;
    service: { name: string; category?: { name: string } };
    client: { firstName: string; lastName: string };
    createdAt: string;
    proposedDate?: string;
    assignments?: any[];
}

function TasksContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter') || 'all';

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(initialFilter);

    useEffect(() => {
        const urlFilter = searchParams.get('filter');
        if (urlFilter) {
            setFilter(urlFilter);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
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

    const filteredTasks = filter === 'all'
        ? tasks
        : tasks.filter(t => {
            if (filter === 'pending') return ['REQUESTED', 'PROPOSED', 'AWAITING_CONTRACTOR_PROPOSAL'].includes(t.status);
            if (filter === 'confirmed') return ['APPROVED', 'SCHEDULED'].includes(t.status);
            if (filter === 'active') return ['IN_PROGRESS'].includes(t.status);
            if (filter === 'completed') return t.status === 'COMPLETED';
            return true;
        });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 className="h1">Task Manager</h1>
                    <p className="text-sub">Manage and track all your service tasks</p>
                </div>
                {user?.role === 'CLIENT' && (
                    <a href="/dashboard/services" className="btn btn-primary">
                        <span>✨</span> New Request
                    </a>
                )}
            </div>

            {/* Filters */}
            <div className="glass" style={{ padding: '0.5rem', borderRadius: '1rem', display: 'inline-flex', gap: '0.25rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.5)' }}>
                {[
                    { id: 'all', label: 'All', count: tasks.length },
                    { id: 'pending', label: 'Pending', count: tasks.filter(t => ['REQUESTED', 'PROPOSED', 'AWAITING_CONTRACTOR_PROPOSAL'].includes(t.status)).length },
                    { id: 'confirmed', label: 'Confirmed', count: tasks.filter(t => ['APPROVED', 'SCHEDULED'].includes(t.status)).length },
                    { id: 'active', label: 'In Progress', count: tasks.filter(t => ['IN_PROGRESS'].includes(t.status)).length },
                    { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'COMPLETED').length }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setFilter(item.id);
                            router.push(`/dashboard/tasks?filter=${item.id}`);
                        }}
                        style={{
                            padding: '0.625rem 1.25rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: filter === item.id ? 'white' : 'transparent',
                            color: filter === item.id ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: filter === item.id ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {item.label}
                        <span style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: filter === item.id ? 'var(--primary-light)' : 'var(--border)',
                            fontSize: '0.75rem',
                            opacity: 0.8
                        }}>{item.count}</span>
                    </button>
                ))}
            </div>

            {/* Tasks Table */}
            <div className="card" style={{ padding: '1rem' }}>
                {loading ? (
                    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                        <div style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p className="text-sub">Loading tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>📋</div>
                        <p className="h2" style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>No tasks found in this category</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service Details</th>
                                    {user?.role !== 'CLIENT' && (
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                                    )}
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                                        style={{ transition: 'all 0.2s', background: '#fff', cursor: 'pointer' }}
                                    >
                                        <td style={{ padding: '1.25rem 1.5rem', borderRadius: '1rem 0 0 1rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem' }}>{task.service.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                                {task.service?.category?.name || 'Uncategorized'}
                                            </div>
                                        </td>
                                        {user?.role !== 'CLIENT' && (
                                            <td style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{task.client.firstName} {task.client.lastName}</div>
                                            </td>
                                        )}
                                        <td style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                                            <span className={`badge ${getStatusColor(task.status)}`}>
                                                {task.status === 'APPROVED' ? 'CONFIRMED' :
                                                    task.status === 'SCHEDULED' ? 'BOOKED' :
                                                        task.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', borderRadius: '0 1rem 1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', textAlign: 'right' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/dashboard/tasks/${task.id}`);
                                                }}
                                                className="btn"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--bg-body)', border: '1px solid var(--border)', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                tbody tr:hover td { background: white !important; cursor: pointer; }
            `}</style>
        </div>
    );
}

export default function TasksPage() {
    return (
        <Suspense fallback={
            <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                <p className="text-sub">Loading task manager...</p>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <TasksContent />
        </Suspense>
    );
}
