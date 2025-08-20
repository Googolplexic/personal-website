import { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const validateSession = useCallback(async (sessionId: string) => {
        try {
            const response = await fetch('http://localhost:3001/api/validate-session', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionId}`
                }
            });

            if (response.ok) {
                setSessionId(sessionId);
                setIsAuthenticated(true);
            } else {
                // Session is invalid, clear it
                localStorage.removeItem('adminSessionId');
                setSessionId(null);
                setIsAuthenticated(false);
            }
        } catch {
            // Network error or server down, clear session
            localStorage.removeItem('adminSessionId');
            setSessionId(null);
            setIsAuthenticated(false);
        }
    }, []);

    const checkServerAvailability = useCallback(async () => {
        try {
            await fetch('http://localhost:3001/api/validate-session', {
                method: 'GET'
            });

            // If we get any response (even 401), the server is running
            // Now check if already logged in and validate session
            const storedSessionId = localStorage.getItem('adminSessionId');
            if (storedSessionId) {
                // Validate the session with the server
                validateSession(storedSessionId);
            }
        } catch {
            // Server is not running, redirect to the special route
            window.location.href = '/?to=screwyounoadminforyou';
        }
    }, [validateSession]);

    useEffect(() => {
        // First check if server is running, then validate session
        checkServerAvailability();
    }, [checkServerAvailability]);

    const handleLogin = (newSessionId: string) => {
        setSessionId(newSessionId);
        setIsAuthenticated(true);
        localStorage.setItem('adminSessionId', newSessionId);
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3001/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionId}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        setIsAuthenticated(false);
        setSessionId(null);
        localStorage.removeItem('adminSessionId');
    };

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return <AdminDashboard sessionId={sessionId ?? ''} onLogout={handleLogout} />;
}
