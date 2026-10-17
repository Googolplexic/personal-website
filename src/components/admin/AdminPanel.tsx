import { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { apiUrl } from '../../config/api';

export function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let cancelled = false;
        // Any response (even 401) means the server is up; a network error means it isn't
        fetch(apiUrl('/auth'), { method: 'GET', credentials: 'include' })
            .then((response) => {
                if (!cancelled) setIsAuthenticated(response.ok);
            })
            .catch(() => {
                window.location.href = '/?to=screwyounoadminforyou';
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        try {
            await fetch(apiUrl('/auth'), {
                method: 'DELETE',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return <AdminDashboard onLogout={handleLogout} />;
}
