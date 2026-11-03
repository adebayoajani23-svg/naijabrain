const DEFAULT_CONFIG = { sponsors: [], ads: [], affiliates: [], premium: [] };
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
async function sign(payload, secret) {
  const enc = new TextEncoder(), key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const body = btoa(String.fromCharCode(...enc.encode(JSON.stringify(payload)))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
  const signature = btoa(String.fromCharCode(...sig)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  return body+"."+signature;
}
async function verify(token, secret) {
  try {
    const [body, signature] = token.split(".");
    const enc = new TextEncoder(), key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["verify"]);
    const raw = Uint8Array.from(atob(signature.replace(/-/g,"+").replace(/_/g,"/")), c=>c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", key, raw, enc.encode(body));
    if(!ok) return false;
    const payload = JSON.parse(atob(body.replace(/-/g,"+").replace(/_/g,"/")));
    return payload.exp > Math.floor(Date.now()/1000);
  } catch { return false; }
}
async function readConfig(env) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind("site_config").first();
  if(!row) return DEFAULT_CONFIG;
  try { const parsed = JSON.parse(row.value); return sanitize(parsed); } catch { return DEFAULT_CONFIG; }
}
function sanitize(input) {
  const allowed = ["sponsors","ads","affiliates","premium"], out = {};
  for(const k of allowed) out[k] = Array.isArray(input?.[k]) ? input[k].slice(0,100).map(x => {
    const clean = {};
    for(const field of ["name","title","description","button","label","price","url"]) if(typeof x?.[field] === "string") clean[field] = x[field].slice(0,1000);
    clean.active = x?.active === true;
    return clean;
  }) : [];
  return out;
}
async function authorized(request, env) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i,"");
  return !!(token && env.SESSION_SECRET && await verify(token, env.SESSION_SECRET));
}
export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  if(url.pathname === "/api/public-config" && request.method === "GET") {
    try { return json(await readConfig(env)); } catch { return json({error:"Database is not ready. Apply schema.sql and configure the D1 binding."},503); }
  }
  if(url.pathname === "/api/admin/login" && request.method === "POST") {
    if(!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({error:"Admin secrets are not configured in Cloudflare."},503);
    let body; try { body = await request.json(); } catch { return json({error:"Invalid request."},400); }
    const supplied = String(body.password || "");
    if(supplied.length > 300 || supplied !== env.ADMIN_PASSWORD) return json({error:"Incorrect admin password."},401);
    const token = await sign({sub:"arena-admin",exp:Math.floor(Date.now()/1000)+8*60*60},env.SESSION_SECRET);
    return json({token});
  }
  if(url.pathname.startsWith("/api/admin/")) {
    if(!await authorized(request,env)) return json({error:"Your session expired. Please sign in again."},401);
    if(url.pathname === "/api/admin/config" && request.method === "GET") {
      try { return json(await readConfig(env)); } catch { return json({error:"Database is not ready."},503); }
    }
    if(url.pathname === "/api/admin/config" && request.method === "PUT") {
      let body; try { body = sanitize(await request.json()); } catch { return json({error:"Invalid configuration."},400); }
      try {
        await env.DB.prepare("INSERT INTO settings (key,value,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')").bind("site_config",JSON.stringify(body)).run();
        return json({ok:true});
      } catch { return json({error:"Could not save. Check your D1 database binding and schema."},503); }
    }
    return json({error:"Not found."},404);
  }
  return env.ASSETS.fetch(request);
 }
};