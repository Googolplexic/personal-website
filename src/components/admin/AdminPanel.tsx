import { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { apiUrl } from '../../config/api';

export function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const validateSession = useCallback(async () => {
        try {
            const response = await fetch(apiUrl('/auth'), {
                method: 'GET',
                credentials: 'include' // Include cookies
            });

            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch {
            // Network error or server down
            setIsAuthenticated(false);
        }
    }, []);

    const checkServerAvailability = useCallback(async () => {
        try {
            await fetch(apiUrl('/auth'), {
                method: 'GET',
                credentials: 'include'
            });

            // If we get any response (even 401), the server is running
            // Now validate the session
            validateSession();
        } catch {
            // Server is not running, redirect to the special route
            window.location.href = '/?to=screwyounoadminforyou';
        }
    }, [validateSession]); useEffect(() => {
        // First check if server is running, then validate session
        checkServerAvailability();
    }, [checkServerAvailability]);

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
