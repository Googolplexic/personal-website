import { useState } from 'react';
import { apiUrl } from '../../config/api';

interface AdminLoginProps {
    onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(apiUrl('/auth'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                onLogin();
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            setError('Failed to connect to admin server');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page flex min-h-screen items-center">
            <form className="w-full max-w-sm mx-auto" onSubmit={handleSubmit}>
                <p className="gallery-overline mb-3">Site</p>
                <h1 className="admin-title mb-8">Admin</h1>
                <label htmlFor="password" className="gallery-overline block mb-2">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="admin-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
                {error && (
                    <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {error}
                    </p>
                )}
                <div className="mt-8">
                    <button type="submit" className="admin-link" disabled={isLoading}>
                        {isLoading ? 'Signing in' : 'Sign in'}
                    </button>
                </div>
            </form>
        </div>
    );
}
