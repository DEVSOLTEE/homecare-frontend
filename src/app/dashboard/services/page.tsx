'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

interface Service {
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
    basePrice: number;
    category: {
        id: string;
        name: string;
    };
}

export default function ServicesPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const [servicesRes, categoriesRes] = await Promise.all([
                api.get('/services'),
                api.get('/services/categories'),
            ]);
            setServices(servicesRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = selectedCategory === 'all'
        ? services
        : services.filter(s => s.category.id === selectedCategory);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Service Catalog
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Browse our professional home care and maintenance services
                </p>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={selectedCategory === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
                    >
                        All Services
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={selectedCategory === cat.id ? 'btn btn-primary' : 'btn btn-secondary'}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Services Grid */}
            {loading ? (
                <p>Loading services...</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {filteredServices.map((service) => (
                        <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                    {service.category.name}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                                {service.name}
                            </h3>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>
                                {service.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Duration</div>
                                    <div style={{ fontWeight: '500' }}>{service.estimatedDuration} min</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Starting at</div>
                                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>${service.basePrice}</div>
                                </div>
                            </div>

                            {user?.role === 'CLIENT' && (
                                <a href={`/dashboard/services/${service.id}/request`} className="btn btn-primary" style={{ width: '100%' }}>
                                    Request Service
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
