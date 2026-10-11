/* Club Empire mobile navigation + player storylines. No framework required. */
(() => {
  let activeScreen = 'hub';
  const NAV = [
    ['hub','⌂','Home'], ['squad','♟','Squad'], ['tactics','▤','Tactics'],
    ['transfers','⇄','Transfers'], ['training','↗','Training'], ['table','▦','Table'],
    ['fixtures','▣','Fixtures'], ['youth','✦','Academy'], ['staff','♙','Staff'],
    ['club','⌂','Club'], ['stats','◷','Stats'], ['career','▤','Career'],
    ['football-world','◎','World']
  ];
  const STORIES = [
    {tag:'DRESSING ROOM',icon:'🗣️',title:'A senior player wants a private meeting',body:p=>`${p} feels the squad has stopped listening to the leadership group. Training has been tense, and younger players are starting to take sides.`,options:[
      {label:'Hear them out',tone:'good',result:'The meeting stayed private. The player feels respected and the dressing room settles.',morale:5,rep:2},
      {label:'Back the coaching staff',tone:'neutral',result:'Your message was clear. Some players appreciate the standards; others want to see results.',morale:-1,rep:3},
      {label:'Fine the player for disruption',tone:'danger',result:'The club has made its stance clear, but trust has taken a hit.',morale:-5,rep:1,budget:250000}
    ]},
    {tag:'ACADEMY WATCH',icon:'🌱',title:'A wonderkid is making noise in training',body:p=>`${p} has impressed the senior staff all week. The academy coaches believe the youngster is ready for a carefully managed first-team opportunity.`,options:[
      {label:'Give them a cup start',tone:'good',result:'The prospect is buzzing after being trusted with a first-team chance.',morale:4,rep:2,playerMorale:8},
      {label:'Keep the development plan',tone:'neutral',result:'The coaches are happy with the patient approach. The player has a clear development target.',morale:1,rep:1,playerMorale:2},
      {label:'Send them on loan',tone:'neutral',result:'A loan could bring minutes, but the player is disappointed to miss the first-team opportunity.',morale:-1,rep:0,playerMorale:-3}
    ]},
    {tag:'TRANSFER WHISPERS',icon:'📱',title:'An agent hints at interest from abroad',body:p=>`Reports suggest a foreign club is monitoring ${p}. The story has reached social media before the club has made any formal contact.`,options:[
      {label:'Offer improved terms',tone:'good',result:'Your proactive approach reassured the player, though the wage structure needs watching.',morale:3,rep:1,budget:-150000},
      {label:'Tell the agent to bring an offer',tone:'neutral',result:'The club has kept its negotiating position. The agent will return if serious interest develops.',morale:0,rep:2},
      {label:'Publicly declare them not for sale',tone:'danger',result:'Fans loved the message, but the player wants the club to match its ambition on the pitch.',morale:1,rep:3}
    ]},
    {tag:'MEDIA STORM',icon:'🎙️',title:'A post-match quote is being taken out of context',body:p=>`${p} made a frustrated comment after the last result. Headlines now suggest there is a rift between the player and the manager.`,options:[
      {label:'Protect the player publicly',tone:'good',result:'Your support cooled the story and the player appreciated the backing.',morale:4,rep:2},
      {label:'Speak privately first',tone:'neutral',result:'You got the full story before reacting. The press cycle is fading without a public feud.',morale:2,rep:1},
      {label:'Demand an apology',tone:'danger',result:'The standards are clear, but the player feels thrown under the bus.',morale:-4,rep:1}
    ]},
    {tag:'COMEBACK STORY',icon:'💪',title:'A player wants to return ahead of schedule',body:p=>`${p} has worked tirelessly in rehab and believes they can rejoin full training. Medical staff advise a cautious return to avoid a setback.`,options:[
      {label:'Trust the medical team',tone:'good',result:'The player accepted the plan. A safe return is more important than a rushed comeback.',morale:2,rep:2},
      {label:'Allow light individual work',tone:'neutral',result:'A tailored session lifted the player’s spirits while keeping contact limited.',morale:3,rep:1},
      {label:'Push for an early return',tone:'danger',result:'The player is motivated, but staff are concerned about the risk. Keep a close eye on fitness.',morale:1,rep:-2}
    ]},
    {tag:'COMMUNITY',icon:'❤️',title:'The captain asks the club to support a local cause',body:p=>`${p} has organised a community event for local families. The squad wants the club to help with the event and make a visible commitment.`,options:[
      {label:'Back the community event',tone:'good',result:'Supporters responded warmly and the squad felt proud to represent the club.',morale:4,rep:3,budget:-75000},
      {label:'Send a small delegation',tone:'neutral',result:'The club showed support without disrupting the training schedule.',morale:2,rep:1,budget:-20000},
      {label:'Focus on football this week',tone:'danger',result:'The schedule stayed clear, but some players felt the club missed a chance to connect with supporters.',morale:-2,rep:-1}
    ]},
    {tag:'TACTICAL LEAK',icon:'📰',title:'A journalist has details of your planned setup',body:p=>`A report has described your likely formation and pressing plan. ${p} says the squad is focused, but opponents may have an early clue.`,options:[
      {label:'Keep the plan',tone:'good',result:'You backed your principles. The players know the system and will execute it with conviction.',morale:2,rep:2},
      {label:'Make a late tactical tweak',tone:'neutral',result:'The surprise could help, but the players will need a crisp briefing before kick-off.',morale:0,rep:1},
      {label:'Find the source internally',tone:'danger',result:'The investigation has distracted staff. You need to rebuild trust while protecting team information.',morale:-3,rep:0}
    ]},
    {tag:'CONTRACT WATCH',icon:'📝',title:'A key player wants clarity on their future',body:p=>`${p} is approaching an important contract decision and wants to understand their role in the club’s long-term project.`,options:[
      {label:'Explain the sporting project',tone:'good',result:'A clear conversation eased the uncertainty without committing the club to a costly deal.',morale:3,rep:2},
      {label:'Ask them to prove it on the pitch',tone:'neutral',result:'The challenge was accepted, but contract talks are likely to return soon.',morale:0,rep:1},
      {label:'Promise a bigger role',tone:'danger',result:'The player is pleased for now. You will need to honour the promise with meaningful minutes.',morale:2,rep:1}
    ]}
  ];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function club(){try{return typeof gameState!=='undefined' && gameState.playerTeam && typeof getTeam==='function' ? getTeam(gameState.playerTeam) : null;}catch{return null;}}
  function ensureStory(){
    if(typeof gameState==='undefined' || !gameState || !gameState.playerTeam) return null;
    if(!gameState.clubEmpireStories) gameState.clubEmpireStories={pending:null,history:[],lastWeek:null};
    const s=gameState.clubEmpireStories;
    const league=gameState.playerLeague||'league';
    const week=gameState.currentRound?.[league] ?? gameState.currentRound?.[gameState.playerLeague] ?? 0;
    const key=`${gameState.season||1}:${league}:${week}`;
    if(!s.pending && s.lastWeek!==key){
      s.lastWeek=key;
      if(!s.history.length || Math.random()<0.64){
        const story=STORIES[Math.floor(Math.random()*STORIES.length)];
        const team=club(); const squad=team?.squad||[];
        const pick=squad.length?squad[Math.floor(Math.random()*squad.length)]:null;
        const name=pick?.name || 'A first-team regular';
        s.pending={id:`${key}:${Date.now()}`,tag:story.tag,icon:story.icon,title:story.title,body:story.body(name),options:story.options.map((o,i)=>({...o,id:i})),playerName:pick?.name||null,created:key};
      }
    }
    return s.pending;
  }
  function storyCard(){
    const pending=ensureStory();
    if(!pending) return '';
    return `<section class="ce-story-card" id="ce-story-card"><div class="ce-story-art"><span>${esc(pending.icon)}</span><small>CLUB LIFE · LIVE STORY</small><b>${esc(pending.tag)}</b></div><div class="ce-story-content"><div class="ce-story-head"><span class="ce-story-kicker">OFF THE PITCH</span><span class="ce-live-pill"><i></i> DEVELOPING</span></div><h3>${esc(pending.title)}</h3><p>${esc(pending.body)}</p><div class="ce-story-choices">${pending.options.map(o=>`<button class="ce-story-choice ${esc(o.tone)}" onclick="CEStories.choose(${o.id})"><span>${esc(o.label)}</span><b>↗</b></button>`).join('')}</div></div></section>`;
  }
  function injectStories(app){
    if(!app || !app.querySelector('.hub') || app.querySelector('#ce-story-card')) return;
    const left=app.querySelector('.hub-left');
    if(!left) return;
    const wrapper=document.createElement('div'); wrapper.innerHTML=storyCard();
    if(wrapper.firstElementChild) left.insertBefore(wrapper.firstElementChild,left.children[1]||null);
  }
  function choose(id){
    if(typeof gameState==='undefined'||!gameState?.clubEmpireStories?.pending)return;
    const s=gameState.clubEmpireStories; const story=s.pending; const choice=story.options.find(o=>o.id===id); if(!choice)return;
    const teamId=gameState.playerTeam;
    if(gameState.morale && Number.isFinite(gameState.morale[teamId])) gameState.morale[teamId]=Math.max(1,Math.min(100,gameState.morale[teamId]+(choice.morale||0)));
    if(Number.isFinite(gameState.managerReputation)) gameState.managerReputation=Math.max(0,Math.min(100,gameState.managerReputation+(choice.rep||0)));
    if(gameState.budgets && Number.isFinite(gameState.budgets[teamId]) && choice.budget) gameState.budgets[teamId]=Math.max(0,gameState.budgets[teamId]+choice.budget);
    const team=club(); const player=team?.squad?.find(p=>p.name===story.playerName);
    if(player && Number.isFinite(player.morale) && choice.playerMorale) player.morale=Math.max(0,Math.min(100,player.morale+choice.playerMorale));
    s.history.unshift({title:story.title,choice:choice.label,result:choice.result,week:story.created}); s.history=s.history.slice(0,12); s.pending=null;
    gameState.notification=`${story.icon} ${choice.result}`;
    try{if(typeof manualSave==='function')manualSave();}catch{}
    if(typeof showScreen==='function')showScreen('hub');
  }
  function navItem(id,icon,label){return `<button class="ce-more-item" onclick="CEPhone.go('${id}')"><span>${icon}</span><b>${label}</b><i>›</i></button>`;}
  function mountDock(){
    const app=document.getElementById('app'); if(!app)return;
    const screen=document.querySelector('.main-menu,.team-select-screen');
    document.querySelector('.ce-phone-dock')?.remove(); document.querySelector('.ce-more-sheet')?.remove();
    document.body.classList.remove('ce-mobile-active');
    if(screen || !app.firstElementChild)return;
    document.body.classList.add('ce-mobile-active');
    const current=activeScreen;
    const dock=document.createElement('nav'); dock.className='ce-phone-dock'; dock.setAttribute('aria-label','Main navigation');
    dock.innerHTML=`<button class="ce-dock-item ${current==='hub'?'active':''}" onclick="CEPhone.go('hub')"><span>⌂</span><small>Home</small></button><button class="ce-dock-item" onclick="CEPhone.go('squad')"><span>♟</span><small>Squad</small></button><button class="ce-dock-item ce-dock-play" onclick="CEPhone.go('tactics')"><span>⚽</span><small>Game plan</small></button><button class="ce-dock-item" onclick="CEPhone.go('transfers')"><span>⇄</span><small>Market</small></button><button class="ce-dock-item" onclick="CEPhone.more()"><span>☷</span><small>More</small></button>`;
    document.body.appendChild(dock);
    const sheet=document.createElement('div'); sheet.className='ce-more-sheet'; sheet.innerHTML=`<div class="ce-sheet-backdrop" onclick="CEPhone.more(false)"></div><section class="ce-sheet-panel"><div class="ce-sheet-handle"></div><div class="ce-sheet-head"><div><small>CLUB EMPIRE</small><h3>Club workspace</h3></div><button onclick="CEPhone.more(false)" aria-label="Close menu">×</button></div><div class="ce-sheet-grid">${navItem('hub','⌂','Dashboard')}${navItem('squad','♟','Squad & contracts')}${navItem('tactics','▤','Tactics board')}${navItem('training','↗','Training')}${navItem('table','▦','League table')}${navItem('fixtures','▣','Fixtures')}${navItem('transfers','⇄','Transfers & scouting')}${navItem('youth','✦','Academy')}${navItem('staff','♙','Staff')}${navItem('club','⌂','Club facilities')}${navItem('stats','◷','Statistics')}${navItem('career','▤','Manager career')}${navItem('football-world','◎','Football world')}${navItem('end-season','🏁','Season review')}</div><div class="ce-sheet-foot"><button onclick="manualSave();CEPhone.more(false)">↥ Save career</button><button onclick="window.FMOnline?.open?.();CEPhone.more(false)">◎ Online leagues</button></div></section>`;
    document.body.appendChild(sheet);
  }
  function go(id){document.querySelector('.ce-more-sheet')?.classList.remove('open'); if(typeof showScreen==='function')showScreen(id);}
  function more(force){const s=document.querySelector('.ce-more-sheet');if(!s)return;s.classList.toggle('open',force===undefined?!s.classList.contains('open'):!!force);}
  window.CEStories={choose}; window.CEPhone={go,more,mountDock};
  if(typeof window.renderHub==='function'){const old=window.renderHub;window.renderHub=function(app){old(app);injectStories(app);};}
  if(typeof window.showScreen==='function'){const old=window.showScreen;window.showScreen=function(...args){activeScreen=args[0]||'hub';old(...args);mountDock();};}
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(mountDock,0);});
  const observer=new MutationObserver(()=>{if(document.getElementById('app')?.firstElementChild && !document.querySelector('.ce-phone-dock'))mountDock();});
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
})();
