/* Club Empire Online — integrated auth and shared-world client */
(() => {
  const configuredApi = localStorage.getItem('CLUB_EMPIRE_API') || localStorage.getItem('FM_ONLINE_API');
  const isLocalGame = ['localhost', '127.0.0.1'].includes(location.hostname);
  const API = (configuredApi || (isLocalGame && location.port === '8088'
    ? `http://${location.hostname}:8787/api`
    : '/api')).replace(/\/$/, '');
  let room=null, source=null, timer=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  async function call(path,opts={}){const r=await fetch(API+path,{credentials:'include',headers:{'Content-Type':'application/json',...(opts.headers||{})},...opts});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||d.message||'Network error');return d;}
  function panel(){let el=document.getElementById('online-panel');if(el)return el;el=document.createElement('div');el.id='online-panel';el.innerHTML='<div class="online-card"><button class="online-x">×</button><div class="online-kicker">CLUB EMPIRE ONLINE</div><h2>Build your football empire</h2><div id="online-body"></div></div>';document.body.appendChild(el);el.querySelector('.online-x').onclick=close;return el;}
  const body=html=>panel().querySelector('#online-body').innerHTML=html;
  function open(){panel();me();}
  async function me(){try{const d=await call('/auth/me');body(`<div class="online-user">Signed in as <b>${esc(d.user.displayName)}</b></div><button onclick="FMOnline.create()">CREATE WORLD</button><button class="secondary" onclick="FMOnline.joinPrompt()">JOIN FRIENDS</button><button class="ghost" onclick="FMOnline.signout()">Sign out</button>`)}catch{body(`<input id="on-name" placeholder="Display name"><input id="on-email" placeholder="Email" type="email"><input id="on-pass" placeholder="Password (8+ chars)" type="password"><div class="online-row"><button onclick="FMOnline.signup()">CREATE ACCOUNT</button><button class="secondary" onclick="FMOnline.signin()">SIGN IN</button></div><p class="online-hint">Accounts and worlds are stored on the online server.</p>`);}}
  async function signup(){try{await call('/auth/signup',{method:'POST',body:JSON.stringify({displayName:on('on-name').value,email:on('on-email').value,password:on('on-pass').value})});me();}catch(e){alert(e.message)}}
  async function signin(){try{await call('/auth/signin',{method:'POST',body:JSON.stringify({email:on('on-email').value,password:on('on-pass').value})});me();}catch(e){alert(e.message)}}
  const on=id=>document.getElementById(id);
  async function create(){try{const d=await call('/rooms',{method:'POST',body:JSON.stringify({name:'Friends Football World'})});room=d.room;renderRoom();connect();}catch(e){alert(e.message)}}
  async function joinPrompt(){const code=prompt('Enter your 8-character Room Code');if(!code)return;try{const preview=await call('/rooms/code/'+encodeURIComponent(code.trim().toUpperCase()));const d=await call('/rooms/'+preview.room.id,{method:'POST',body:JSON.stringify({})});room=d.room;renderRoom();connect();}catch(e){alert(e.message)}}
  function renderRoom(){const ps=room.players||[];body(`<div class="room-code">ROOM <strong>${esc(room.code)}</strong></div><p>Send this code to your friends. Everyone controls a manager inside the same persistent world.</p><div class="room-list">${ps.map(p=>`<div>● ${esc(p.displayName)} ${p.isAi?'· AI':''}${p.clubId?' · '+esc(p.clubId):''}</div>`).join('')}</div><div class="online-row"><button onclick="FMOnline.sync()">REFRESH WORLD</button><button class="secondary" onclick="FMOnline.advance()">ADVANCE WORLD</button></div><p class="online-hint">Server version: ${room.version}. Conflicting changes are rejected instead of silently overwriting a friend's work.</p>`)}
  async function sync(){if(!room)return;const d=await call('/rooms/'+room.id);room=d.room;renderRoom();}
  async function action(type,payload={}){if(!room)throw Error('Join a world first');const d=await call('/rooms/'+room.id+'/actions',{method:'POST',body:JSON.stringify({type,payload,version:Number(room.version)})});room.world=d.world;room.version=d.version;renderRoom();return d;}
  async function advance(){try{await action('ADVANCE_DAY',{});}catch(e){if(e.message.includes('WORLD_CONFLICT'))await sync();else alert(e.message)}}
  function connect(){if(source)source.close();source=new EventSource(API+'/rooms/'+room.id+'/events',{withCredentials:true});source.addEventListener('world:action',sync);source.addEventListener('room:player-joined',sync);clearInterval(timer);timer=setInterval(()=>sync().catch(()=>{}),10000);}
  async function signout(){try{await call('/auth/signout',{method:'POST'});}finally{if(source)source.close();clearInterval(timer);source=null;room=null;me();}}
  function close(){if(source)source.close();clearInterval(timer);document.getElementById('online-panel')?.remove();}
  window.FMOnline={open,close,signup,signin,create,joinPrompt,signout,sync,advance,action};
  window.addEventListener('load',()=>{const b=document.createElement('button');b.className='online-launch';b.textContent='ONLINE';b.onclick=open;document.body.appendChild(b);});
})();
