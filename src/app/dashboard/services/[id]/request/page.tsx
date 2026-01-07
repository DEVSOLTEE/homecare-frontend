'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import api from '../../../../../lib/api';

interface Service {
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
    basePrice: number;
}

export default function RequestServicePage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [service, setService] = useState<Service | null>(null);
    const [address, setAddress] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const serviceRes = await api.get(`/services/${params.id}`);
            setService(serviceRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError('Failed to load service details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // Updated payload to match backend expectations:
            // address (string), city (string), state (string), zipCode (string), isDefault (boolean)
            const homeRes = await api.post('/homes', {
                address: address, // Renamed from addressLine1
                city: 'Amsterdam', // Provide default city
                state: 'NL',
                zipCode: '1000AA', // Provide default valid zipcode
                isDefault: false   // Required field
            });

            if (!homeRes.data?.id) {
                throw new Error('Failed to process address');
            }

            // Calculate a 24-hour window for the preferred date
            const start = new Date(preferredDate);
            const end = new Date(start);
            end.setDate(start.getDate() + 1);

            await api.post('/tasks', {
                serviceId: params.id,
                homeId: homeRes.data.id,
                preferredStartDate: start.toISOString(),
                preferredEndDate: end.toISOString(),
                clientNotes: notes, // Renamed from notes to match backend entity property
            });
            router.push('/dashboard/tasks');
        } catch (err: any) {
            console.error('Submission error:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                // Check for 'error' field (from our custom exception) or 'message' (standard NestJS)
                const serverError = err.response.data?.error || err.response.data?.message;
                setError(serverError || 'Failed to create request.');
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading...</div>;
    }

    if (!service) {
        return <div style={{ padding: '2rem' }}>Service not found</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Back Button */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem 0.5rem 0',
                        fontWeight: '500',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                    ← Back to Services
                </button>
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr',
                gap: '4rem',
                alignItems: 'start'
            }}>
                {/* Left Column: Info */}
                <div>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        color: '#0f172a',
                        letterSpacing: '-0.03em',
                        lineHeight: '1'
                    }}>
                        Request<br />Service
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '3rem', maxWidth: '300px' }}>
                        Fill in your details and we'll schedule your service immediately.
                    </p>

                    {/* Service Info Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        borderRadius: '1.5rem',
                        padding: '2.5rem',
                        color: 'white',
                        boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.4)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-10%',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '50%',
                            filter: 'blur(60px)'
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: '600',
                                opacity: 0.8,
                                marginBottom: '0.5rem'
                            }}>
                                Selected Package
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                                {service.name}
                            </h2>
                            <p style={{ opacity: 0.9, marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
                                {service.description}
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1.5rem',
                                borderTop: '1px solid rgba(255,255,255,0.2)',
                                paddingTop: '1.5rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Duration</div>
                                    <div style={{ fontWeight: '700', fontSize: '1.5rem' }}>{service.estimatedDuration} min</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Base Price</div>
                                    <div style={{ fontWeight: '700', fontSize: '1.5rem' }}>${service.basePrice}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div style={{ paddingTop: '1rem' }}>
                    <form onSubmit={handleSubmit} style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '1.5rem',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)'
                    }}>
                        {error && (
                            <div style={{
                                padding: '1rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.75rem',
                                color: '#991b1b',
                                marginBottom: '2rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '2rem' }}>
                            <label htmlFor="address" style={{
                                display: 'block',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: '#1e293b',
                                marginBottom: '0.75rem'
                            }}>
                                Where should we go?
                            </label>
                            <input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="E.g. Prinsengracht 263, 1016 GV Amsterdam"
                                required
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '1rem',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: '#f8fafc',
                                    color: '#0f172a'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366f1';
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.backgroundColor = '#f8fafc';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label htmlFor="date" style={{
                                display: 'block',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: '#1e293b',
                                marginBottom: '0.75rem'
                            }}>
                                When would you like us?
                            </label>
                            <input
                                id="date"
                                type="date"
                                value={preferredDate}
                                onChange={(e) => setPreferredDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '1rem',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: '#f8fafc',
                                    color: '#0f172a'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366f1';
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.backgroundColor = '#f8fafc';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label htmlFor="notes" style={{
                                display: 'block',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: '#1e293b',
                                marginBottom: '0.75rem'
                            }}>
                                Anything else? <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span>
                            </label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Gate codes, parking info, or specific focus areas..."
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '1rem',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: '#f8fafc',
                                    color: '#0f172a',
                                    resize: 'vertical',
                                    lineHeight: '1.6'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366f1';
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.backgroundColor = '#f8fafc';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                borderRadius: '1rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                color: 'white',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: submitting ? 0.7 : 1,
                                transform: submitting ? 'scale(0.98)' : 'translateY(0)'
                            }}
                            onMouseEnter={(e) => {
                                if (!submitting) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 20px 30px -10px rgba(79, 70, 229, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79, 70, 229, 0.4)';
                            }}
                        >
                            {submitting ? 'Scheduling...' : 'Confirm Request →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
