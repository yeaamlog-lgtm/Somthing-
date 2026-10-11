import http from 'node:http';
import crypto from 'node:crypto';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized:false } : undefined });
const PORT = Number(process.env.PORT || 8787);
const ORIGIN = process.env.APP_ORIGIN || 'http://localhost:8088';
const COOKIE_SAMESITE = ORIGIN.startsWith('https://') ? 'None; Secure' : 'Lax';
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);
const MAX_ROOM_PLAYERS = 8;
const clients = new Map();

const json = (res,status,body,extra={}) => { res.writeHead(status, {'Content-Type':'application/json','Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Credentials':'true','Vary':'Origin',...extra}); res.end(JSON.stringify(body)); };
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const passwordHash = (password,salt=crypto.randomBytes(16).toString('hex')) => `${salt}:${crypto.scryptSync(password,salt,64).toString('hex')}`;
const passwordCheck = (password,stored) => { try { const [salt,h]=stored.split(':'); const x=crypto.scryptSync(password,salt,64).toString('hex'); return crypto.timingSafeEqual(Buffer.from(h,'hex'),Buffer.from(x,'hex')); } catch { return false; } };
const token = () => crypto.randomBytes(32).toString('base64url');
const roomCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();
async function body(req){let s='';for await(const c of req)s+=c;return s?JSON.parse(s):{};}
async function auth(req){const m=(req.headers.cookie||'').match(/fm_session=([^;]+)/);if(!m)return null;const r=await pool.query('SELECT u.id,u.email,u.display_name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()',[hash(m[1])]);return r.rows[0]||null;}
function broadcast(roomId,event){for(const res of clients.get(roomId)||[]){try{res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);}catch{}}}
function route(req){return new URL(req.url,'http://localhost').pathname;}
async function roomForUser(roomId,userId){const r=await pool.query('SELECT r.*,rp.club_id rp_club_id FROM rooms r JOIN room_players rp ON rp.room_id=r.id WHERE r.id=$1 AND rp.user_id=$2',[roomId,userId]);return r.rows[0]||null;}
async function roomView(roomId){const r=await pool.query(`SELECT r.id,r.code,r.name,r.status,r.world,r.version,r.updated_at,
 json_agg(json_build_object('userId',rp.user_id,'clubId',rp.club_id,'isAi',rp.is_ai,'displayName',COALESCE(u.display_name,'AI Manager'))) AS players
 FROM rooms r JOIN room_players rp ON rp.room_id=r.id LEFT JOIN users u ON u.id=rp.user_id WHERE r.id=$1 GROUP BY r.id`,[roomId]);return r.rows[0]||null;}
function initialWorld(){return {season:2026,matchday:1,phase:'preseason',clubs:{},news:[],fixtures:[],results:[],transfers:[],leagueTables:{},managers:{},aiManagers:[],serverTick:0};}
function mutateWorld(world,action,user){const w=structuredClone(world||initialWorld());const p=action.payload||{};switch(action.type){
 case 'SET_CLUB': w.managers ||= {}; w.managers[user.id]={userId:user.id,clubId:String(p.clubId||''),displayName:user.display_name}; return w;
 case 'SET_TACTICS': w.tactics ||= {}; w.tactics[String(p.clubId||'')]=p.tactics||{}; return w;
 case 'SET_LINEUP': w.lineups ||= {}; w.lineups[String(p.clubId||'')]=Array.isArray(p.playerIds)?p.playerIds.slice(0,11):[]; return w;
 case 'TRANSFER_OFFER': w.transferOffers ||= []; w.transferOffers.push({...p,fromUserId:user.id,createdAt:new Date().toISOString()}); return w;
 case 'TRANSFER_CANCEL': w.transferOffers=(w.transferOffers||[]).filter(x=>x.id!==p.id); return w;
 case 'ADVANCE_DAY': w.matchday=Number(w.matchday||1)+1; w.serverTick=Number(w.serverTick||0)+1; w.lastAdvanceBy=user.id; w.lastAdvanceAt=new Date().toISOString(); return w;
 case 'POST_NEWS': w.news=Array.isArray(w.news)?w.news:[]; w.news.unshift({...p,author:user.display_name,at:new Date().toISOString()}); w.news=w.news.slice(0,100); return w;
 default: throw new Error('Unsupported multiplayer action');
}}
async function signIn(res,u){const t=token();await pool.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+($3||\' days\')::interval)',[hash(t),u.id,SESSION_DAYS]);return json(res,200,{user:{id:u.id,email:u.email,displayName:u.display_name}},{'Set-Cookie':`fm_session=${t}; Max-Age=${SESSION_DAYS*86400}; Path=/; HttpOnly; SameSite=${COOKIE_SAMESITE}`});}
async function handler(req,res){
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Credentials':'true','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'});return res.end();}
 try{const p=route(req);
  if(p==='/api/health')return json(res,200,{ok:true,service:'club-empire-online',time:new Date().toISOString()});
  if(p==='/api/auth/signup'&&req.method==='POST'){const b=await body(req),email=String(b.email||'').trim().toLowerCase(),password=String(b.password||''),name=String(b.displayName||'').trim().slice(0,40);if(!/^\S+@\S+\.\S+$/.test(email)||password.length<8||!name)return json(res,400,{error:'Valid email, 8+ character password and display name required'});try{const r=await pool.query('INSERT INTO users(email,password_hash,display_name) VALUES($1,$2,$3) RETURNING id,email,display_name',[email,passwordHash(password),name]);return await signIn(res,r.rows[0]);}catch{return json(res,409,{error:'Email already registered'});}}
  if(p==='/api/auth/signin'&&req.method==='POST'){const b=await body(req),r=await pool.query('SELECT id,email,display_name,password_hash FROM users WHERE email=$1',[String(b.email||'').trim().toLowerCase()]);if(!r.rows[0]||!passwordCheck(String(b.password||''),r.rows[0].password_hash))return json(res,401,{error:'Invalid email or password'});return await signIn(res,r.rows[0]);}
  if(p==='/api/auth/signout'&&req.method==='POST'){const m=(req.headers.cookie||'').match(/fm_session=([^;]+)/);if(m)await pool.query('DELETE FROM sessions WHERE token_hash=$1',[hash(m[1])]);return json(res,200,{ok:true},{'Set-Cookie':'fm_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax'});}
  const user=await auth(req);if(!user)return json(res,401,{error:'Sign in required'});
  if(p==='/api/auth/me')return json(res,200,{user});
  if(p==='/api/rooms'&&req.method==='POST'){const b=await body(req),name=String(b.name||`${user.display_name}'s League`).slice(0,60);let code=roomCode();for(let i=0;i<5;i++){try{const r=await pool.query('INSERT INTO rooms(code,name,host_user_id,world) VALUES($1,$2,$3,$4) RETURNING id,code,name,status,version',[code,name,user.id,JSON.stringify(initialWorld())]);await pool.query('INSERT INTO room_players(room_id,user_id,club_id,is_ai) VALUES($1,$2,$3,false)',[r.rows[0].id,user.id,b.clubId||null]);return json(res,201,{room:await roomView(r.rows[0].id)});}catch(e){if(e.code!=='23505')throw e;code=roomCode();}}return json(res,500,{error:'Could not create room'});}
  const codeMatch=p.match(/^\/api\/rooms\/code\/([^/]+)$/);if(codeMatch&&req.method==='GET'){const r=await pool.query('SELECT id FROM rooms WHERE upper(code)=upper($1)',[codeMatch[1]]);if(!r.rows[0])return json(res,404,{error:'Room code not found'});return json(res,200,{room:await roomView(r.rows[0].id)});}
  const rm=p.match(/^\/api\/rooms\/([^/]+)$/);const ev=p.match(/^\/api\/rooms\/([^/]+)\/events$/);const action=p.match(/^\/api\/rooms\/([^/]+)\/actions$/);
  if(ev&&req.method==='GET'){const member=await roomForUser(ev[1],user.id);if(!member)return json(res,403,{error:'Not in room'});res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Credentials':'true'});res.write('event: ready\ndata: {}\n\n');let set=clients.get(ev[1]);if(!set)clients.set(ev[1],set=new Set());set.add(res);const hb=setInterval(()=>{try{res.write(': ping\n\n')}catch{}},15000);req.on('close',()=>{clearInterval(hb);set.delete(res);});return;}
  if(rm&&req.method==='GET'){const member=await roomForUser(rm[1],user.id);if(!member)return json(res,403,{error:'Not in room'});return json(res,200,{room:await roomView(rm[1])});}
  if(rm&&req.method==='POST'){const b=await body(req);const room=await roomForUser(rm[1],user.id);if(!room){const raw=await pool.query('SELECT id FROM rooms WHERE upper(code)=upper($1)',[rm[1]]);if(!raw.rows[0])return json(res,404,{error:'Room not found'});const count=await pool.query('SELECT count(*)::int n FROM room_players WHERE room_id=$1',[raw.rows[0].id]);if(count.rows[0].n>=MAX_ROOM_PLAYERS)return json(res,409,{error:'Room is full'});await pool.query('INSERT INTO room_players(room_id,user_id,club_id,is_ai) VALUES($1,$2,$3,false) ON CONFLICT(room_id,user_id) DO UPDATE SET club_id=EXCLUDED.club_id,is_ai=false',[raw.rows[0].id,user.id,b.clubId||null]);broadcast(raw.rows[0].id,{type:'room:player-joined',userId:user.id,displayName:user.display_name});return json(res,200,{room:await roomView(raw.rows[0].id)});}return json(res,409,{error:'Already in room'});}
  if(action&&req.method==='POST'){const room=await roomForUser(action[1],user.id);if(!room)return json(res,403,{error:'Not in room'});const b=await body(req);const expected=Number(b.version);if(!Number.isInteger(expected))return json(res,400,{error:'version required'});const allowed=['SET_CLUB','SET_TACTICS','SET_LINEUP','TRANSFER_OFFER','TRANSFER_CANCEL','ADVANCE_DAY','POST_NEWS'];if(!allowed.includes(b.type))return json(res,400,{error:'Unsupported action'});let world;try{world=mutateWorld(room.world,b,user);}catch(e){return json(res,400,{error:e.message});}const r=await pool.query('UPDATE rooms SET world=$1,version=version+1,updated_at=now() WHERE id=$2 AND version=$3 RETURNING version',[JSON.stringify(world),room.id,expected]);if(!r.rows[0])return json(res,409,{error:'WORLD_CONFLICT',message:'Another manager changed the world. Refresh and retry.'});await pool.query('INSERT INTO world_actions(room_id,user_id,action_type,payload,version) VALUES($1,$2,$3,$4,$5)',[room.id,user.id,b.type,JSON.stringify(b.payload||{}),r.rows[0].version]);broadcast(room.id,{type:'world:action',action:b.type,version:r.rows[0].version,by:user.id});return json(res,200,{version:r.rows[0].version,world});}
  return json(res,404,{error:'Not found'});
 }catch(e){console.error(e);return json(res,500,{error:'Server error'});}}
http.createServer(handler).listen(PORT,()=>console.log(`Online backend listening on http://localhost:${PORT}`));
