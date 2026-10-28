import { beforeAll, describe, expect, it } from 'vitest';

process.env.JWT_SECRET = 'test-secret';
const { generateJWT } = await import('../../api/auth-utils.js');
const { withIdempotency } = await import('../../api/idempotency-utils.js');
const { gitBlobSha } = await import('../../api/github-utils.js');

let cookie;
beforeAll(() => {
    cookie = `adminToken=${generateJWT({ admin: true })}`;
});

function call(handler, { method = 'POST', key, headers = {} } = {}) {
    return new Promise((resolve) => {
        const res = {
            statusCode: 200,
            headers: {},
            setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
            status(code) { this.statusCode = code; return this; },
            json(data) { resolve({ status: this.statusCode, data, headers: this.headers }); return this; },
        };
        const allHeaders = { host: 'www.colemanlai.com', cookie, ...headers, ...(key && { 'idempotency-key': key }) };
        handler({ method, url: '/api/thing', headers: allHeaders }, res);
    });
}

/** A handler that counts its runs and answers with the given status */
function counting(status = 200) {
    const handler = async (req, res) => {
        handler.runs += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        res.status(status).json({ run: handler.runs });
    };
    handler.runs = 0;
    return handler;
}

describe('withIdempotency', () => {
    it('runs a request once when the same key arrives twice at the same time', async () => {
        const inner = counting();
        const handler = withIdempotency(inner);
        const [first, second] = await Promise.all([
            call(handler, { key: 'double-click-0000001' }),
            call(handler, { key: 'double-click-0000001' }),
        ]);
        expect(inner.runs).toBe(1);
        expect(first.data).toEqual({ run: 1 });
        expect(second.data).toEqual({ run: 1 });
        expect(second.headers['idempotent-replayed']).toBe('true');
    });

    it('replays a success that already finished', async () => {
        const inner = counting();
        const handler = withIdempotency(inner);
        await call(handler, { key: 'retry-after-success-1' });
        const again = await call(handler, { key: 'retry-after-success-1' });
        expect(inner.runs).toBe(1);
        expect(again.status).toBe(200);
    });

    it('runs again after a failure, so a corrected retry goes through', async () => {
        const inner = counting(500);
        const handler = withIdempotency(inner);
        await call(handler, { key: 'retry-after-failure-1' });
        await call(handler, { key: 'retry-after-failure-1' });
        expect(inner.runs).toBe(2);
    });

    it('treats different keys, and requests without one, as separate', async () => {
        const inner = counting();
        const handler = withIdempotency(inner);
        await call(handler, { key: 'first-key-000000001' });
        await call(handler, { key: 'second-key-00000001' });
        await call(handler);
        await call(handler);
        expect(inner.runs).toBe(4);
    });

    it('never replays to a request without a valid session', async () => {
        const inner = counting();
        const handler = withIdempotency(inner);
        await call(handler, { key: 'signed-in-only-0001' });
        const anonymous = await call(handler, { key: 'signed-in-only-0001', headers: { cookie: '' } });
        expect(anonymous.status).toBe(401);
        expect(anonymous.data).toEqual({ error: 'Authentication required' });
    });
});

describe('gitBlobSha', () => {
    it('matches `git hash-object`', () => {
        expect(gitBlobSha(Buffer.from('hello\n'))).toBe('ce013625030ba8dba906f756967f9e9ca394464a');
    });
});
