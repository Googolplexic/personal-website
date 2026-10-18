import {
    checkAdminPassword,
    generateJWT,
    verifyJWT,
    createAuthCookie,
    createLogoutCookie,
    parseCookies,
    isSameOrigin,
} from './auth-utils.js';

// Failed logins per IP. This lives in the function instance, so it resets on a cold start
// and isn't shared between instances; it slows down guessing rather than stopping it outright.
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const FAILURE_DELAY_MS = 1000;
const failedLogins = new Map();

function clientIp(req) {
    return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

function recentFailures(ip) {
    const entry = failedLogins.get(ip);
    if (!entry) return null;
    if (Date.now() - entry.first > FAILURE_WINDOW_MS) {
        failedLogins.delete(ip);
        return null;
    }
    return entry;
}

function recordFailure(ip) {
    const entry = recentFailures(ip) ?? { count: 0, first: Date.now() };
    entry.count++;
    failedLogins.set(ip, entry);
}

// Vercel serverless function for admin authentication
export default async function handler(req, res) {
    if (!isSameOrigin(req)) {
        return res.status(403).json({ error: 'Cross-origin requests are not allowed' });
    }

    if (req.method === 'POST') {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required',
            });
        }

        const ip = clientIp(req);
        const failures = recentFailures(ip);
        if (failures && failures.count >= MAX_FAILURES) {
            res.setHeader('Retry-After', String(Math.ceil((failures.first + FAILURE_WINDOW_MS - Date.now()) / 1000)));
            return res.status(429).json({
                success: false,
                error: 'Too many attempts. Try again later.',
            });
        }

        try {
            const isValidPassword = await checkAdminPassword(password);

            if (isValidPassword === null) {
                return res.status(500).json({
                    success: false,
                    error: 'Server configuration error',
                });
            }

            if (isValidPassword) {
                failedLogins.delete(ip);
                // Generate JWT token
                const payload = {
                    admin: true,
                    timestamp: Date.now()
                };
                const token = generateJWT(payload);

                // Set httpOnly cookie
                res.setHeader('Set-Cookie', createAuthCookie(token));

                return res.status(200).json({
                    success: true,
                    message: 'Authentication successful',
                });
            } else {
                recordFailure(ip);
                await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
                return res.status(401).json({
                    success: false,
                    error: 'Invalid password',
                });
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return res.status(500).json({
                success: false,
                error: 'Authentication failed',
            });
        }
    }

    if (req.method === 'GET') {
        try {
            // Parse cookies from request
            const cookies = parseCookies(req.headers.cookie);
            const token = cookies.adminToken;

            if (!token) {
                return res.status(401).json({ valid: false, error: 'No authentication token' });
            }

            // Verify JWT token
            const decoded = verifyJWT(token);
            
            if (decoded && decoded.admin) {
                return res.status(200).json({ 
                    valid: true,
                    admin: true,
                    timestamp: decoded.timestamp 
                });
            } else {
                return res.status(401).json({ valid: false, error: 'Invalid token' });
            }
        } catch (error) {
            console.error('Token validation error:', error);
            return res.status(401).json({ valid: false, error: 'Token validation failed' });
        }
    }

    if (req.method === 'DELETE') {
        // Logout - clear the cookie
        res.setHeader('Set-Cookie', createLogoutCookie());
        return res.status(200).json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
