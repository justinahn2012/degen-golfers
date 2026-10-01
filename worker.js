/* Degen Golfers '26 - tiny server: serves the game files, plus a shared arcade leaderboard at /api/scores (stored in Workers KV). */
const COURSES = { jp: 1, ws: 1, nc: 1, cda: 1, ko: 1 };
const KEEP_PER_COURSE = 25;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const rank = (a, b) => a.tp - b.tp || a.s - b.s || a.t - b.t;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/scores') {
      if (!env.SCORES) return json({ err: 'leaderboard storage is not connected' }, 503);
      if (req.method === 'GET') return json({ board: (await env.SCORES.get('board', { type: 'json' })) || [] });
      if (req.method === 'POST') {
        let e; try { e = await req.json(); } catch (x) { return json({ err: 'bad request' }, 400); }
        const i = String(e.i || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 3).padEnd(3, ' ');
        const g = String(e.g || '').replace(/[<>&"]/g, '').trim().slice(0, 24);
        const c = String(e.c || ''), s = Math.round(+e.s), par = Math.round(+e.par), tp = s - par;
        if (!i.trim() || !g || !COURSES[c] || !(s >= 20 && s <= 220) || !(par >= 27 && par <= 80)) return json({ err: 'invalid score' }, 400);
        const rid = String(e.rid || '').slice(0, 48);
        const b = (await env.SCORES.get('board', { type: 'json' })) || [];
        if (rid && b.some(r => r.rid === rid)) return json({ board: b, dup: true });
        const row = { i, g, c, cn: String(e.cn || '').slice(0, 24), s, par, tp, t: Date.now(), rid };
        b.push(row); b.sort(rank);
        const n = {}, keep = b.filter(r => (n[r.c] = (n[r.c] || 0) + 1) <= KEEP_PER_COURSE);
        await env.SCORES.put('board', JSON.stringify(keep));
        return json({ board: keep, rank: keep.indexOf(row) + 1 });
      }
      return json({ err: 'method not allowed' }, 405);
    }
    return env.ASSETS.fetch(req);
  }
};
