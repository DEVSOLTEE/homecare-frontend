export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CLIENT' | 'CONTRACTOR' | 'ADMIN';
    phone?: string;
    avatarUrl?: string;
}

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const setUser = (user: User) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
    }
};

export const getUser = (): User | null => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
    }
    return null;
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

export const hasRole = (role: string): boolean => {
    const user = getUser();
    return user?.role === role;
};
