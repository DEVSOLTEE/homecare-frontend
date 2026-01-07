'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../lib/api';

export default function TaskDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [contractors, setContractors] = useState<any[]>([]);
    const [selectedContractor, setSelectedContractor] = useState('');
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [proposedDate, setProposedDate] = useState('');
    const [proposedTime, setProposedTime] = useState('');

    useEffect(() => {
        if (id) {
            fetchTask();
        }
    }, [id]);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchContractors();
        }
    }, [user]);

    const fetchContractors = async () => {
        try {
            const response = await api.get('/admin/users');
            const onlyContractors = response.data.filter((u: any) => u.role === 'CONTRACTOR');
            setContractors(onlyContractors);
        } catch (error) {
            console.error('Failed to fetch contractors:', error);
        }
    };

    const fetchTask = async () => {
        try {
            const response = await api.get(`/tasks/${id}`);
            setTask(response.data);
        } catch (error) {
            console.error('Failed to fetch task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProposeSchedule = async () => {
        try {
            await api.post(`/tasks/${id}/propose-schedule`, {
                proposedDate,
                proposedTime,
            });
            alert('Schedule proposed successfully!');
            fetchTask();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to propose schedule';
            alert(`Error: ${message}`);
        }
    };

    const handleAcceptTask = async () => {
        try {
            await api.post(`/tasks/${id}/accept`);
            alert('Task accepted!');
            fetchTask();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to accept task';
            alert(`Error: ${message}`);
        }
    };

    const handleApproveSchedule = async () => {
        try {
            await api.post(`/tasks/${id}/approve-schedule`);
            alert('Schedule approved!');
            fetchTask();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to approve schedule';
            alert(`Error: ${message}`);
        }
    };

    const handleRejectSchedule = async () => {
        try {
            await api.post(`/tasks/${id}/reject-schedule`, {
                reason: 'Time not suitable',
            });
            alert('Schedule rejected');
            fetchTask();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to reject schedule';
            alert(`Error: ${message}`);
        }
    };

    const handleAssignContractor = async () => {
        if (!selectedContractor) {
            alert('Please select a contractor to assign');
            return;
        }
        try {
            await api.post(`/tasks/${id}/assign`, {
                contractorId: selectedContractor
            });
            alert('Contractor assigned successfully!');
            fetchTask();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to assign contractor');
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await api.put(`/tasks/${id}/status`, { status: newStatus });
            alert('Status updated!');
            fetchTask();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        if (['COMPLETED'].includes(status)) return 'status-green';
        if (['APPROVED', 'SCHEDULED'].includes(status)) return 'status-purple';
        if (['REQUESTED', 'PROPOSED', 'IN_PROGRESS', 'AWAITING_CONTRACTOR_PROPOSAL'].includes(status)) return 'status-orange';
        return 'status-red';
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
    if (!task) return <div style={{ padding: '2rem' }}>Task not found</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={() => router.back()} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
                ← Back to Tasks
            </button>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            {task?.service?.name || 'Service Name'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {task?.service?.category?.name || 'Category'}
                        </p>
                    </div>
                    {task?.status && (
                        <span className={`badge ${getStatusColor(task.status)}`} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                            {task.status === 'APPROVED' ? 'CONFIRMED' :
                                task.status === 'SCHEDULED' ? 'BOOKED' :
                                    task.status.replace(/_/g, ' ')}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Overview */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Overview</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Client</div>
                            <div>{task.client.firstName} {task.client.lastName}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Address</div>
                            <div>{task.home.address}, {task.home.city}, {task.home.state}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Created</div>
                            <div>{new Date(task.createdAt).toLocaleString()}</div>
                        </div>
                        {task.clientNotes && (
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Notes</div>
                                <div>{task.clientNotes}</div>
                            </div>
                        )}
                        {task.assignments && task.assignments.length > 0 && (
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assigned Contractor</div>
                                {task.assignments.map((assignment: any) => (
                                    <div key={assignment.id} style={{ fontWeight: '500', color: 'var(--primary)' }}>
                                        {assignment.contractor.firstName} {assignment.contractor.lastName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Assignment - Admin Only */}
                {user?.role === 'ADMIN' && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Assignment</h2>
                        {task.assignments && task.assignments.length > 0 ? (
                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Currently Assigned to</p>
                                {task.assignments.map((assignment: any) => (
                                    <div key={assignment.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                            {assignment.contractor.firstName[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                                {assignment.contractor.firstName} {assignment.contractor.lastName}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {assignment.contractor.email}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        Select Contractor
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            className="input"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                paddingRight: '3rem',
                                                borderRadius: '0.75rem',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'white',
                                                fontSize: '0.95rem',
                                                color: 'var(--text-main)',
                                                appearance: 'none',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                boxShadow: 'var(--shadow-sm)',
                                                transition: 'all 0.2s ease',
                                                textOverflow: 'ellipsis'
                                            }}
                                            value={selectedContractor}
                                            onChange={(e) => setSelectedContractor(e.target.value)}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                        >
                                            <option value="" disabled>-- Select Contractor --</option>
                                            {contractors.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.firstName} {c.lastName} ({c.email})
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                                            ▼
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAssignContractor}
                                    className="btn btn-primary"
                                    disabled={!selectedContractor}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        opacity: selectedContractor ? 1 : 0.7,
                                        cursor: selectedContractor ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <span>Assign Contractor</span>
                                    <span style={{ fontSize: '1.2rem' }}>→</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Schedule */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Schedule</h2>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Preferred Window
                        </div>
                        <div>
                            {task.preferredStartDate && new Date(task.preferredStartDate).toLocaleDateString()} - {task.preferredEndDate && new Date(task.preferredEndDate).toLocaleDateString()}
                        </div>
                    </div>

                    {task.proposedDate && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Proposed Schedule
                            </div>
                            <div style={{ fontWeight: '500' }}>
                                {new Date(task.proposedDate).toLocaleDateString()} at {task.proposedTime}
                            </div>
                        </div>
                    )}

                    {/* Contractor: Propose Schedule or Accept */}
                    {user?.role === 'CONTRACTOR' && ((task.status === 'AWAITING_CONTRACTOR_PROPOSAL' || task.status === 'PROPOSED') || (task.status === 'REQUESTED' && task.assignments?.some((a: any) => a.contractorId === user.id))) && (
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={handleAcceptTask} className="btn btn-primary" style={{ width: '100%', background: 'var(--success)', border: 'none' }}>
                                {task.status === 'PROPOSED' ? 'Approve & Confirm Task' : 'Accept Task (Use Preferred Dates)'}
                            </button>

                            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                                <div className="label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    {task.status === 'PROPOSED' ? 'Or Update Proposed Schedule' : 'Or Propose Different Date & Time'}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input
                                        type="date"
                                        className="input"
                                        value={proposedDate}
                                        onChange={(e) => setProposedDate(e.target.value)}
                                    />
                                    <input
                                        type="time"
                                        className="input"
                                        value={proposedTime}
                                        onChange={(e) => setProposedTime(e.target.value)}
                                    />
                                </div>
                                <button onClick={handleProposeSchedule} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
                                    {task.status === 'PROPOSED' ? 'Update Proposal' : 'Propose Different Schedule'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Client: Approve/Reject */}
                    {user?.role === 'CLIENT' && task.status === 'PROPOSED' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button onClick={handleApproveSchedule} className="btn btn-primary" style={{ flex: 1 }}>
                                Approve
                            </button>
                            <button onClick={handleRejectSchedule} className="btn btn-danger" style={{ flex: 1 }}>
                                Reject
                            </button>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {user?.role === 'CONTRACTOR' && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {task.status === 'APPROVED' && (
                                <button onClick={() => handleUpdateStatus('SCHEDULED')} className="btn btn-primary">
                                    Mark as Scheduled
                                </button>
                            )}
                            {task.status === 'SCHEDULED' && (
                                <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="btn btn-primary">
                                    Start Task
                                </button>
                            )}
                            {task.status === 'IN_PROGRESS' && (
                                <button onClick={() => handleUpdateStatus('COMPLETED')} className="btn btn-primary">
                                    Complete Task
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline */}
            {task.timeline && task.timeline.length > 0 && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Timeline</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {task.timeline.map((entry: any, index: number) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: index < task.timeline.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '0.375rem', flexShrink: 0 }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{entry.action}</div>
                                    {entry.details && (
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                            {entry.details}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
