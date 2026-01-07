'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface Stats {
    totalUsers: number;
    totalTasks: number;
    totalServices: number;
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    isApproved: boolean;
    identificationPath?: string;
    createdAt: string;
}

interface Task {
    id: string;
    status: string;
    service: { name: string };
    client: { firstName: string; lastName: string; email: string };
    createdAt: string;
    assignments: any[];
}

export default function AdminPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [pendingContractors, setPendingContractors] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [assigningTask, setAssigningTask] = useState<Task | null>(null);
    const [contractorSearch, setContractorSearch] = useState('');
    const [viewingDocument, setViewingDocument] = useState<User | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, tasksRes, pendingRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/tasks'),
                api.get('/admin/pending-contractors')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setTasks(tasksRes.data);
            setPendingContractors(pendingRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsUpdating(true);
        try {
            const res = await api.patch(`/admin/users/${editingUser.id}`, {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                isActive: editingUser.isActive
            });

            setUsers(users.map(u => u.id === editingUser.id ? res.data : u));
            setEditingUser(null);
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAssignContractor = async (contractorId: string) => {
        if (!assigningTask) return;

        setIsUpdating(true);
        try {
            await api.post(`/admin/tasks/${assigningTask.id}/assign`, { contractorId });
            await fetchData(); // Refresh all data
            setAssigningTask(null);
        } catch (error) {
            console.error('Failed to assign task:', error);
            alert('Failed to assign task.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUnassignContractor = async (contractorId: string) => {
        if (!assigningTask) return;

        setIsUpdating(true);
        try {
            await api.patch(`/admin/tasks/${assigningTask.id}/unassign`, { contractorId });
            await fetchData(); // Refresh all data
            setAssigningTask(null);
        } catch (error) {
            console.error('Failed to unassign task:', error);
            alert('Failed to unassign task.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVerifyContractor = async (userId: string, approve: boolean) => {
        setIsUpdating(true);
        try {
            await api.post(`/admin/verify-contractor/${userId}`, { approve });
            alert(approve ? 'Contractor approved!' : 'Contractor rejected');
            await fetchData();
        } catch (error) {
            console.error('Failed to verify contractor:', error);
            alert('Failed to verify contractor.');
        } finally {
            setIsUpdating(false);
        }
    };

    const contractors = users.filter(u => u.role === 'CONTRACTOR' && u.isApproved && u.isActive);

    const filteredUsers = users.filter(u => {
        if (activeTab === 'all') return true;
        const roleMap: { [key: string]: string } = {
            'clients': 'CLIENT',
            'contractors': 'CONTRACTOR',
            'admins': 'ADMIN'
        };
        return u.role === roleMap[activeTab];
    });

    const counts = {
        all: users.length,
        clients: users.filter(u => u.role === 'CLIENT').length,
        contractors: users.filter(u => u.role === 'CONTRACTOR' && u.isApproved).length,
        pending: pendingContractors.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        tasks: tasks.length
    };

    if (loading && !stats) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 className="h1">Admin Control Center</h1>
                <p className="text-sub">System-wide overview and management</p>
            </div>

            {/* Stats Overview */}
            <div className="grid-3" style={{ marginBottom: '3rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👥</div>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats?.totalUsers || 0}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--info-light)', color: 'var(--info)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📋</div>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Tasks</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats?.totalTasks || 0}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>✨</div>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Services</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats?.totalServices || 0}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', padding: '0 1rem' }}>
                {[
                    { id: 'tasks', label: 'All Tasks', count: counts.tasks },
                    { id: 'pending', label: 'Verifications', count: counts.pending },
                    { id: 'all', label: 'All Users', count: counts.all },
                    { id: 'clients', label: 'Clients', count: counts.clients },
                    { id: 'contractors', label: 'Contractors', count: counts.contractors }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '1rem 0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                            background: 'none',
                            border: 'none',
                            borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            marginBottom: '-1px'
                        }}
                    >
                        {tab.label}
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: activeTab === tab.id ? 'var(--primary-light)' : 'var(--bg-body)',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-light)'
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeTab === 'tasks' ? (
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-body)' }}>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Service & Client</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Contractor</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Requested</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>No tasks found.</td></tr>
                                ) : (
                                    tasks.map((t) => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{t.service.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.client.firstName} {t.client.lastName}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                <span className={`badge status-${t.status.toLowerCase()}`}>
                                                    {t.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                {t.assignments?.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        {t.assignments.map(a => (
                                                            <div key={a.id} style={{ fontSize: '0.8125rem', fontWeight: '600' }}>
                                                                • {a.contractor.firstName} {a.contractor.lastName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Not Assigned</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                                    onClick={() => setAssigningTask(t)}
                                                >
                                                    {t.assignments?.length > 0 ? 'Reassign' : 'Assign'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'pending' ? (
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-body)' }}>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Contractor</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Identification</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Applied</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingContractors.length === 0 ? (
                                    <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>No pending verifications.</td></tr>
                                ) : (
                                    pendingContractors.map((u) => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{u.firstName} {u.lastName}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                {u.identificationPath ? (
                                                    <button
                                                        onClick={() => setViewingDocument(u)}
                                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <span>📄</span> View Document
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>No Document</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', background: 'var(--success)', border: 'none' }}
                                                        onClick={() => handleVerifyContractor(u.id, true)}
                                                        disabled={isUpdating}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                                        onClick={() => handleVerifyContractor(u.id, false)}
                                                        disabled={isUpdating}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-body)' }}>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>User</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Role</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Joined</th>
                                    <th style={{ padding: '1rem 2rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{u.firstName} {u.lastName}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', background: u.role === 'ADMIN' ? 'var(--danger-light)' : u.role === 'CONTRACTOR' ? 'var(--info-light)' : 'var(--bg-body)', color: u.role === 'ADMIN' ? 'var(--danger)' : u.role === 'CONTRACTOR' ? 'var(--info)' : 'var(--text-muted)' }}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.isActive ? 'var(--success)' : 'var(--text-light)' }}></div>
                                                <span style={{ fontSize: '0.875rem' }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                                            </div>
                                            {!u.isApproved && u.role === 'CONTRACTOR' && (
                                                <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '4px', fontWeight: 'bold' }}>PENDING VERIFICATION</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                            <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => setEditingUser(u)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {assigningTask && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <h2 className="h2" style={{ marginBottom: '0.5rem' }}>Assign Contractor</h2>
                        <p className="text-sub" style={{ marginBottom: '1.5rem' }}>Select providers for: <strong>{assigningTask.service.name}</strong></p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                placeholder="Search contractors..."
                                value={contractorSearch}
                                onChange={(e) => setContractorSearch(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg-body)' }}
                            />
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                            {contractors.filter(c =>
                                `${c.firstName} ${c.lastName}`.toLowerCase().includes(contractorSearch.toLowerCase()) ||
                                c.email.toLowerCase().includes(contractorSearch.toLowerCase())
                            ).length === 0 ? (
                                <p className="text-sub" style={{ textAlign: 'center', padding: '2rem' }}>No matching contractors found.</p>
                            ) : (
                                contractors.filter(c =>
                                    `${c.firstName} ${c.lastName}`.toLowerCase().includes(contractorSearch.toLowerCase()) ||
                                    c.email.toLowerCase().includes(contractorSearch.toLowerCase())
                                ).map(c => {
                                    const isAssigned = assigningTask.assignments?.some((a: any) => a.contractor.id === c.id);
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => isAssigned ? handleUnassignContractor(c.id) : handleAssignContractor(c.id)}
                                            disabled={isUpdating}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '1.125rem',
                                                borderRadius: '1rem',
                                                border: `1.5px solid ${isAssigned ? 'var(--primary)' : 'var(--border)'}`,
                                                background: isAssigned ? 'var(--primary-light)' : '#fff',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = isAssigned ? 'var(--primary)' : 'var(--border)'; }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {c.firstName} {c.lastName}
                                                    {isAssigned && <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'var(--primary)', color: 'white', borderRadius: '4px' }}>ASSIGNED</span>}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email}</div>
                                            </div>
                                            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem' }}>
                                                {isAssigned ? 'Remove ×' : 'Assign →'}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button onClick={() => { setAssigningTask(null); setContractorSearch(''); }} className="btn btn-ghost" disabled={isUpdating}>Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Existing) */}
            {editingUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                        <h2 className="h2">Edit User</h2>
                        <p className="text-sub" style={{ marginBottom: '2rem' }}>Update profile details for {editingUser.email}</p>
                        <form onSubmit={handleUpdateUser}>
                            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>First Name</label>
                                    <input type="text" value={editingUser.firstName} onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Last Name</label>
                                    <input type="text" value={editingUser.lastName} onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={editingUser.isActive} onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Account is Active</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-ghost" disabled={isUpdating}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {viewingDocument && viewingDocument.identificationPath && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', background: 'white', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="h3" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Document Verification</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{viewingDocument.firstName} {viewingDocument.lastName}</p>
                            </div>
                            <button
                                onClick={() => setViewingDocument(null)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '1px solid var(--border)',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    fontSize: '1.25rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                &times;
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                            {(() => {
                                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'}${viewingDocument.identificationPath}`;
                                const ext = viewingDocument.identificationPath.toLowerCase().split('.').pop();

                                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')) {
                                    return <img src={url} alt="ID Document" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />;
                                } else if (ext === 'pdf') {
                                    return <iframe src={url} style={{ width: '100%', height: '70vh', border: 'none' }} title="Document PDF" />;
                                } else {
                                    return (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                                            <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Preview not available</p>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>File type: .{ext}</p>
                                            <a href={url} target="_blank" rel="noopener noreferrer" download className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                                                <span>⬇️</span> Download File
                                            </a>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                tbody tr:hover { background: #fafafa; }
            `}</style>
        </div>
    );
}
