import { 
    verifyPassword, 
    generateJWT, 
    verifyJWT, 
    createAuthCookie, 
    createLogoutCookie, 
    parseCookies,
    getStoredPasswordHash 
} from './auth-utils.js';

// Vercel serverless function for admin authentication
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required',
            });
        }

        try {
            // Get the stored password hash
            const storedHash = await getStoredPasswordHash();
            
            if (!storedHash) {
                return res.status(500).json({
                    success: false,
                    error: 'Server configuration error',
                });
            }

            // Verify the password against the hash
            const isValidPassword = await verifyPassword(password, storedHash);

            if (isValidPassword) {
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
