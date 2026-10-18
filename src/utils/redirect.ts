export const RICK_ROLL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

/** Sites `?to=` may send visitors to, including their subdomains */
const ALLOWED_HOSTS = ['colemanlai.com', 'github.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'youtu.be'];

/** The `?to=` target when it's a web link to an allowed site; anything else gets the Rick Roll. */
export function redirectTarget(to: string): string {
    let url: URL;
    try {
        url = new URL(to);
    } catch {
        return RICK_ROLL;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return RICK_ROLL;
    const host = url.hostname.toLowerCase();
    const allowed = ALLOWED_HOSTS.some((site) => host === site || host.endsWith(`.${site}`));
    return allowed ? url.href : RICK_ROLL;
}
