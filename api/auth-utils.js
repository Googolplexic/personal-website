import bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    return secret;
}

/**
 * Check a login attempt. Prefers ADMIN_PASSWORD_HASH (made with scripts/hash-password.mjs);
 * falls back to comparing against a plain ADMIN_PASSWORD. Returns null when neither is set.
 */
export async function checkAdminPassword(password) {
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (hash) return bcrypt.compare(password, hash);

    const plain = process.env.ADMIN_PASSWORD;
    if (!plain) return null;
    const given = Buffer.from(String(password));
    const expected = Buffer.from(plain);
    return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Browsers send Origin on cross-site requests; a host that doesn't match ours means another site sent it.
 */
export function isSameOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return true;
    try {
        return new URL(origin).host === req.headers.host;
    } catch {
        return false;
    }
}

/**
 * Responds with 403 or 401 and returns false unless the request comes from this site with a valid admin cookie.
 */
export function requireAdmin(req, res) {
    if (!isSameOrigin(req)) {
        res.status(403).json({ error: 'Cross-origin requests are not allowed' });
        return false;
    }
    const token = parseCookies(req.headers.cookie).adminToken;
    const decoded = token ? verifyJWT(token) : null;
    if (!decoded?.admin) {
        res.status(401).json({ error: 'Authentication required' });
        return false;
    }
    return true;
}

/**
 * Generate a JWT token
 */
export function generateJWT(payload) {
    const secret = getJwtSecret();
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign(payload, secret, {
        expiresIn: '24h',
        issuer: 'personal-website-admin',
        audience: 'personal-website-admin'
    });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token) {
    const secret = getJwtSecret();
    if (!secret) return null;
    try {
        return jwt.verify(token, secret, {
            issuer: 'personal-website-admin',
            audience: 'personal-website-admin'
        });
    } catch (error) {
        return null;
    }
}

/**
 * Create httpOnly cookie string
 */
export function createAuthCookie(token) {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return `adminToken=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge / 1000}; Path=/`;
}

/**
 * Create cookie deletion string
 */
export function createLogoutCookie() {
    return `adminToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;
}

/**
 * Parse cookies from request headers
 */
export function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const trimmed = cookie.trim();
            const eq = trimmed.indexOf('=');
            if (eq <= 0) return;
            const name = trimmed.slice(0, eq);
            const value = trimmed.slice(eq + 1);
            if (name && value) {
                cookies[name] = decodeURIComponent(value);
            }
        });
    }
    return cookies;
}
