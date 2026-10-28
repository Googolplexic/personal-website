import { requireAdmin } from './auth-utils.js';

/*
 * A POST or DELETE that carries an Idempotency-Key runs once: a duplicate sent while the
 * first is still running waits for it and gets the same answer, and a successful answer is
 * replayed for ten minutes. Failures aren't kept, so fixing the input and retrying works.
 *
 * Kept in the function's memory, so this covers double submits and retries that reach the
 * same warm instance. The GitHub writes underneath also skip unchanged content.
 */

const KEY_RE = /^[A-Za-z0-9_-]{16,128}$/;
const TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 200;
const responses = new Map();

/** Stands in for res, keeping the status and body so they can be sent to every duplicate. */
function recordInto(res) {
    const result = { status: 200, body: undefined };
    const recorder = {
        setHeader: (name, value) => res.setHeader(name, value),
        status(code) { result.status = code; return recorder; },
        json(body) { result.body = body; return recorder; },
        end() { return recorder; },
    };
    return { recorder, result };
}

export function withIdempotency(handler) {
    return async function idempotentHandler(req, res) {
        const key = req.headers['idempotency-key'];
        if ((req.method !== 'POST' && req.method !== 'DELETE') || typeof key !== 'string' || !KEY_RE.test(key)) {
            return handler(req, res);
        }
        // Checked before any replay, so a stored answer only ever goes to a signed-in admin
        if (!requireAdmin(req, res)) return;

        const now = Date.now();
        for (const [id, entry] of responses) if (entry.expires < now) responses.delete(id);

        const id = `${req.method} ${req.url ?? ''} ${key}`;
        let entry = responses.get(id);
        if (entry) {
            res.setHeader('Idempotent-Replayed', 'true');
        } else {
            const { recorder, result } = recordInto(res);
            entry = { expires: now + TTL_MS, result: Promise.resolve(handler(req, recorder)).then(() => result) };
            responses.set(id, entry);
            if (responses.size > MAX_ENTRIES) responses.delete(responses.keys().next().value);
        }

        let result;
        try {
            result = await entry.result;
        } catch (error) {
            responses.delete(id);
            throw error;
        }
        if (result.status >= 300) responses.delete(id);
        return res.status(result.status).json(result.body);
    };
}
