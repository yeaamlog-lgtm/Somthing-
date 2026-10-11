// legends.js — Historical legends + retired-player pool
// Legends are optional career-mode content. They are cloned into the current world so saves remain isolated.
const LEGEND_CATALOG = [
  ['Pelé','BRA','ST',98],['Diego Maradona','ARG','CAM',97],['Johan Cruyff','NED','CF',96],['Franz Beckenbauer','GER','CB',96],
  ['Zinedine Zidane','FRA','CAM',96],['Ronaldo Nazário','BRA','ST',96],['Ronaldinho','BRA','LW',95],['Paolo Maldini','ITA','CB',96],
  ['Franco Baresi','ITA','CB',95],['Xavi','ESP','CM',94],['Andrés Iniesta','ESP','CM',95],['Lothar Matthäus','GER','CM',94],
  ['Michel Platini','FRA','CAM',95],['George Best','NIR','RW',94],['Garrincha','BRA','RW',95],['Eusébio','POR','ST',95],
  ['Ferenc Puskás','HUN','ST',95],['Marco van Basten','NED','ST',95],['Ruud Gullit','NED','CM',94],['Roberto Baggio','ITA','CAM',94],
  ['Thierry Henry','FRA','ST',95],['Dennis Bergkamp','NED','CF',93],['Patrick Vieira','FRA','CM',93],['Claude Makélélé','FRA','CDM',92],
  ['Andrea Pirlo','ITA','CM',94],['Alessandro Del Piero','ITA','ST',94],['Francesco Totti','ITA','CAM',94],['Cafu','BRA','RB',94],
  ['Roberto Carlos','BRA','LB',94],['Fabio Cannavaro','ITA','CB',94],['Gianluigi Buffon','ITA','GK',95],['Iker Casillas','ESP','GK',94],
  ['Peter Schmeichel','DEN','GK',93],['Lev Yashin','URS','GK',97],['Manuel Neuer (Legend)','GER','GK',94],['Steven Gerrard','ENG','CM',93],
  ['Frank Lampard','ENG','CM',92],['Paul Scholes','ENG','CM',92],['David Beckham','ENG','RM',93],['Ryan Giggs','WAL','LW',92],
  ['Wayne Rooney','ENG','ST',94],['Alan Shearer','ENG','ST',93],['Eric Cantona','FRA','CF',94],['Didier Drogba','CIV','ST',93],
  ['Samuel Eto\'o','CMR','ST',94],['Luis Suárez (Legend)','URU','ST',95],['Arjen Robben','NED','RW',93],['Franck Ribéry','FRA','LW',92],
  ['Kaká','BRA','CAM',94],['Rivaldo','BRA','LW',94],['Cesc Fàbregas (Legend)','ESP','CM',91],['Mesut Özil (Legend)','GER','CAM',92],
  ['Sergio Ramos (Legend)','ESP','CB',94],['Thiago Silva (Legend)','BRA','CB',92],['Zlatan Ibrahimović','SWE','ST',94],['Andrea Barzagli','ITA','CB',90],
  ['Xabi Alonso','ESP','CM',92],['Fernando Torres (Legend)','ESP','ST',91],['David Villa','ESP','ST',92],['Raúl','ESP','ST',92],
  ['Michael Owen','ENG','ST',91],['Clarence Seedorf','NED','CM',92],['Edgar Davids','NED','CM',90],['Javier Zanetti','ARG','RB',92],
  ['Carles Puyol','ESP','CB',92],['Nemanja Vidić','SRB','CB',91],['Rio Ferdinand','ENG','CB',91],['John Terry','ENG','CB',90]
];

function legendPlayerFromCatalog(row, index) {
  const [name, nation, pos, overall] = row;
  const pace = Math.max(68, Math.min(98, overall - (pos === 'CB' || pos === 'GK' ? 8 : 2)));
  const passing = Math.max(72, overall - (pos === 'GK' ? 15 : 1));
  const dribbling = Math.max(70, overall - (pos === 'CB' || pos === 'GK' ? 10 : 1));
  const shooting = Math.max(68, overall - (['GK','CB','LB','RB'].includes(pos) ? 12 : 1));
  const defending = ['GK'].includes(pos) ? 35 : ['CB','LB','RB','CDM'].includes(pos) ? overall - 1 : overall - 20;
  const physical = Math.max(70, overall - 2);
  const gk = pos === 'GK';
  return {
    id: 900000 + index, name, nation, pos, overall, age: 28, birthYear: 1975,
    pace, passing, dribbling, shooting, defending, physical,
    gkDiving: gk ? overall : 30, gkHandling: gk ? overall - 1 : 30,
    gkKicking: gk ? overall - 2 : 30, gkReflexes: gk ? overall : 30, gkPositioning: gk ? overall - 1 : 30,
    salary: Math.round(overall * 90000), value: Math.round(overall * overall * 18000),
    morale: 85, fitness: 100, injuredWeeks: 0, outOnLoan: false, contractYears: 2,
    traits: ['legend','bigGame','leader'].concat(pos === 'CAM' || pos === 'CM' ? ['playmaker'] : []),
    isLegend: true, retiredStatus: 'retired', peakOverall: overall, legendIndex: index
  };
}

function getLegendCatalogPlayers() { return LEGEND_CATALOG.map(legendPlayerFromCatalog); }
function getLegendByName(name) { return getLegendCatalogPlayers().find(p => p.name === name); }
function cloneLegendForWorld(player, nextId) { return { ...player, id: nextId, isLegend: true, retiredStatus: 'active_legend' }; }
