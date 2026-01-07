'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    parseISO
} from 'date-fns';
import api from '../../../lib/api';

interface Task {
    id: string;
    status: string;
    preferredStartDate: string;
    proposedDate: string | null;
    proposedTime: string | null;
    service: {
        name: string;
    };
}

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.1rem' }}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>View and manage your scheduled services</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', background: '#f1f5f9', padding: '0.5rem', borderRadius: '1rem' }}>
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        style={{
                            padding: '0.6rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: 'white',
                            color: '#475569',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: 'transparent',
                            color: '#475569',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        style={{
                            padding: '0.6rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: 'white',
                            color: '#475569',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                marginBottom: '1rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '1rem'
            }}>
                {days.map(day => (
                    <div key={day} style={{
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const getStatusColor = (status: string) => {
        const green = { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
        const blue = { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
        const yellow = { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' };

        switch (status) {
            case 'REQUESTED': return blue;
            case 'PROPOSED':
            case 'APPROVED':
            case 'SCHEDULED':
            case 'COMPLETED': return green;
            case 'IN_PROGRESS': return yellow;
            default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
        }
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, 'd');
                const cloneDay = day;
                const dayTasks = tasks.filter(task => {
                    const taskDate = task.proposedDate ? parseISO(task.proposedDate) : parseISO(task.preferredStartDate);
                    return isSameDay(taskDate, cloneDay);
                });
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const hasGreenTask = dayTasks.some(t => ['PROPOSED', 'APPROVED', 'SCHEDULED', 'COMPLETED'].includes(t.status));

                days.push(
                    <div
                        key={day.toString()}
                        style={{
                            height: '110px',
                            padding: '0.5rem',
                            background: hasGreenTask ? '#dbf6e4' : (isCurrentMonth ? 'white' : '#f8fafc'),
                            border: '1px solid #f1f5f9',
                            position: 'relative',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: isToday ? '800' : '600',
                            color: isToday ? '#4f46e5' : (isCurrentMonth ? '#1e293b' : '#cbd5e1'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: isToday ? '#eef2ff' : 'transparent',
                            marginBottom: '0.25rem'
                        }}>
                            {formattedDate}
                        </span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {dayTasks.map(task => {
                                const colors = getStatusColor(task.status);
                                return (
                                    <Link
                                        key={task.id}
                                        href={`/dashboard/tasks/${task.id}`}
                                        style={{
                                            fontSize: '0.7rem',
                                            padding: '0.3rem 0.5rem',
                                            borderRadius: '0.4rem',
                                            background: hasGreenTask ? 'white' : colors.bg,
                                            color: colors.text,
                                            border: `1px solid ${colors.border}`,
                                            fontWeight: '700',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            lineHeight: '1.2',
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                        }}
                                        title={`${task.service.name} (${task.status})`}
                                    >
                                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{task.service.name}</div>
                                        {task.proposedTime && (
                                            <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{task.proposedTime}</div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {days}
                </div>
            );
            days = [];
        }

        return <div style={{
            borderRadius: '1.5rem',
            overflow: 'hidden',
            border: '1px solid #f1f5f9',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
        }}>{rows}</div>;
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: '500' }}>Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            {renderHeader()}
            <div className="calendar-container" style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '1rem',
                border: '1px solid #f1f5f9',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {renderDays()}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {renderCells()}
                </div>
            </div>
        </div>
    );
}
