// world.js — expanded football world, international competitions and manager jobs
const WORLD_LEAGUE_PACK = [
  ['france','Ligue 1','Ligue 2',['Paris Saint-Germain','Olympique Marseille','AS Monaco','Olympique Lyonnais','LOSC Lille','RC Lens','OGC Nice','Stade Rennais']],
  ['netherlands','Eredivisie','Eerste Divisie',['Ajax','PSV Eindhoven','Feyenoord','AZ Alkmaar','FC Utrecht','FC Twente','Vitesse','FC Groningen']],
  ['belgium','Belgian Pro League',null,['Club Brugge','RSC Anderlecht','Genk','Royal Antwerp','Gent','Standard Liège','Union Saint-Gilloise','Racing Genk']],
  ['scotland','Scottish Premiership',null,['Celtic','Rangers','Aberdeen','Hearts','Hibernian','Motherwell','Dundee United','Dundee FC']],
  ['turkey','Süper Lig',null,['Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','Başakşehir','Adana Demirspor','Kasımpaşa','Antalyaspor']],
  ['saudi','Saudi Pro League',null,['Al Hilal','Al Nassr','Al Ittihad','Al Ahli','Al Shabab','Al Ettifaq','Al Fateh','Al Taawoun']],
  ['brazil','Brasileirão Série A',null,['Flamengo','Palmeiras','São Paulo','Corinthians','Santos','Grêmio','Internacional','Fluminense']],
  ['argentina','Liga Profesional',null,['River Plate','Boca Juniors','Racing Club','Independiente','San Lorenzo','Estudiantes','Lanús','Vélez Sarsfield']],
  ['japan','J1 League',null,['Kashima Antlers','Urawa Red Diamonds','Yokohama F. Marinos','Kawasaki Frontale','Gamba Osaka','Vissel Kobe','FC Tokyo','Nagoya Grampus']],
  ['usa','MLS',null,['Inter Miami','LA Galaxy','LAFC','New York City FC','Atlanta United','Seattle Sounders','Portland Timbers','Toronto FC']],
  ['mexico','Liga MX',null,['Club América','Chivas Guadalajara','Cruz Azul','Pumas UNAM','Monterrey','Tigres UANL','Toluca','Pachuca']],
  ['india','Indian Super League',null,['Mumbai City','Mohun Bagan Super Giant','FC Goa','Bengaluru FC','Kerala Blasters','East Bengal','Chennaiyin FC','Odisha FC']]
];

const WORLD_FLAGS = { france:'🇫🇷', netherlands:'🇳🇱', belgium:'🇧🇪', scotland:'🏴', turkey:'🇹🇷', saudi:'🇸🇦', brazil:'🇧🇷', argentina:'🇦🇷', japan:'🇯🇵', usa:'🇺🇸', mexico:'🇲🇽', india:'🇮🇳' };
const WORLD_NATIONS = [
  ['France','FRA'],['Brazil','BRA'],['Argentina','ARG'],['Germany','GER'],['Spain','ESP'],['England','ENG'],['Italy','ITA'],['Portugal','POR'],
  ['Netherlands','NED'],['Belgium','BEL'],['Croatia','CRO'],['Uruguay','URU'],['Colombia','COL'],['Japan','JPN'],['South Korea','KOR'],['USA','USA'],
  ['Mexico','MEX'],['Morocco','MAR'],['Senegal','SEN'],['Nigeria','NGA'],['Ghana','GHA'],['Ivory Coast','CIV'],['India','IND'],['Australia','AUS'],
  ['Saudi Arabia','KSA'],['Canada','CAN'],['Ecuador','ECU'],['Chile','CHI'],['Denmark','DEN'],['Switzerland','SUI'],['Austria','AUT'],['Serbia','SRB']
];

function worldTeamId(country, index) { return `world_${country}_${index}`; }
function worldLeagueId(country, tier) { return `world_${country}_${tier}`; }

function ensureWorldExpansion() {
  if (window.__WORLD_EXPANDED) return;
  let nextId = Math.max(0, ...getAllTeams().map(t => Number(t.id) || 0)) + 1000;
  WORLD_LEAGUE_PACK.forEach(([country, div1, div2, clubs], packIndex) => {
    const div1Id = worldLeagueId(country,1);
    const div2Id = div2 ? worldLeagueId(country,2) : null;
    const makeTeams = (names, tier, leagueId) => names.map((name, i) => {
      const id = worldTeamId(country, i + (tier === 2 ? 100 : 0));
      if (TEAM_MAP[id]) return TEAM_MAP[id];
      const base = Math.max(67, 82 - i * 2 - (tier === 2 ? 8 : 0));
      const squad = Array.from({length:18}, (_, j) => makePlayer(nextId++, `${name} ${['Academy','United','FC','City','Athletic','Rovers'][j%6]} ${j+1}`, POSITIONS[j%POSITIONS.length], 18 + (j*3)%16, Math.min(88, base - (j%5)), ['FRA','NED','BEL','SCO','TUR','KSA','BRA','ARG','JPN','USA','MEX','IND'][packIndex]));
      const team = { id, name, shortName: name.slice(0,3).toUpperCase(), color: ['#2563eb','#ef4444','#22c55e','#f59e0b','#a855f7','#06b6d4'][i%6], stadium: `${name} Stadium`, capacity: 18000 + (7-i)*4200, prestige: base, budget: base * base * 9000, wageBudget: base * 8500, squad, league: leagueId };
      ALL_TEAMS.push(team); TEAM_MAP[id] = team; return team;
    });
    const first = makeTeams(clubs,1,div1Id);
    LEAGUES[div1Id] = { id:div1Id, name:div1, country, tier:1, teams:first.map(t=>t.id), promotionSpots:0, relegationSpots:2, promotionPlayoff:0 };
    if (div2) {
      const secondNames = clubs.map((n,i)=>`${n} II`);
      const second = makeTeams(secondNames,2,div2Id);
      LEAGUES[div2Id] = { id:div2Id, name:div2, country, tier:2, teams:second.map(t=>t.id), promotionSpots:2, relegationSpots:2, promotionPlayoff:0 };
    }
    COUNTRY_CONFIG[country] = { div1:div1Id, div2:div2Id, cup: `${div1} Cup`, flag:WORLD_FLAGS[country] || '🌍', euroLeague:false };
  });
  window.__WORLD_EXPANDED = true;
}

function getInternationalCompetitions() {
  return [
    {id:'world_cup',name:'FIFA World Cup',icon:'🌎',frequency:'4 years',teams:32},
    {id:'euro',name:'UEFA European Championship',icon:'🇪🇺',frequency:'4 years',teams:24},
    {id:'copa',name:'Copa América',icon:'🌎',frequency:'4 years',teams:16},
    {id:'afcon',name:'Africa Cup of Nations',icon:'🌍',frequency:'2 years',teams:24},
    {id:'asian_cup',name:'AFC Asian Cup',icon:'🌏',frequency:'4 years',teams:24},
    {id:'gold_cup',name:'CONCACAF Gold Cup',icon:'🏆',frequency:'2 years',teams:16},
    {id:'nations',name:'Nations League',icon:'🛡️',frequency:'2 years',teams:55},
    {id:'club_world_cup',name:'FIFA Club World Cup',icon:'🌐',frequency:'4 years',teams:32}
  ];
}

function ensureManagerOffers(state) {
  if (!state.managerOffers) state.managerOffers = [];
  if (!state.managerProfile) state.managerProfile = {salary:0, history:[], preferredStyle:'Tiki-Taka'};
  const rep = state.managerReputation || 50;
  if (!state.playerTeam || Math.random() > 0.10) return;
  const pool = [
    ['world_france_1','Olympique Marseille','club',Math.max(55,rep-3)],['world_netherlands_1','Ajax','club',Math.max(58,rep-2)],
    ['world_turkey_1','Galatasaray','club',Math.max(62,rep)],['world_saudi_1','Al Hilal','club',Math.max(68,rep+4)],
    ['world_brazil_1','Flamengo','club',Math.max(60,rep)],['world_usa_1','Inter Miami','club',Math.max(52,rep-4)],
    ['NT_BRA','Brazil','nation',72],['NT_FRA','France','nation',75],['NT_IND','India','nation',42]
  ];
  const eligible = pool.filter(o => rep >= o[3] && o[0] !== state.playerTeam && !state.managerOffers.some(x=>x.targetId===o[0]));
  if (!eligible.length) return;
  const o = eligible[Math.floor(Math.random()*eligible.length)];
  state.managerOffers.push({id:`job_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,targetId:o[0],name:o[1],type:o[2],salary:Math.round((o[3]+rep)*1800),years:2+Math.floor(Math.random()*3),status:'pending',week:state.currentRound?.[state.playerLeague]||0});
  if (typeof pushNews === 'function') pushNews({type:'manager_offer',icon:'📨',headline:`${o[1]} are interested in your manager`,detail:'A new job offer has arrived.',week:state.currentRound?.[state.playerLeague]||0},state);
}

function acceptManagerOffer(id) {
  const offer = (gameState.managerOffers||[]).find(o=>o.id===id); if (!offer) return;
  if (offer.type === 'club' && getTeam(offer.targetId)) {
    gameState.managerProfile.salary = offer.salary;
    gameState.managerProfile.history = gameState.managerProfile.history || [];
    gameState.managerProfile.history.push({season:gameState.season,from:gameState.playerTeam,to:offer.targetId,type:'club'});
    gameState.playerTeam = offer.targetId;
    gameState.playerLeague = Object.keys(LEAGUES).find(l=>LEAGUES[l].teams.includes(offer.targetId)) || gameState.playerLeague;
    gameState.playerCountry = LEAGUES[gameState.playerLeague]?.country || gameState.playerCountry;
    gameState.managerOffers = [];
    saveGame(); showToast(`You are now managing ${offer.name}.`,'success'); showScreen('hub'); return;
  }
  gameState.managerProfile.salary = offer.salary; gameState.managerProfile.nationalTeam = offer.name;
  gameState.managerProfile.history = gameState.managerProfile.history || [];
  gameState.managerProfile.history.push({season:gameState.season,to:offer.name,type:'nation'});
  gameState.managerOffers = gameState.managerOffers.filter(o=>o.id!==id); saveGame(); showToast(`International appointment: ${offer.name}`,'success'); showScreen('hub');
}
function rejectManagerOffer(id) { gameState.managerOffers=(gameState.managerOffers||[]).filter(o=>o.id!==id); saveGame(); showToast('Offer rejected.','info'); showScreen('hub'); }

function simulateWorldCup() {
  const nations = (typeof WORLD_NATIONS !== 'undefined' ? WORLD_NATIONS : []).slice(0,32);
  const strength = n => ({BRA:91,FRA:90,ENG:88,GER:87,ESP:88,ARG:91,POR:88,ITA:84,NED:84,BEL:83,CRO:82,URU:83,COL:82,JPN:78,KOR:76,USA:76,MEX:78,MAR:80,SEN:79,NGA:74,GHA:72,CIV:73,IND:58,AUS:70,KSA:68,CAN:72,ECU:76,CHI:74,DEN:81,SUI:79,AUT:78,SRB:79}[n[1]] || 70) + Math.random()*8;
  const sorted=[...nations].sort((a,b)=>strength(b)-strength(a));
  let round=sorted.slice(0,16);
  const stages=[];
  function play(list,label){ const next=[]; const matches=[]; for(let i=0;i<list.length;i+=2){ const a=list[i],b=list[i+1]; const sa=strength(a),sb=strength(b); const winner=sa>=sb?a:b; next.push(winner); matches.push({a,b,winner}); } stages.push({label,matches}); return next; }
  round=play(round,'Round of 16'); round=play(round,'Quarter-finals'); round=play(round,'Semi-finals'); round=play(round,'Final');
  gameState.worldCupResult={champion:round[0],stages,year:gameState.season%4===0?2028:2026};
  saveGame(); return gameState.worldCupResult;
}
