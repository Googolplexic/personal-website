import { useState } from 'react';
import { apiUrl } from '../../config/api';
import { Heading, Text, Button } from '../ui/base';

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
                credentials: 'include', // Important for cookies
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(); // No need to pass sessionId anymore
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
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <Heading level={2} className="mt-6 text-center">
                        Admin Login
                    </Heading>
                    <Text className="mt-2 text-center text-sm text-[var(--color-text-tertiary)]">
                        Enter your admin password to manage content
                    </Text>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="admin-input"
                            placeholder="Admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <Text className="text-red-400 text-sm text-center">
                            {error}
                        </Text>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2.5 px-4 text-sm font-medium tracking-wide rounded-md bg-[var(--color-accent)] text-[var(--color-bg-primary)] hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            {isLoading ? 'Logging in...' : 'Sign in'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
