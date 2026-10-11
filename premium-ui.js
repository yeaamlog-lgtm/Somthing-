/* Football OS Premium UI — Appearance Studio, Dashboard 2.0, Match Centre 2.0 */
(function(){
  const THEME_KEY='fm_football_os_theme_v2';
  const defaults={mode:'dark',accent:'#38bdf8',background:'aurora',glass:true,compact:false,animations:true,nav:'sidebar',clubAuto:true};
  const themes={
    dark:['Dark Pro','#38bdf8'], light:['Light Clean','#2563eb'], midnight:['Midnight Blue','#60a5fa'], emerald:['Emerald','#22c55e'], royal:['Royal Purple','#a855f7'], gold:['Gold Edition','#f59e0b'], red:['Red Elite','#ef4444']
  };
  let prefs={...defaults}; try{prefs={...defaults,...JSON.parse(localStorage.getItem(THEME_KEY)||'{}')} }catch(e){}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function apply(){
    const r=document.documentElement;
    r.dataset.fmTheme=prefs.mode; r.dataset.fmBackground=prefs.background; r.dataset.fmGlass=prefs.glass?'on':'off'; r.dataset.fmCompact=prefs.compact?'on':'off'; r.dataset.fmAnimations=prefs.animations?'on':'off';
    r.style.setProperty('--fm-accent',prefs.accent); localStorage.setItem(THEME_KEY,JSON.stringify(prefs));
  }
  function save(){apply(); if(typeof showToast==='function')showToast('Appearance saved','success');}
  function appearance(){
    showModal({title:'Appearance Studio',cancel:'Close',confirm:'Apply',body:`
      <div class="appearance-grid">
        <label>Theme<select id="ap-mode">${Object.entries(themes).map(([k,v])=>`<option value="${k}" ${prefs.mode===k?'selected':''}>${v[0]}</option>`).join('')}</select></label>
        <label>Accent<select id="ap-accent"><option value="#38bdf8">Sky</option><option value="#22c55e">Emerald</option><option value="#f59e0b">Gold</option><option value="#ef4444">Red</option><option value="#a855f7">Purple</option><option value="#60a5fa">Blue</option><option value="#f8fafc">White</option></select></label>
        <label>Background<select id="ap-bg"><option value="aurora">Aurora</option><option value="stadium">Stadium</option><option value="pitch">Pitch</option><option value="minimal">Minimal</option></select></label>
        <label>Navigation<select id="ap-nav"><option value="sidebar">Sidebar</option><option value="bottom">Bottom Bar</option><option value="classic">Classic</option></select></label>
      </div>
      <div class="appearance-toggles"><label><input id="ap-glass" type="checkbox" ${prefs.glass?'checked':''}> Glass effects</label><label><input id="ap-anim" type="checkbox" ${prefs.animations?'checked':''}> Animations</label><label><input id="ap-compact" type="checkbox" ${prefs.compact?'checked':''}> Compact mode</label><label><input id="ap-auto" type="checkbox" ${prefs.clubAuto?'checked':''}> Club accent</label></div>
      <div class="theme-preview"><span></span><div><b>Football OS</b><small>Premium live football workspace</small></div></div>` ,onConfirm:()=>{
        prefs.mode=document.getElementById('ap-mode').value;prefs.accent=document.getElementById('ap-accent').value;prefs.background=document.getElementById('ap-bg').value;prefs.nav=document.getElementById('ap-nav').value;prefs.glass=document.getElementById('ap-glass').checked;prefs.animations=document.getElementById('ap-anim').checked;prefs.compact=document.getElementById('ap-compact').checked;prefs.clubAuto=document.getElementById('ap-auto').checked;save();
      }});
  }
  function matchCentre(){
    const team=typeof getTeam==='function'&&gameState?.playerTeam?getTeam(gameState.playerTeam):null;
    const leagueId=team?.league||gameState?.leagueId; const league=leagueId&&LEAGUES?.[leagueId];
    const opponent=(league?.teams||[]).find(id=>id!==gameState?.playerTeam); const opp=opponent&&getTeam(opponent);
    showModal({title:'Match Centre 2.0',cancel:'Close',confirm:'Simulate Match',body:`<div class="match-centre-card"><div class="mc-team"><strong>${esc(team?.name||'Your Club')}</strong><span>${esc(team?.shortName||'HOME')}</span></div><div class="mc-vs">VS</div><div class="mc-team"><strong>${esc(opp?.name||'Next Opponent')}</strong><span>${esc(opp?.shortName||'AWAY')}</span></div></div><div class="mc-live-grid"><div><b>TACTICS</b><span>${esc(gameState?.tactics?.mentality||'Balanced')}</span></div><div><b>FORMATION</b><span>${esc(gameState?.tactics?.formation||'4-3-3')}</span></div><div><b>PRESSING</b><span>${esc(gameState?.tactics?.pressing||'High')}</span></div><div><b>STATUS</b><span>Ready to simulate</span></div></div>`,onConfirm:()=>{
      if(!team||!opp||typeof simulateMatch!=='function'){showToast('Match data is not ready yet','error');return;}
      const result=simulateMatch(team.id,opp.id,gameState,{detailed:true});
      showModal({title:`${team.name} ${result.homeGoals} — ${result.awayGoals} ${opp.name}`,cancel:'Done',confirm:false,body:`<div class="match-result-premium"><div class="scoreline"><strong>${result.homeGoals}</strong><span>FULL TIME</span><strong>${result.awayGoals}</strong></div><div class="commentary-list">${(result.events||[]).slice(0,18).map(e=>`<div><b>${esc(e.minute||'')}</b> ${esc(e.text||e.type||'Match event')}</div>`).join('')||'<div>Match completed. Open Statistics for the full breakdown.</div>'}</div></div>`});
    }});
  }
  function dashboard(app){
    const hub=app.querySelector('.hub'); if(!hub||hub.querySelector('.premium-dashboard'))return;
    const team=gameState?.playerTeam&&typeof getTeam==='function'?getTeam(gameState.playerTeam):null;
    const offers=gameState?.managerOffers?.length||0, season=gameState?.season||1, week=gameState?.week||1;
    const box=document.createElement('section');box.className='premium-dashboard';box.innerHTML=`<div class="premium-dashboard-head"><div><span class="eyebrow">FOOTBALL OS</span><h2>Command Centre</h2><p>${esc(team?.name||'Your Club')} · Season ${season} · Week ${week}</p></div><div class="dashboard-actions"><button class="premium-action" onclick="FMOS.appearance()">🎨 Appearance</button><button class="premium-action" onclick="FMOS.matchCentre()">⚽ Match Centre</button>${offers?`<button class="premium-action hot" onclick="showScreen('manager')">💼 ${offers} Job Offer${offers>1?'s':''}</button>`:''}</div></div><div class="premium-metrics"><div><small>TRANSFER</small><b>${typeof formatMoney==='function'?formatMoney(team?.budget||0):'—'}</b></div><div><small>WAGE</small><b>${typeof formatMoney==='function'?formatMoney(team?.wageBudget||0):'—'}</b></div><div><small>REPUTATION</small><b>${gameState?.managerReputation||50}</b></div><div><small>FITNESS</small><b>${team?.squad?Math.round(team.squad.reduce((a,p)=>a+(p.fitness||100),0)/Math.max(1,team.squad.length)):'—'}%</b></div></div>`;
    hub.insertBefore(box,hub.querySelector('.hub-body')||hub.firstChild);
  }
  window.FMOS={appearance,matchCentre,apply};
  apply();
  if(typeof window.renderHub==='function'){const old=window.renderHub;window.renderHub=function(app){old(app);dashboard(app);};}
  document.addEventListener('keydown',e=>{if(e.key==='Escape')return; if(e.altKey&&e.key.toLowerCase()==='a'){e.preventDefault();appearance();}});
})();
