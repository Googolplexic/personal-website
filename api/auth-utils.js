import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    return secret;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
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

/**
 * Get stored password hash (since we can't hash the env variable each time)
 * In a real app, this would come from a database
 */
export async function getStoredPasswordHash() {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        return null;
    }
    
    // For demo purposes, we'll hash the env password on the fly
    // In production, you'd store the hash in a database
    return await hashPassword(adminPassword);
}
