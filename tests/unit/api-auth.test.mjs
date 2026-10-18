import bcrypt from 'bcryptjs';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.JWT_SECRET = 'test-secret';
const { default: auth } = await import('../../api/auth.js');
const { default: content } = await import('../../api/content.js');
const { default: upload } = await import('../../api/upload-image.js');

/** Calls a Vercel handler with a minimal req/res pair */
function call(handler, { method = 'GET', headers = {}, body, query = {} } = {}) {
    return new Promise((resolve) => {
        const res = {
            statusCode: 200,
            headers: {},
            setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
            status(code) { this.statusCode = code; return this; },
            json(data) { resolve({ status: this.statusCode, data, headers: this.headers }); return this; },
            end() { resolve({ status: this.statusCode, headers: this.headers }); return this; },
        };
        handler({ method, headers: { host: 'www.colemanlai.com', ...headers }, body, query, socket: {} }, res);
    });
}

const fromSite = { origin: 'https://www.colemanlai.com' };
const fromElsewhere = { origin: 'https://evil.example' };

/** Each test gets its own IP so the failure counts don't leak between tests */
let ipCounter = 0;
const newIp = () => `10.0.0.${++ipCounter}`;

function login(password, ip, headers = {}) {
    return call(auth, { method: 'POST', headers: { 'x-forwarded-for': ip, ...headers }, body: { password } });
}

/** A wrong password waits a second before answering */
async function failedLogin(ip) {
    const pending = login('wrong', ip);
    await vi.advanceTimersByTimeAsync(1000);
    return pending;
}

beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'correct horse';
    delete process.env.ADMIN_PASSWORD_HASH;
});

describe('login', () => {
    it('logs in with the right password and sets an httpOnly cookie', async () => {
        const res = await login('correct horse', newIp(), fromSite);
        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toMatch(/^adminToken=.+HttpOnly; Secure; SameSite=Strict/);
    });

    it('refuses logins sent from another site', async () => {
        expect((await login('correct horse', newIp(), fromElsewhere)).status).toBe(403);
    });

    it('prefers ADMIN_PASSWORD_HASH over the plain password', async () => {
        process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('hashed pw', 4);
        expect((await login('hashed pw', newIp())).status).toBe(200);
        expect((await login('correct horse', newIp())).status).toBe(401);
    });

    it('reports a configuration error when no password is set', async () => {
        delete process.env.ADMIN_PASSWORD;
        expect((await login('anything', newIp())).status).toBe(500);
    });
});

describe('failed login limit', () => {
    beforeEach(() => { vi.useFakeTimers({ toFake: ['setTimeout', 'Date'] }); });
    afterEach(() => { vi.useRealTimers(); });

    it('blocks an IP after 5 failures, for 15 minutes', async () => {
        const ip = newIp();
        for (let i = 0; i < 5; i++) expect((await failedLogin(ip)).status).toBe(401);

        const blocked = await login('correct horse', ip);
        expect(blocked.status).toBe(429);
        expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
        expect((await login('correct horse', newIp())).status).toBe(200);

        vi.advanceTimersByTime(15 * 60 * 1000 + 1);
        expect((await login('correct horse', ip)).status).toBe(200);
    });

    it('clears the count after a successful login', async () => {
        const ip = newIp();
        for (let i = 0; i < 4; i++) await failedLogin(ip);
        expect((await login('correct horse', ip)).status).toBe(200);
        for (let i = 0; i < 4; i++) await failedLogin(ip);
        expect((await login('correct horse', ip)).status).toBe(200);
    });
});

describe('admin API', () => {
    let cookie;
    beforeAll(async () => {
        process.env.ADMIN_PASSWORD = 'correct horse';
        cookie = (await login('correct horse', newIp())).headers['set-cookie'].split(';')[0];
    });

    it('accepts the session cookie', async () => {
        expect((await call(auth, { headers: { cookie } })).data.valid).toBe(true);
    });

    it('rejects requests without a cookie', async () => {
        expect((await call(content, { query: { path: 'project/torgal', file: 'description.md' } })).status).toBe(401);
    });

    it('rejects a forged cookie', async () => {
        expect((await call(content, { headers: { cookie: 'adminToken=forged' } })).status).toBe(401);
    });

    it('rejects requests from another site even with the cookie', async () => {
        expect((await call(content, { headers: { ...fromElsewhere, cookie } })).status).toBe(403);
    });

    it('rejects uploads over 3 MB', async () => {
        const imageData = 'data:image/png;base64,' + Buffer.alloc(3 * 1024 * 1024 + 10).toString('base64');
        const res = await call(upload, { method: 'POST', headers: { cookie }, body: { type: 'project', slug: 'torgal', imageData, fileName: 'x.png' } });
        expect(res.status).toBe(413);
    });
});
