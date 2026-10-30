import { timingSafeEqual, randomUUID } from 'node:crypto';
const categories = ['프로젝트', '학습·실험', '자료·인사이트', '주간 회고'];
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  const password = process.env.ADMIN_PASSWORD;
  const ready = Boolean(url && token && password && password.length >= 12);
  if (req.method === 'GET' && req.query?.status === '1') return res.status(200).json({ ready });
  if (!ready) return res.status(503).json({ error: '온라인 저장소 설정이 필요합니다.' });
  async function redis(command) {
    const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error('storage');
    const data = await response.json();
    if (data.error) throw new Error('storage');
    return data.result;
  }
  try {
    if (req.method === 'GET') {
      const values = await redis(['HVALS', 'fieldnotes:entries']);
      return res.status(200).json({ entries: values.map(v => JSON.parse(v)).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)) });
    }
    if (!['POST','DELETE'].includes(req.method)) { res.setHeader('Allow','GET, POST, DELETE'); return res.status(405).json({ error: '지원하지 않는 요청입니다.' }); }
    const supplied = Buffer.from(req.headers.authorization?.replace(/^Bearer /, '') || '');
    const expected = Buffer.from(password);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return res.status(401).json({ error: '관리자 비밀번호를 확인해 주세요.' });
    const body = req.body;
    if (body?.action === 'verify') return res.status(200).json({ ok: true });
    if (!body || typeof body !== 'object') return res.status(400).json({ error: '잘못된 입력입니다.' });
    if (req.method === 'DELETE') {
      if (typeof body.id !== 'string' || body.id.length > 80) return res.status(400).json({ error: '기록 ID가 필요합니다.' });
      await redis(['HDEL','fieldnotes:entries',body.id]);
      return res.status(200).json({ ok:true });
    }
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 160 || typeof body.content !== 'string' || body.content.length > 50000 || !categories.includes(body.category) || !Array.isArray(body.tags) || body.tags.length > 8 || body.tags.some(t=> typeof t !== 'string' || t.length > 30) || !['진행 중','완료','기록'].includes(body.status) || typeof body.pinned !== 'boolean' || typeof body.link !== 'string' || body.link.length > 2000 || (body.link && !/^https?:\/\//i.test(body.link)) || (body.id && (typeof body.id !== 'string' || body.id.length > 80))) return res.status(400).json({ error: '제목, 분류, 본문과 링크 형식을 확인해 주세요.' });
    const id = body.id || randomUUID();
    const prior = await redis(['HGET','fieldnotes:entries',id]);
    const now = new Date().toISOString();
    const entry = { id, title:body.title.trim(), content:body.content, category:body.category, tags:body.tags, status:body.status, pinned:body.pinned, link:body.link, createdAt:prior ? JSON.parse(prior).createdAt : now, updatedAt:now };
    await redis(['HSET','fieldnotes:entries',id,JSON.stringify(entry)]);
    return res.status(200).json({ entry });
  } catch { return res.status(502).json({ error:'저장소에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.' }); }
}
