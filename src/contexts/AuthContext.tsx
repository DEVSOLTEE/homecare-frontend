'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { User, setToken, getToken, removeToken, setUser as saveUser, getUser } from '../lib/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    signup: (email: string, password: string, firstName: string, lastName: string, role: string, phone?: string) => Promise<void>;
    contractorSignup: (formData: FormData) => Promise<void>;
    updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        const savedUser = getUser();
        if (token && savedUser) {
            setUserState(savedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user: userData } = response.data;

            setToken(access_token);
            saveUser(userData);
            setUserState(userData);

            router.push('/dashboard');
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const logout = () => {
        removeToken();
        setUserState(null);
        router.push('/login');
    };

    const signup = async (email: string, password: string, firstName: string, lastName: string, role: string, phone?: string) => {
        try {
            await api.post('/auth/signup', { email, password, firstName, lastName, role, phone });
            router.push('/login');
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Signup failed');
        }
    };

    const contractorSignup = async (formData: FormData) => {
        try {
            await api.post('/auth/contractor-signup', formData);
            // Redirect will be handled in the component (to a success message)
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Contractor signup failed');
        }
    };

    const updateUser = (userData: User) => {
        saveUser(userData);
        setUserState(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, signup, contractorSignup, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
