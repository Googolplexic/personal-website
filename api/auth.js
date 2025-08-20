// Vercel serverless function for admin authentication
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { password } = req.body;
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (password === adminPassword) {
            // Generate a simple session token
            const sessionToken = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');

            return res.status(200).json({
                success: true,
                sessionId: sessionToken,
            });
        } else {
            return res.status(401).json({
                success: false,
                error: 'Invalid password',
            });
        }
    }

    if (req.method === 'GET') {
        // Simple session validation - in production you'd want better validation
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return res.status(200).json({ valid: true });
        } else {
            return res.status(401).json({ valid: false });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
