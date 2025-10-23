import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';

const outDir = path.resolve('data');
const outFile = path.join(outDir, 'social_feeds.json');

async function fetchInstagram() {
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token) return { platform: 'instagram', items: [], error: 'missing_token' };
  try {
    // Basic IG Graph API: recent media; requires token with basic permissions
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
    const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}&limit=6`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`IG ${res.status}`);
    const json = await res.json();
    const items = (json.data || []).map(m => ({
      id: m.id,
      url: m.permalink,
      image: m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url,
      caption: m.caption || '',
      ts: m.timestamp,
      type: m.media_type
    }));
    return { platform: 'instagram', items };
  } catch (e) {
    return { platform: 'instagram', items: [], error: String(e) };
  }
}

async function fetchLinkedIn() {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) return { platform: 'linkedin', items: [], error: 'missing_token' };
  // Placeholder: LinkedIn API access requires org + permissions; keep structure for future
  return { platform: 'linkedin', items: [] };
}

async function main() {
  const results = await Promise.all([fetchInstagram(), fetchLinkedIn()]);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ updatedAt: new Date().toISOString(), feeds: results }, null, 2));
  console.log('Wrote', outFile);
}

main().catch(err => {
  console.error(err);
  process.exit(0);
});


