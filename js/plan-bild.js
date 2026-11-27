/* SKWS Squads – Einsatzplan-Bilder für Wüstensturm und Schluchtsturm (Admin und Spielerseite)
   Taktiken, Gebäude und das Zeichnen auf den Vorlagen; die Spielerseite lädt die Datei erst beim Antippen von „Plan-Bild“. */
// Taktiken: Gruppen in Prioritätsreihenfolge (die Stärksten zuerst), je Gruppe ein Schritt pro Phase.
// Die Schritte werden mit veröffentlicht; index.html übersetzt Aktionen, Gebäude und Phasen.
var DS_TACTICS = {
  std: {
    name: 'Ausgewogen – Silo-Sturm um 10:00',
    desc: 'Die 5 Stärksten nehmen zuerst Ölraffinerie I und stürmen um 10:00 gemeinsam das Atomsilo. Der Rest hält Raffinerien, Infozentrum/Waffenlager, drei Lazarette und das Tech-Zentrum.',
    when: 'Gegner ungefähr gleich stark. Guter Standard, wenn ihr den Gegner nicht kennt.',
    pro: 'Holt das Silo (meiste Punkte) früh, ohne die Außengebäude aufzugeben.',
    con: 'Wenn der Gegner das Silo härter verteidigt, binden sich eure Stärksten dort.',
    en: 'Balanced: the 5 strongest take Oil Refinery I, then move into the Nuclear Silo together at 10:00; the rest hold refineries, Info Center/Arsenal, three hospitals and the Science Hub.',
    ph: ['p0','p10','p13'],
    groups: [
      { k:'silo',  n:5, label:'Silo-Trupp',              steps:[['take','ref1'],['rally','silo'],['hold','silo']] },
      { k:'ref2',  n:2, label:'Raffinerie-II-Trupp',     steps:[['take','ref2'],['hold','ref2'],['hold','ref2']] },
      { k:'ref1',  n:2, label:'Raffinerie-I-Trupp',      steps:[['help','ref2'],['move','ref1'],['hold','ref1']] },
      { k:'info',  n:2, label:'Info-/Waffenlager-Trupp', steps:[['take','info'],['move','arsenal'],['hold','arsenal']] },
      { k:'hosp1', n:2, label:'Lazarett I',              steps:[['take','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
      { k:'hosp2', n:2, label:'Lazarett II',             steps:[['take','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
      { k:'sci',   n:1, label:'Tech-Zentrum',            steps:[['take','sci'],['iffree','merc'],['wells','wells']] },
      { k:'hosp3', n:2, label:'Lazarett III',            steps:[['take','hosp3'],['holdh','hosp3'],['reinforce','']] },
      { k:'supp',  n:2, label:'Unterstützung',           steps:[['defend',''],['reinforce',''],['wells','wells']] }
    ]
  },
  wide: {
    name: 'Breit verteilt + Eingreiftruppe',
    desc: 'Alle 8 Außengebäude werden ab Start mit 1–3 Spielern besetzt. Die 3 Stärksten sind eine Eingreiftruppe: Sie beobachten, wo wir unter Druck sind, und verstärken dort. Ab 10 Min. übernehmen Info- und Tech-Trupp Waffenlager und Söldnerfabrik, ab 20 Min. geht die Eingreiftruppe aufs Atomsilo.',
    when: 'Wenn ihr viele Gebäude sicher halten wollt und der Gegner unberechenbar ist. Entspricht eurem letzten Plan.',
    pro: 'Viele Gebäude produzieren gleichzeitig Punkte; die Eingreiftruppe stopft Lücken.',
    con: 'Wenig Leute pro Gebäude – ein konzentrierter Angriff kann einzelne Gebäude kippen.',
    en: 'Spread out: all 8 outer buildings are held from the start by 1–3 players each. The 3 strongest form a reaction team that watches where we are under pressure and reinforces there; from minute 20 they take the Nuclear Silo.',
    ph: ['p0','p10','p20'],
    groups: [
      { k:'flex',  n:3, label:'Eingreiftruppe',          steps:[['watch',''],['watch',''],['takeend','silo']] },
      { k:'ref1',  n:3, label:'Raffinerie I',            steps:[['take','ref1'],['hold','ref1'],['hold','ref1']] },
      { k:'ref2',  n:3, label:'Raffinerie II',           steps:[['take','ref2'],['hold','ref2'],['hold','ref2']] },
      { k:'info',  n:2, label:'Info-/Waffenlager-Trupp', steps:[['take','info'],['move','arsenal'],['hold','arsenal']] },
      { k:'sci',   n:2, label:'Tech/Söldner',    steps:[['take','sci'],['move','merc'],['hold','merc']] },
      { k:'hosp1', n:2, label:'Lazarett I',              steps:[['take','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
      { k:'hosp2', n:2, label:'Lazarett II',             steps:[['take','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
      { k:'hosp3', n:2, label:'Lazarett III',            steps:[['take','hosp3'],['holdh','hosp3'],['holdh','hosp3']] },
      { k:'hosp4', n:1, label:'Lazarett IV',             steps:[['take','hosp4'],['holdh','hosp4'],['reinforce','']] }
    ]
  },
  center: {
    name: 'Zentrum & Buffs – gegen schwächere Gegner',
    desc: '6 Starke nehmen Ölraffinerie I und stürmen um 10:00 das Atomsilo. Je 3 Spieler holen sich parallel Waffenlager (+15 % eigene Werte) und Söldnerfabrik (−15 % Gegner). Zusammen mit dem Silo ergibt das das „Buff-Dreieck“.',
    when: 'Wenn ihr klar stärker seid oder unbedingt das Silo dominieren wollt.',
    pro: 'Bis zu 30 % Werte-Vorteil in der Mitte; das Silo bringt die meisten Punkte.',
    con: 'Lazarette und Tech-Zentrum werden kaum besetzt – gegen starke Gegner riskant.',
    en: 'Center & buffs: 6 strong players take Oil Refinery I and move into the Nuclear Silo at 10:00; at the same time 3 players each take the Arsenal and the Mercenary Factory (buff triangle).',
    ph: ['p0','p10','p13'],
    groups: [
      { k:'silo',  n:6, label:'Silo-Trupp',         steps:[['take','ref1'],['rally','silo'],['hold','silo']] },
      { k:'arsenal', n:3, label:'Waffenlager-Trupp', steps:[['take','info'],['move','arsenal'],['hold','arsenal']] },
      { k:'merc',  n:3, label:'Söldner-Trupp',      steps:[['take','sci'],['move','merc'],['hold','merc']] },
      { k:'ref2',  n:3, label:'Raffinerie II',      steps:[['take','ref2'],['hold','ref2'],['hold','ref2']] },
      { k:'ref1',  n:2, label:'Raffinerie I halten', steps:[['help','ref1'],['hold','ref1'],['hold','ref1']] },
      { k:'hosp1', n:2, label:'Lazarett I',         steps:[['take','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
      { k:'supp',  n:1, label:'Unterstützung',      steps:[['defend',''],['reinforce',''],['wells','wells']] }
    ]
  },
  turtle: {
    name: 'Bollwerk + Schlussangriff – gegen stärkere Gegner',
    desc: 'Alle 4 Lazarette (Heilung!) und beide Raffinerien werden gehalten, ins Zentrum geht zunächst niemand, die Truppen werden geschont. Ab 28:00 sammeln sich die 5 Stärksten und greifen um 28:30 gemeinsam das Atomsilo an, danach werden die Punkte-Kisten eingesammelt.',
    when: 'Wenn der Gegner deutlich stärker ist. Riskant: Der Schlussangriff muss gut abgestimmt sein.',
    pro: 'Wenig Verluste, viel Heilung, sichere Punkte; der späte Angriff erwischt den Gegner oft unvorbereitet.',
    con: 'Lange kein Silo-Punktestrom; scheitert der Schlussangriff, fehlen die Punkte.',
    en: 'Bulwark & final strike: hold all 4 field hospitals and both refineries, stay out of the center; from 28:00 the 5 strongest gather and move into the Nuclear Silo together at 28:30, then collect the point boxes.',
    ph: ['p0','p10','p28'],
    groups: [
      { k:'strike', n:5, label:'Schlussangriff',  steps:[['take','ref1'],['holdq','ref1'],['final','silo']] },
      { k:'ref2',  n:3, label:'Raffinerie II',    steps:[['take','ref2'],['holdq','ref2'],['hold','ref2']] },
      { k:'hosp1', n:2, label:'Lazarett I',       steps:[['take','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
      { k:'hosp2', n:2, label:'Lazarett II',      steps:[['take','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
      { k:'hosp3', n:2, label:'Lazarett III',     steps:[['take','hosp3'],['holdh','hosp3'],['holdh','hosp3']] },
      { k:'hosp4', n:2, label:'Lazarett IV',      steps:[['take','hosp4'],['holdh','hosp4'],['holdh','hosp4']] },
      { k:'info',  n:2, label:'Infozentrum',      steps:[['take','info'],['holdq','info'],['hold','info']] },
      { k:'supp',  n:2, label:'Unterstützung',    steps:[['defend',''],['reinforce',''],['reinforce','']] }
    ]
  }
};
// Taktik von Moon (Allianzmitglied): vier Farbbereiche + geschlossenes gelbes Team.
// Bereiche nach Lage auf unserer Karte: Schwarz links, Rot rechts, Grün oben, Blau unten.
DS_TACTICS.moon = {
  name: 'Farbbereiche + Gelb – Taktik von Moon',
  desc: 'Taktik von Moon: Vier Farbbereiche mit je 2 Gebäudehaltern (schwächere Spieler: Gebäude halten, Angriffe melden, keine unnötigen Kämpfe) und 2 Unterstützern (Bereich verteidigen, verlorene Gebäude zurückerobern). Die 4 Stärksten sind das gelbe Team: immer geschlossen, nur auf Ruf des Einsatzleiters, ab 10:00 gemeinsam aufs Atomsilo. Höchstens 2 abgestimmte Silo-Versuche, sonst geschlossen auf eine gegnerische Raffinerie. Waffenlager und Söldnerfabrik erst, wenn das Silo sicher ist.',
  when: 'Wenn eine Person im Kampfchat die Einsatzleitung übernimmt und die Bereiche selbstständig verteidigen sollen. Gut bei gemischt starken Teams.',
  pro: 'Alle 8 Außengebäude sofort besetzt, klare Zuständigkeiten, die Stärksten bleiben zusammen und sparen Truppen fürs Silo.',
  con: 'Nur 4 am Silo – gegen sehr starke Gegner knapp. Schwache Halter auf den Raffinerien brauchen schnelle Hilfe von Unterstützern bzw. Gelb.',
  en: 'Moon\'s plan: four color areas, each with 2 building holders (weaker players: hold the building, report attacks, no needless fights) and 2 supporters (defend the area, retake lost buildings). The 4 strongest are the yellow team: always together, only on the leader\'s call, Nuclear Silo together at 10:00. At most 2 coordinated silo attempts, otherwise move as a group to an enemy refinery. Arsenal and Mercenary Factory only once the silo is secure.',
  ph: ['p0','p10','p13'],
  // Füllreihenfolge: Gelb = die Stärksten, Halter = die Schwächsten, Unterstützer = die Mitte (im Zickzack auf die Bereiche verteilt)
  tiers: [['gelb'], ['uL','uR','uN','uS'], ['hRef1','hRef2','hH1','hH4','hH3','hH2','hInfo','hSci']],
  sectors: { secL:['ref1','hosp1'], secR:['ref2','hosp4'], secN:['info','hosp3'], secS:['sci','hosp2'] },
  groups: [
    { k:'gelb',  n:4, label:'Gelbes Team',                 steps:[['yellow',''],['rally','silo'],['silob','silo']] },
    { k:'uL',    n:2, label:'Unterstützer Schwarz (links)', steps:[['sup','secL'],['sup','secL'],['sup','secL']] },
    { k:'uR',    n:2, label:'Unterstützer Rot (rechts)',    steps:[['sup','secR'],['sup','secR'],['sup','secR']] },
    { k:'uN',    n:2, label:'Unterstützer Grün (oben)',     steps:[['sup','secN'],['sup','secN'],['sup','secN']] },
    { k:'uS',    n:2, label:'Unterstützer Blau (unten)',    steps:[['sup','secS'],['sup','secS'],['sup','secS']] },
    { k:'hRef1', n:1, label:'Halter Schwarz',  steps:[['keep','ref1'],['hold','ref1'],['hold','ref1']] },
    { k:'hRef2', n:1, label:'Halter Rot',      steps:[['keep','ref2'],['hold','ref2'],['hold','ref2']] },
    { k:'hH1',   n:1, label:'Halter Schwarz',  steps:[['keep','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
    { k:'hH4',   n:1, label:'Halter Rot',      steps:[['keep','hosp4'],['holdh','hosp4'],['holdh','hosp4']] },
    { k:'hH3',   n:1, label:'Halter Grün',     steps:[['keep','hosp3'],['holdh','hosp3'],['holdh','hosp3']] },
    { k:'hH2',   n:1, label:'Halter Blau',     steps:[['keep','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
    { k:'hInfo', n:1, label:'Halter Grün',     steps:[['keep','info'],['hold','info'],['hold','info']] },
    { k:'hSci',  n:1, label:'Halter Blau',     steps:[['keep','sci'],['hold','sci'],['hold','sci']] }
  ]
};
// 4 Farbteams (Vorlage „Desert Storm – 4-Team Lineup“): je Farbe 2 Gebäudehalter + 2 Unterstützer + 1 Gelber.
// Die 4 Gelben (die Stärksten) unterstützen zuerst ihre Farbe und gehen nach der Öffnung gemeinsam aufs Atomsilo (J).
// Zuordnung laut Vorlagen-Karte: Schwarz B/C, Rot F/G, Grün A/E, Blau D/H.
DS_TACTICS.team4 = {
  name: '4 Farbteams + Gelb – Aufstellung nach Stärke',
  desc: 'Vier Farbteams (Schwarz links, Rot rechts, Grün oben, Blau unten) mit je 2 Gebäudehaltern, 2 Unterstützern und einem der 4 Stärksten (Gelb). Die Gelben helfen zu Beginn ihrer Farbe und gehen nach der Öffnung gemeinsam aufs Atomsilo. Waffenlager und Söldnerfabrik nur, wenn das Silo sicher ist. Die Teams werden nach Stärke ausgeglichen verteilt; alle dürfen sich im eigenen Farbbereich frei bewegen.',
  when: 'Wenn ihr klare Zuständigkeiten wollt und die Teams gleich stark sein sollen. Passt zur Tafel „4-Team-Aufstellung“.',
  pro: 'Alle 8 Außengebäude ab Start besetzt, jede Farbe gleich stark, die Stärksten bündeln sich fürs Silo.',
  con: 'Nach der Öffnung fehlt jeder Farbe ihr stärkster Spieler – Unterstützer müssen dann mehr abfangen.',
  en: 'Four color teams (Black left, Red right, Green north, Blue south), each with 2 building holders, 2 supporters and one of the 4 strongest (Yellow). The Yellow players first support their color and move into the Nuclear Silo together after it opens. Arsenal and Mercenary Factory only if the silo is secure. Teams are balanced by strength; everyone may move freely within their color area.',
  ph: ['p0','p10','p13'],
  // Gelb: die 4 Stärksten (je Farbe einer); Unterstützer und Halter im Zickzack, damit jede Farbe gleich stark ist
  tiers: [['yB','yR','yG','yU'], ['sU','sG','sR','sB'], ['hB1','hR1','hG1','hU1','hU2','hG2','hR2','hB2']],
  colors: { B:{ sec:'secL', h:['hB1','hB2'], s:'sB', y:'yB' }, R:{ sec:'secR', h:['hR2','hR1'], s:'sR', y:'yR' }, G:{ sec:'secN', h:['hG2','hG1'], s:'sG', y:'yG' }, U:{ sec:'secS', h:['hU1','hU2'], s:'sU', y:'yU' } },
  groups: [
    { k:'yB',  n:1, label:'Gelb (Schwarz)',        steps:[['sup','secL'],['rally','silo'],['hold','silo']] },
    { k:'yR',  n:1, label:'Gelb (Rot)',            steps:[['sup','secR'],['rally','silo'],['hold','silo']] },
    { k:'yG',  n:1, label:'Gelb (Grün)',           steps:[['sup','secN'],['rally','silo'],['hold','silo']] },
    { k:'yU',  n:1, label:'Gelb (Blau)',           steps:[['sup','secS'],['rally','silo'],['hold','silo']] },
    { k:'sB',  n:2, label:'Unterstützer Schwarz',  steps:[['sup','secL'],['sup','secL'],['sup','secL']] },
    { k:'sR',  n:2, label:'Unterstützer Rot',      steps:[['sup','secR'],['sup','secR'],['sup','secR']] },
    { k:'sG',  n:2, label:'Unterstützer Grün',     steps:[['sup','secN'],['sup','secN'],['sup','secN']] },
    { k:'sU',  n:2, label:'Unterstützer Blau',     steps:[['sup','secS'],['sup','secS'],['sup','secS']] },
    { k:'hB1', n:1, label:'Schwarz – Ölraffinerie I',  steps:[['keep','ref1'],['hold','ref1'],['hold','ref1']] },
    { k:'hB2', n:1, label:'Schwarz – Feldlazarett I',  steps:[['keep','hosp1'],['holdh','hosp1'],['holdh','hosp1']] },
    { k:'hR1', n:1, label:'Rot – Ölraffinerie II',     steps:[['keep','ref2'],['hold','ref2'],['hold','ref2']] },
    { k:'hR2', n:1, label:'Rot – Feldlazarett II',     steps:[['keep','hosp2'],['holdh','hosp2'],['holdh','hosp2']] },
    { k:'hG1', n:1, label:'Grün – Feldlazarett IV',    steps:[['keep','hosp4'],['holdh','hosp4'],['holdh','hosp4']] },
    { k:'hG2', n:1, label:'Grün – Infozentrum',        steps:[['keep','info'],['hold','info'],['hold','info']] },
    { k:'hU1', n:1, label:'Blau – Feldlazarett III',   steps:[['keep','hosp3'],['holdh','hosp3'],['holdh','hosp3']] },
    { k:'hU2', n:1, label:'Blau – Tech-Zentrum',       steps:[['keep','sci'],['hold','sci'],['hold','sci']] }
  ]
};
var DS_SEC = { secL:{ de:'Schwarz', en:'Black', col:'#111827' }, secR:{ de:'Rot', en:'Red', col:'#b91c1c' }, secN:{ de:'Grün', en:'Green', col:'#15803d' }, secS:{ de:'Blau', en:'Blue', col:'#1d4ed8' } };
var DS_B = { secL:'Bereich Schwarz (links)', secR:'Bereich Rot (rechts)', secN:'Bereich Grün (oben)', secS:'Bereich Blau (unten)', ref1:'Ölraffinerie I', ref2:'Ölraffinerie II', hosp1:'Feldlazarett I', hosp2:'Feldlazarett II', hosp3:'Feldlazarett III', hosp4:'Feldlazarett IV', sci:'Tech-Zentrum', info:'Infozentrum', arsenal:'Waffenlager', merc:'Söldnerfabrik', silo:'Atomsilo', wells:'Ölquellen' };
var DS_B_EN = { secL:'Black area (left)', secR:'Red area (right)', secN:'Green area (top)', secS:'Blue area (bottom)', ref1:'Oil Refinery I', ref2:'Oil Refinery II', hosp1:'Field Hospital I', hosp2:'Field Hospital II', hosp3:'Field Hospital III', hosp4:'Field Hospital IV', sci:'Science Hub', info:'Info Center', arsenal:'Arsenal', merc:'Mercenary Factory', silo:'Nuclear Silo', wells:'Oil Wells' };
var DS_A = { take:'{b} erobern und halten', help:'bei {b} mit erobern', move:'zu {b} wechseln, erobern und halten', hold:'{b} halten', holdh:'{b} halten, geheilte Truppen abholen', rally:'ab 9:30 sammeln, um 10:00 gemeinsam {b} erobern und halten', iffree:'{b} erobern, wenn frei – sonst verstärken, wo nötig', defend:'Basis verteidigen, Punkte-Kisten einsammeln', reinforce:'Kisten einsammeln, angegriffene Gebäude verstärken', wells:'{b} sammeln',
  watch:'Eingreiftruppe: beobachten, wo wir unter Druck sind, und dort verstärken', takeend:'{b} erobern und bis zum Ende halten', final:'ab 28:00 sammeln, um 28:30 gemeinsam {b} angreifen, danach Punkte-Kisten einsammeln', holdq:'{b} halten und Truppen schonen – nicht ins Zentrum',
  yellow:'Gelbes Team: immer geschlossen bleiben, nur auf Ruf des Einsatzleiters eingreifen (Raffinerien retten, starke Gegner stoppen)', keep:'{b} sofort erobern, in der Nähe bleiben und Angriffe sofort melden – keine unnötigen Kämpfe', sup:'{b} absichern: Halter schützen, verlorene Gebäude gemeinsam zurückerobern, Kisten sammeln', silob:'{b} gemeinsam halten – nach 2 gescheiterten Versuchen geschlossen auf eine gegnerische Raffinerie' };
var DS_A_EN = { take:'capture & hold', help:'help capture', move:'move to & hold', hold:'hold', holdh:'hold', rally:'rally 9:30, attack 10:00', iffree:'take if free', defend:'defend base', reinforce:'reinforce', wells:'gather', watch:'reaction team', takeend:'capture & hold to the end', final:'final strike 28:30', holdq:'hold, save troops', yellow:'yellow team', keep:'capture & report', sup:'secure area', silob:'hold, plan B: enemy refinery' };
var DS_PHL = { p0:'Start (0–10 Min.)', p10:'Ab 10 Min.', p13:'Ab 13 Min.', p20:'Ab 20 Min.', p28:'Ab 28 Min.' };
var DS_PHL_EN = { p0:'phase 1, minute 0–10', p10:'phase 2, from minute 10', p13:'phase 3, from minute 13', p20:'phase 3, from minute 20', p28:'phase 3, from minute 28' };
function dsGroupsOf(team){
  var TC = DS_TACTICS[team.tac] || DS_TACTICS.std, out = [];
  TC.groups.forEach(function(g){ var names = team.m.filter(function(x){ return x[1] === g.k; }).map(function(x){ return x[0]; }); if (names.length) out.push({ g: g, names: names }); });
  return out;
}
function dsmWrap(ctx, text, maxW){
  var out = []; String(text).split('\n').forEach(function(par){
    var words = par.split(' '), line = '';
    words.forEach(function(w){ var tst = line ? line + ' ' + w : w; if (ctx.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; });
    out.push(line);
  }); return out;
}

/* ---------- Wüstensturm: Plan-Bild auf der Allianz-Vorlage (ds-vorlage-a/b.jpg, 1672×941) ---------- */
// Gebäude-Mitte [x,y] und Mitte des Namensschilds [x,y] in Pixeln der Vorlage.
var DST_T = {
  A: { src: 'ds-vorlage-a.jpg', w: 1672, h: 941, box: [62, 368, 636, 790], map: [690, 1510], low: 700, time: [1462, 47],
       b: { info:[930,103,931,154], arsenal:[1105,205,1107,281], hosp3:[1273,105,1270,151], ref1:[790,300,787,358], hosp4:[1420,330,1429,382],
            silo:[1103,420,1105,501], hosp1:[788,515,788,583], ref2:[1425,543,1431,595], merc:[1106,645,1107,710], hosp2:[930,745,936,810], sci:[1275,755,1270,810],
            wells:[930,430,930,430], react:[955,455,955,455], base:[760,840,760,840],
            secL:[790,452,790,452], secR:[1300,492,1300,492], secN:[1100,128,1100,128], secS:[1090,840,1090,840] } },
  B: { src: 'ds-vorlage-b.jpg', w: 1672, h: 941, box: [62, 372, 646, 790], map: [700, 1522], low: 700, time: [1430, 45],
       b: { info:[942,103,943,153], arsenal:[1120,205,1119,282], hosp3:[1288,105,1283,151], ref1:[800,300,798,358], hosp4:[1432,330,1440,382],
            silo:[1117,420,1117,500], hosp1:[800,515,799,583], ref2:[1440,543,1442,595], merc:[1120,645,1120,711], hosp2:[943,745,948,811], sci:[1288,755,1282,811],
            wells:[942,430,942,430], react:[967,455,967,455], base:[772,840,772,840],
            secL:[802,452,802,452], secR:[1312,492,1312,492], secN:[1112,128,1112,128], secS:[1102,840,1102,840] } }
};
var DST = DST_T.A, DST_IMGS = {}, DST_IMG = null;
function dstLoad(t, cb){
  if (typeof t === 'function') { cb = t; t = 'A'; }
  DST = DST_T[t] || DST_T.A;
  if (DST_IMGS[t]) { DST_IMG = DST_IMGS[t]; return cb(); }
  var im = new Image(); im.onload = function(){ DST_IMGS[t] = DST_IMG = im; cb(); }; im.onerror = function(){ DST_IMG = null; cb(); }; im.src = DST.src + '?v=3';
}
// eigenen Namen auf der Spielerseite gelb hinterlegen
function planMe(g, o, me, FS){
  var parts = o.s.split(', '), k = parts.indexOf(me); if (k < 0) return;
  var pre = parts.slice(0, k).join(', ') + (k ? ', ' : ''), x0 = o.x - g.measureText(o.s).width / 2 + g.measureText(pre).width, w = g.measureText(me).width;
  g.fillStyle = '#facc15'; g.beginPath(); if (g.roundRect) g.roundRect(x0 - 6, o.y - 3, w + 12, FS + 8, 6); else g.rect(x0 - 6, o.y - 3, w + 12, FS + 8); g.fill();
}
function dstDraw(T, lang, me, loc){
  var DE = lang === 'de';
  function phTxt(k){ return DE ? DS_PHL[k].replace(/^Ab/, 'ab') : DS_PHL_EN[k].replace(/^phase \d, /, ''); }
  var TC = DS_TACTICS[T.tac] || DS_TACTICS.std; T = Object.assign({ s: [], m: [], ph: TC.ph }, T); if (!T.ph) T.ph = TC.ph;
  var groups = dsGroupsOf(T);
  var S = 1920 / DST.w, W = DST.w * S, H = DST.h * S, c = document.createElement('canvas'); c.width = W; c.height = H;
  var g = c.getContext('2d'); g.lineJoin = 'round'; g.miterLimit = 2;
  g.drawImage(DST_IMG, 0, 0, W, H);
  function B(k){ var p = DST.b[k] || DST.b.react; return { x: p[0] * S, y: p[1] * S, lx: p[2] * S, ly: p[3] * S }; }
  // Start und Wechsel je Gruppe
  var startAt = {}, moves = [], late = [];
  groups.forEach(function(x){
    var s0 = x.g.steps[0], b0 = s0[1] || (s0[0] === 'watch' || s0[0] === 'yellow' ? 'react' : 'base'), prev = b0, mover = false;
    x.g.steps.forEach(function(s, i){ if (!i) return; var b = s[1] || null; if (!b || b === prev) return; if (b === 'wells') { late.push(x.names.join(', ') + (DE ? ' → Ölquellen (' : ' → Oil Wells (') + phTxt(T.ph[i]) + ')'); return; } moves.push({ from: prev, to: b, ph: i, names: x.names, first: !mover }); mover = true; prev = b; });
    (startAt[b0] = startAt[b0] || []).push({ names: x.names, mover: mover });
  });
  var FS = 22, LH = 25, textOps = [], anchor = {};
  g.font = '800 ' + FS + 'px system-ui, sans-serif';
  Object.keys(startAt).forEach(function(k){
    var p = B(k), blocks = startAt[k];
    var sec = DS_SEC[k];
    var maxW = sec || (k !== 'react' && k !== 'base' && k !== 'wells' && p.ly >= DST.low * S) ? 160 : 230;
    blocks.forEach(function(blk){ var L = [], cur = ''; blk.names.forEach(function(nm){ var tst = cur ? cur + ', ' + nm : nm; if (cur && g.measureText(tst).width > maxW) { L.push(cur); cur = nm; } else cur = tst; }); if (cur) L.push(cur); blk.lines = L; });
    var n = blocks.reduce(function(a, b){ return a + b.lines.length; }, 0);
    var real = k !== 'react' && k !== 'base' && k !== 'wells' && !sec;
    var below = !real || p.ly < DST.low * S;
    var y = real ? (below ? p.ly + 28 : p.y - 40 - n * LH - (blocks.length - 1) * 14) : p.y - n * LH / 2;
    if (!real) { textOps.push({ s: sec ? (DE ? 'Unterstützer ' + sec.de : sec.en + ' supporters') : k === 'react' ? (T.tac === 'moon' ? (DE ? 'Gelbes Team' : 'Yellow team') : (DE ? 'Eingreiftruppe' : 'Reaction team')) : (DE ? 'Unterstützung' : 'Support'), x: p.x, y: y - 26, small: true, col: sec ? sec.col : (k === 'react' && T.tac === 'moon' ? '#8a6a00' : null) }); }
    blocks.forEach(function(blk){
      var w = Math.max.apply(null, blk.lines.map(function(s){ return g.measureText(s).width; }));
      var cx = Math.min(Math.max(p.x, DST.map[0] * S + w / 2 + 26), DST.map[1] * S - w / 2 - 26);
      blk.lines.forEach(function(s, i){ textOps.push({ s: s, x: cx, y: y + i * LH }); });
      if (blk.mover) {
        var cy = y + blk.lines.length * LH / 2 - 2, rx = w / 2 + 22, ry = blk.lines.length * LH / 2 + 10;
        g.strokeStyle = '#22c55e'; g.lineWidth = 4.5; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
        blk.names.forEach(function(s){ anchor[s] = [cx, cy, rx]; });
      }
      y += blk.lines.length * LH + 14;
    });
  });
  var COL = ['#22c55e', '#22c55e', '#f59e0b'];
  function arrow(x1, y1, x2, y2, col){
    var mxp = (x1 + x2) / 2 + (y2 - y1) * .18, myp = (y1 + y2) / 2 - (x2 - x1) * .18;
    var ang = Math.atan2(y2 - myp, x2 - mxp), ex = x2 - Math.cos(ang) * 42, ey = y2 - Math.sin(ang) * 42;
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mxp, myp, ex, ey); g.stroke();
    var a2 = Math.atan2(ey - myp, ex - mxp); g.beginPath(); g.moveTo(ex + Math.cos(a2) * 16, ey + Math.sin(a2) * 16);
    g.lineTo(ex + Math.cos(a2 + 2.5) * 20, ey + Math.sin(a2 + 2.5) * 20); g.lineTo(ex + Math.cos(a2 - 2.5) * 20, ey + Math.sin(a2 - 2.5) * 20); g.closePath(); g.fill();
  }
  moves.forEach(function(m){
    var a = m.first ? anchor[m.names[0]] : null, f = B(m.from), to = B(m.to);
    var sx = a ? a[0] : f.x, sy = a ? a[1] : f.y; if (a) sx += (to.x >= sx ? 1 : -1) * a[2];
    arrow(sx, sy, to.x, to.y, COL[m.ph] || COL[1]);
    if (!m.first) textOps.push({ s: m.names.join(', ') + ' (' + phTxt(T.ph[m.ph]) + ')', x: to.x, y: to.y - 62, small: true, col: '#7a4a00' });
  });
  g.textAlign = 'center'; g.textBaseline = 'top';
  textOps.forEach(function(o){
    g.font = (o.small ? '700 17px' : '800 ' + FS + 'px') + ' system-ui, sans-serif';
    if (me && !o.small) planMe(g, o, me, FS);
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(o.s, o.x, o.y);
    g.fillStyle = o.col || '#0b0f19'; g.fillText(o.s, o.x, o.y);
  });
  // Briefing-Text (Englisch)
  var bx = DST.box[0] * S, by = DST.box[1] * S, bw = (DST.box[2] - DST.box[0]) * S, bh = (DST.box[3] - DST.box[1]) * S;
  var head = 'BRIEFING' + (T.opp ? (DE ? ' · gegen ' : ' · vs ') + T.opp : '');
  if (T.time) { g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.font = '800 34px system-ui, sans-serif'; g.shadowColor = '#3d8bff'; g.shadowBlur = 12; g.fillText(T.time, DST.time[0] * S, DST.time[1] * S); g.shadowBlur = 0; }
  var parts = [DE ? TC.desc : TC.en];
  if (loc) parts.unshift(loc);
  var flex = groups.filter(function(x){ return x.g.steps.some(function(s){ return s[0] === 'watch'; }); });
  flex.forEach(function(x){ var silo = x.g.steps[2] && x.g.steps[2][1] === 'silo'; parts.push(x.names.join(', ') + (DE ? ': beobachten, wo wir unter Druck sind, und dort verstärken' + (silo ? '; ab Minute 20 das Atomsilo erobern.' : '.') : ': watch where we are under pressure and reinforce there' + (silo ? '; from minute 20 take the Nuclear Silo.' : '.'))); });
  if (T.note) parts.push(T.note);
  if (late.length) parts.push((DE ? 'Später: ' : 'Later: ') + late.join('; '));
  if (T.s.length) parts.push((DE ? 'Ersatz: ' : 'Substitutes: ') + T.s.map(function(n, i){ return n + (T.ss && DS_SEC[T.ss[i]] ? ' (' + DS_SEC[T.ss[i]][DE ? 'de' : 'en'] + ')' : ''); }).join(', '));
  parts.push((DE ? 'Grüne Pfeile: ' : 'Green arrows: ') + phTxt(T.ph[1]) + (DE ? ' · Orange: ' : ' · Orange: ') + phTxt(T.ph[2]));
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  var fs = 24, lines;
  do {
    g.font = '500 ' + fs + 'px system-ui, sans-serif';
    lines = []; parts.forEach(function(p, i){ if (i) lines.push(''); dsmWrap(g, p, bw - 36).forEach(function(l){ lines.push(l); }); });
    fs -= 1;
  } while ((lines.length + 2) * fs * 1.32 > bh - 24 && fs > 12);
  fs += 1;
  g.fillStyle = '#7dd3fc'; g.font = '800 ' + (fs + 4) + 'px system-ui, sans-serif'; g.fillText(head, bx + 18, by + 18 + fs + 4);
  g.fillStyle = '#e6f1ff'; g.font = '500 ' + fs + 'px system-ui, sans-serif';
  lines.forEach(function(l, i){ g.fillText(l, bx + 18, by + 18 + (fs + 4) * 1.6 + (i + 1) * fs * 1.32); });
  return c.toDataURL(me ? 'image/jpeg' : 'image/png', .88);
}

/* ---------- Schluchtsturm ---------- */
// Namen und Öffnungszeiten laut deutschem Spiel-Screenshot; Lage: Sicherheitszone der Ordnungshüter oben, darunter Energieturm, Viruslabor in der Mitte,
// Morgenbringer-Start unten links/rechts. Gebäude 1–8 ordnet der Admin im Tab zu (keine überprüfbare Quelle).
var CS_B = {
  de: { lab:'Viruslabor', tower:'Energieturm', safe:'Sicherheitszone Ordnungshüter', spl:'Morgenbringer-Start', spr:'Morgenbringer-Start',
        dc1:'Rechenzentrum I', dc2:'Rechenzentrum II', sf1:'Serumfabrik I', sf2:'Serumfabrik II', ds1:'Abwehrsystem I', ds2:'Abwehrsystem II',
        sw1:'Probenlager I', sw2:'Probenlager II', sw3:'Probenlager III', sw4:'Probenlager IV', base:'Basis' },
  en: { lab:'Virus Lab', tower:'Power Tower', safe:'Rulebringer Safe Zone', spl:'Dawnbreaker Spawn', spr:'Dawnbreaker Spawn',
        dc1:'Data Center I', dc2:'Data Center II', sf1:'Serum Factory I', sf2:'Serum Factory II', ds1:'Defense System I', ds2:'Defense System II',
        sw1:'Sample Warehouse I', sw2:'Sample Warehouse II', sw3:'Sample Warehouse III', sw4:'Sample Warehouse IV', base:'Base' }
};
var CS_TYPES = ['dc1','dc2','sf1','sf2','ds1','ds2','sw1','sw2','sw3','sw4'];
var CS_A = {
  de: { take:'{b} erobern und halten', hold:'{b} halten', move:'zu {b} wechseln, erobern und halten', rally:'ab 13:30 sammeln, um 14:00 gemeinsam {b} angreifen und bis zum Ende halten',
        defend:'Basis verteidigen, Punkte-Kisten und Energie sammeln', reinforce:'Kisten einsammeln, angegriffene Gebäude verstärken', unlock:'{b} erobern, sobald es öffnet (ab {t} Min.)' },
  en: { take:'capture and hold {b}', hold:'hold {b}', move:'move to {b}, capture and hold it', rally:'gather at 13:30, attack {b} together at 14:00 and hold it to the end',
        defend:'defend the base, collect point boxes and energy', reinforce:'collect boxes, reinforce buildings under attack', unlock:'capture {b} as soon as it opens (from min {t})' }
};
var CS_PHL = { de: { p0:'Start (0–7 Min.)', p7:'Ab 7 Min.', p14:'Ab 14 Min.' }, en: { p0:'Start (min 0–7)', p7:'From min 7', p14:'From min 14' } };
// Öffnungszeiten laut Spiel (Schutz-Countdown zu Beginn): Abwehrsysteme 7, Serumfabriken 10, Viruslabor 14 Minuten
var CS_OPEN = { ds1:7, ds2:7, sf1:10, sf2:10, lab:14 };
var CS_TACTICS = {
  lab: {
    name: 'Morgenbringer – wir greifen das Viruslabor an',
    desc: 'Absprache mit der Partner-Allianz: Wir nehmen das Viruslabor, die Partner halten die Gebäude dazwischen. Die 5 Stärksten sichern ab 0:30 den Energieturm und greifen um 14:00 gemeinsam das Viruslabor an. Der Rest hält Rechenzentren und Probenlager und holt sich Abwehrsysteme (ab 7 Min.) und Serumfabriken (ab 10 Min.), sobald sie öffnen.',
    en: 'Agreed with our partner alliance: we take the Virus Lab, they hold the buildings in between. The 5 strongest secure the Power Tower from 0:30 and attack the Virus Lab together at 14:00. The rest hold the Data Centers and Sample Warehouses and take the Defense Systems (from min 7) and Serum Factories (from min 10) as soon as they open.',
    when: 'Wenn eure Allianz die stärkere der beiden Morgenbringer ist.',
    pro: 'Das Viruslabor bringt mit 120 Punkten/Sek. am meisten.',
    con: 'Klappt nur mit Absprache – sonst greifen beide Allianzen dasselbe an und die Außengebäude bleiben leer.',
    ph: ['p0','p7','p14'],
    groups: [
      { k:'sturm', n:5, label:'Sturm-Trupp',      steps:[['take','tower'],['hold','tower'],['rally','lab']] },
      { k:'dc1',   n:2, label:'Rechenzentrum I',   steps:[['take','dc1'],['hold','dc1'],['hold','dc1']] },
      { k:'dc2',   n:2, label:'Rechenzentrum II',  steps:[['take','dc2'],['hold','dc2'],['hold','dc2']] },
      { k:'sw1',   n:1, label:'Probenlager I',    steps:[['take','sw1'],['hold','sw1'],['hold','sw1']] },
      { k:'sw2',   n:1, label:'Probenlager II',   steps:[['take','sw2'],['hold','sw2'],['hold','sw2']] },
      { k:'sw3',   n:1, label:'Probenlager III',  steps:[['take','sw3'],['hold','sw3'],['hold','sw3']] },
      { k:'sw4',   n:1, label:'Probenlager IV',   steps:[['take','sw4'],['hold','sw4'],['hold','sw4']] },
      { k:'sf1',   n:2, label:'Serumfabrik I',    steps:[['defend','base'],['unlock','sf1'],['hold','sf1']] },
      { k:'sf2',   n:2, label:'Serumfabrik II',   steps:[['defend','base'],['unlock','sf2'],['hold','sf2']] },
      { k:'ds1',   n:1, label:'Abwehrsystem I',  steps:[['reinforce','base'],['unlock','ds1'],['hold','ds1']] },
      { k:'ds2',   n:1, label:'Abwehrsystem II', steps:[['reinforce','base'],['unlock','ds2'],['hold','ds2']] },
      { k:'supp',  n:1, label:'Unterstützung',    steps:[['defend','base'],['reinforce','base'],['reinforce','base']] }
    ]
  },
  mid: {
    name: 'Morgenbringer – Partner greift an, wir halten die Mitte',
    desc: 'Absprache mit der Partner-Allianz: Die Partner nehmen das Viruslabor, wir halten Energieturm, Rechenzentren und Probenlager und besetzen ab 7 Minuten beide Abwehrsysteme, die die Wege zur Mitte bewachen.',
    en: 'Agreed with our partner alliance: they take the Virus Lab, we hold the Power Tower, Data Centers and Sample Warehouses and occupy both Defense Systems from minute 7, which guard the paths to the center.',
    when: 'Wenn die Partner-Allianz stärker ist oder das Labor angreifen will.',
    pro: 'Sichere Punkte von vielen Gebäuden, die Wege zur Mitte sind geschützt.',
    con: 'Kein Labor-Punktestrom für euch selbst; hängt vom Partner ab.',
    ph: ['p0','p7','p14'],
    groups: [
      { k:'sturm', n:5, label:'Energieturm-Trupp', steps:[['take','tower'],['hold','tower'],['hold','tower']] },
      { k:'ds1',   n:2, label:'Abwehrsystem I',  steps:[['take','dc1'],['unlock','ds1'],['hold','ds1']] },
      { k:'ds2',   n:2, label:'Abwehrsystem II', steps:[['take','dc2'],['unlock','ds2'],['hold','ds2']] },
      { k:'dc1',   n:1, label:'Rechenzentrum I',   steps:[['take','dc1'],['hold','dc1'],['hold','dc1']] },
      { k:'dc2',   n:1, label:'Rechenzentrum II',  steps:[['take','dc2'],['hold','dc2'],['hold','dc2']] },
      { k:'sw1',   n:1, label:'Probenlager I',    steps:[['take','sw1'],['hold','sw1'],['hold','sw1']] },
      { k:'sw2',   n:1, label:'Probenlager II',   steps:[['take','sw2'],['hold','sw2'],['hold','sw2']] },
      { k:'sw3',   n:1, label:'Probenlager III',  steps:[['take','sw3'],['hold','sw3'],['hold','sw3']] },
      { k:'sw4',   n:1, label:'Probenlager IV',   steps:[['take','sw4'],['hold','sw4'],['hold','sw4']] },
      { k:'sf1',   n:2, label:'Serumfabrik I',    steps:[['defend','base'],['unlock','sf1'],['hold','sf1']] },
      { k:'sf2',   n:2, label:'Serumfabrik II',   steps:[['defend','base'],['unlock','sf2'],['hold','sf2']] },
      { k:'supp',  n:1, label:'Unterstützung',    steps:[['defend','base'],['reinforce','base'],['reinforce','base']] }
    ]
  },
  rule: {
    name: 'Ordnungshüter (wir allein) – konzentrieren', top: true,
    desc: 'Als einzelne Allianz nicht alles verteidigen: Die 5 Stärksten nehmen den Energieturm (Schild über die Schutzzone) und halten ab 14 Minuten das Viruslabor bis zum Schluss. Judicator für das Labor-Fenster aufheben. Der Rest hält Rechenzentren, Serumfabriken und Abwehrsysteme.',
    en: 'As a single alliance, do not defend everything: the 5 strongest take the Power Tower (shield over the safe zone) and hold the Virus Lab from minute 14 to the end. Save the Judicator for the Virus Lab window. The rest hold the Data Centers, Serum Factories and Defense Systems.',
    when: 'Wenn eure Allianz in dieser Runde die Ordnungshüter-Seite spielt.',
    pro: 'Kräfte gebündelt, Labor und Schild in eurer Hand.',
    con: 'Probenlager bleiben dem Gegner – das Labor muss bis zum Ende gehalten werden.',
    ph: ['p0','p7','p14'],
    groups: [
      { k:'sturm', n:5, label:'Sturm-Trupp',      steps:[['take','tower'],['hold','tower'],['rally','lab']] },
      { k:'dc1',   n:2, label:'Rechenzentrum I',   steps:[['take','dc1'],['hold','dc1'],['hold','dc1']] },
      { k:'dc2',   n:2, label:'Rechenzentrum II',  steps:[['take','dc2'],['hold','dc2'],['hold','dc2']] },
      { k:'sf1',   n:2, label:'Serumfabrik I',    steps:[['defend','base'],['unlock','sf1'],['hold','sf1']] },
      { k:'sf2',   n:2, label:'Serumfabrik II',   steps:[['defend','base'],['unlock','sf2'],['hold','sf2']] },
      { k:'ds1',   n:2, label:'Abwehrsystem I',  steps:[['reinforce','base'],['unlock','ds1'],['hold','ds1']] },
      { k:'ds2',   n:2, label:'Abwehrsystem II', steps:[['reinforce','base'],['unlock','ds2'],['hold','ds2']] },
      { k:'supp',  n:3, label:'Energie & Kisten', steps:[['defend','base'],['reinforce','base'],['reinforce','base']] }
    ]
  }
};
// Einfache Taktik von Moon (Allianzmitglied): Starke Energieturm -> Labor, Schwächere erst Probenlager, dann auf öffnende Gebäude.
CS_TACTICS.moon = {
  name: 'Einfach – Taktik von Moon',
  desc: 'Taktik von Moon: Die 5 Stärksten gehen zuerst auf den Energieturm und um 14:00 gemeinsam aufs Viruslabor. Die Schwächeren nehmen zuerst Probenlager und Rechenzentren und verteilen sich dann auf die Gebäude, sobald sie öffnen: Abwehrsysteme ab 7, Serumfabriken ab 10 Minuten. Je ein Spieler bleibt auf jedem Probenlager.',
  en: 'Moon\'s plan: the 5 strongest take the Power Tower first and attack the Virus Lab together at 14:00. The weaker players start on the Sample Warehouses and Data Centers and then spread to the buildings as they open: Defense Systems from minute 7, Serum Factories from minute 10. One player stays on each Sample Warehouse.',
  when: 'Wenn nur wenige mitspielen oder keine Absprache mit der Partner-Allianz möglich ist.',
  pro: 'Leicht zu verstehen, jeder hat ab Start ein Ziel; die Starken sind gebündelt.',
  con: 'Ab 7–10 Minuten sind Probenlager nur noch mit je 1 Spieler besetzt; ohne Absprache greift evtl. auch die Partner-Allianz das Labor an.',
  ph: ['p0','p7','p14'],
  groups: [
    { k:'sturm', n:5, label:'Sturm-Trupp',        steps:[['take','tower'],['hold','tower'],['rally','lab']] },
    { k:'a1',    n:2, label:'Lager → Abwehrsystem I',  steps:[['take','sw1'],['unlock','ds1'],['hold','ds1']] },
    { k:'a2',    n:2, label:'Lager → Abwehrsystem II', steps:[['take','sw4'],['unlock','ds2'],['hold','ds2']] },
    { k:'s1',    n:2, label:'Lager → Serumfabrik I',   steps:[['take','sw2'],['unlock','sf1'],['hold','sf1']] },
    { k:'s2',    n:2, label:'Lager → Serumfabrik II',  steps:[['take','sw3'],['unlock','sf2'],['hold','sf2']] },
    { k:'dc1',   n:1, label:'Rechenzentrum I',    steps:[['take','dc1'],['hold','dc1'],['hold','dc1']] },
    { k:'dc2',   n:1, label:'Rechenzentrum II',   steps:[['take','dc2'],['hold','dc2'],['hold','dc2']] },
    { k:'sw1',   n:1, label:'Probenlager I',      steps:[['take','sw1'],['hold','sw1'],['hold','sw1']] },
    { k:'sw2',   n:1, label:'Probenlager II',     steps:[['take','sw2'],['hold','sw2'],['hold','sw2']] },
    { k:'sw3',   n:1, label:'Probenlager III',    steps:[['take','sw3'],['hold','sw3'],['hold','sw3']] },
    { k:'sw4',   n:1, label:'Probenlager IV',     steps:[['take','sw4'],['hold','sw4'],['hold','sw4']] },
    { k:'supp',  n:1, label:'Unterstützung',      steps:[['defend','base'],['reinforce','base'],['reinforce','base']] }
  ]
};
// Vorlagen (1672×941): Gebäude-Mitte und Namensschild in Vorlagen-Pixeln; B liegt 11 px weiter rechts.
// [Mitte x, y, Schild x, y, (optional) Namen x, y]
var CST_BASE = { safe:[1095,115,1095,115], tower:[1089,373,1089,296,1089,318], lab:[1092,486,1092,537], spl:[848,815,800,861], spr:[1347,815,1395,861],
  base:[1092,820,1092,820], baseTop:[1095,150,1095,150],
  dc1:[872,201,872,252], dc2:[1310,199,1310,252], sf1:[837,420,837,475], ds2:[1345,416,1345,475], ds1:[829,549,829,604], sf2:[1353,549,1353,611],
  sw1:[758,697,758,748], sw2:[980,729,980,690,980,652], sw3:[1202,729,1202,690,1202,652], sw4:[1427,697,1427,748] };
var CST_T = { A: { dx: 0, box:[62,368,636,790], map:[690,1510], time:[1462,47], low:700 }, B: { dx: 11, box:[62,372,646,790], map:[700,1522], time:[1430,45], low:700 } };
var CS_IMGS = {};
function csGroupsOf(T){
  var TC = CS_TACTICS[T.tac] || CS_TACTICS.lab, out = [];
  TC.groups.forEach(function(g){ var names = T.m.filter(function(x){ return x[1] === g.k; }).map(function(x){ return x[0]; }); if (names.length) out.push({ g: g, names: names }); });
  return out;
}
function csLoadMapTpl(t, lang, cb){
  var key = t + lang; if (CS_IMGS[key]) return cb(CS_IMGS[key]);
  var im = new Image(); im.onload = function(){ CS_IMGS[key] = im; cb(im); }; im.onerror = function(){ cb(null); }; im.src = 'cs-vorlage-' + t.toLowerCase() + '-' + lang + '.jpg?v=2';
}
function csDrawMap(T, t, lang, IMG, me, loc){
  var DE = lang === 'de', L = DE ? 'de' : 'en', CT = CST_T[t] || CST_T.A, TC = CS_TACTICS[T.tac] || CS_TACTICS.lab, T = Object.assign({ s: [], m: [], ph: TC.ph }, T), groups = csGroupsOf(T);
  var S = 1920 / 1672, W = 1920, H = Math.round(941 * S), c = document.createElement('canvas'); c.width = W; c.height = H;
  var g = c.getContext('2d'); g.lineJoin = 'round'; g.miterLimit = 2; g.drawImage(IMG, 0, 0, W, H);
  function B(k){ var p = CST_BASE[k === 'base' && TC.top ? 'baseTop' : k]; if (!p) return null; return { x: (p[0] + CT.dx) * S, y: p[1] * S, lx: (p[2] + CT.dx) * S, ly: p[3] * S, nx: ((p[4] || p[2]) + CT.dx) * S, ny: (p[5] || p[3] + 21) * S }; }
  // Gebäude-Beschriftungen (belegte + zugeordnete)
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'italic 600 19px system-ui, sans-serif';
  function tag(text, x, y){ var w = g.measureText(text).width + 18; g.fillStyle = 'rgba(10,16,28,.92)'; g.beginPath(); if (g.roundRect) g.roundRect(x - w/2, y - 14, w, 28, 7); else g.rect(x - w/2, y - 14, w, 28); g.fill(); g.fillStyle = '#fff'; g.fillText(text, x, y); }
  ['safe','tower','lab','spl','spr'].concat(CS_TYPES).forEach(function(k){ var p = B(k); if (p) tag(CS_B[L][k], p.lx, p.ly); });
  var startAt = {}, moves = [], unplaced = [];
  groups.forEach(function(x){
    var b0 = x.g.steps[0][1], prev = b0, mover = false;
    x.g.steps.forEach(function(s, i){ if (!i) return; var b = s[1]; if (!b || b === prev) return;
      if (!B(b)) { unplaced.push(x.names.join(', ') + ' → ' + CS_B[L][b] + ' (' + CS_PHL[L][T.ph[i]].toLowerCase() + ')'); prev = b; return; }
      moves.push({ from: prev, to: b, ph: i, names: x.names, first: !mover }); mover = true; prev = b; });
    if (!B(b0)) { unplaced.push(x.names.join(', ') + ': ' + CS_B[L][b0]); return; }
    (startAt[b0] = startAt[b0] || []).push({ names: x.names, mover: mover });
  });
  if (startAt.base) startAt.base = [{ names: startAt.base.reduce(function(a, b){ return a.concat(b.names); }, []), mover: false }];
  var FS = 22, LH = 25, textOps = [], anchor = {};
  g.font = '800 ' + FS + 'px system-ui, sans-serif';
  Object.keys(startAt).forEach(function(k){
    var p = B(k), blocks = startAt[k];
    var maxW = k === 'base' ? 520 : 220;
    blocks.forEach(function(blk){ var Ls = [], cur = ''; blk.names.forEach(function(nm){ var tst = cur ? cur + ', ' + nm : nm; if (cur && g.measureText(tst).width > maxW) { Ls.push(cur); cur = nm; } else cur = tst; }); if (cur) Ls.push(cur); blk.lines = Ls; });
    var tot = blocks.reduce(function(a, b){ return a + b.lines.length * LH + 14; }, 0);
    var bp = CST_BASE[k], up = bp && bp[5] && bp[5] < bp[3];
    var y = k === 'base' ? (TC.top ? p.y : p.y - tot + 14) : up ? p.ny + LH + 14 - tot : p.ny;
    if (k === 'base' && !TC.top) textOps.push({ s: CS_B[L].base, x: p.x, y: y - 26, small: true });
    blocks.forEach(function(blk){
      var w = Math.max.apply(null, blk.lines.map(function(s){ return g.measureText(s).width; }));
      var cx = Math.min(Math.max(k === 'base' ? p.x : p.nx, CT.map[0] * S + w / 2 + 26), CT.map[1] * S - w / 2 - 26);
      blk.lines.forEach(function(s, i){ textOps.push({ s: s, x: cx, y: y + i * LH }); });
      if (blk.mover) {
        var cy = y + blk.lines.length * LH / 2 - 2, rx = w / 2 + 22, ry = blk.lines.length * LH / 2 + 10;
        g.strokeStyle = '#22c55e'; g.lineWidth = 4.5; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
        blk.names.forEach(function(s){ anchor[s] = [cx, cy, rx]; });
      }
      y += blk.lines.length * LH + 14;
    });
  });
  var tgtUsed = {};
  var COL = ['#22c55e', '#22c55e', '#f59e0b'];
  function arrow(x1, y1, x2, y2, col){
    var mxp = (x1 + x2) / 2 + (y2 - y1) * .18, myp = (y1 + y2) / 2 - (x2 - x1) * .18;
    var ang = Math.atan2(y2 - myp, x2 - mxp), ex = x2 - Math.cos(ang) * 42, ey = y2 - Math.sin(ang) * 42;
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mxp, myp, ex, ey); g.stroke();
    var a2 = Math.atan2(ey - myp, ex - mxp); g.beginPath(); g.moveTo(ex + Math.cos(a2) * 16, ey + Math.sin(a2) * 16);
    g.lineTo(ex + Math.cos(a2 + 2.5) * 20, ey + Math.sin(a2 + 2.5) * 20); g.lineTo(ex + Math.cos(a2 - 2.5) * 20, ey + Math.sin(a2 - 2.5) * 20); g.closePath(); g.fill();
  }
  moves.forEach(function(m){
    var a = m.first ? anchor[m.names[0]] : null, f = B(m.from), to = B(m.to);
    if (!a && !f) return;
    var sx = a ? a[0] : f.x, sy = a ? a[1] : f.y; if (a) sx += (to.x >= sx ? 1 : -1) * a[2];
    arrow(sx, sy, to.x, to.y, COL[m.ph] || COL[1]);
    // Wer hinkommt, steht unter dem Ziel-Schild (z. B. Gruppen, die von der Basis aus losgehen)
    if (!a || !m.first) { var ty = (tgtUsed[m.to] || to.ny); textOps.push({ s: m.names.join(', ') + ' (' + (CS_OPEN[m.to] ? (DE ? 'ab ' + CS_OPEN[m.to] + ' Min.' : 'from min ' + CS_OPEN[m.to]) : CS_PHL[L][T.ph[m.ph]].toLowerCase()) + ')', x: to.nx, y: ty, small: true, col: m.ph === 2 ? '#7a4a00' : '#0b5d1e' }); tgtUsed[m.to] = ty + 22; }
  });
  g.textAlign = 'center'; g.textBaseline = 'top';
  textOps.forEach(function(o){
    g.font = (o.small ? '700 17px' : '800 ' + FS + 'px') + ' system-ui, sans-serif';
    if (me && !o.small) planMe(g, o, me, FS);
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(o.s, o.x, o.y);
    g.fillStyle = o.col || '#0b0f19'; g.fillText(o.s, o.x, o.y);
  });
  if (T.time) { g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = '800 34px system-ui, sans-serif'; g.shadowColor = '#3d8bff'; g.shadowBlur = 12; g.fillText(T.time, CT.time[0] * S, CT.time[1] * S); g.shadowBlur = 0; }
  var bx = CT.box[0] * S, by = CT.box[1] * S, bw = (CT.box[2] - CT.box[0]) * S, bh = (CT.box[3] - CT.box[1]) * S;
  var head = 'BRIEFING' + (T.opp ? (DE ? ' · gegen ' : ' · vs ') + T.opp : '');
  var parts = [DE ? TC.desc : TC.en];
  if (loc) parts.unshift(loc);
  if (T.note) parts.push(T.note);
  if (unplaced.length) parts.push((DE ? 'Ohne Kartenposition: ' : 'Not on the map yet: ') + unplaced.join('; '));
  if (T.s.length) parts.push((DE ? 'Ersatz: ' : 'Substitutes: ') + T.s.join(', '));
  parts.push((DE ? 'Grüne Pfeile: ab 7–10 Min. (sobald das Ziel öffnet) · Orange: ab 14 Min.' : 'Green arrows: from min 7–10 (as soon as the target opens) · Orange: from min 14'));
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  var fs = 24, lines;
  do { g.font = '500 ' + fs + 'px system-ui, sans-serif'; lines = []; parts.forEach(function(p, i){ if (i) lines.push(''); dsmWrap(g, p, bw - 36).forEach(function(l){ lines.push(l); }); }); fs -= 1; }
  while ((lines.length + 2) * fs * 1.32 > bh - 24 && fs > 12);
  fs += 1;
  g.fillStyle = '#7dd3fc'; g.font = '800 ' + (fs + 4) + 'px system-ui, sans-serif'; g.fillText(head, bx + 18, by + 18 + fs + 4);
  g.fillStyle = '#e6f1ff'; g.font = '500 ' + fs + 'px system-ui, sans-serif';
  lines.forEach(function(l, i){ g.fillText(l, bx + 18, by + 18 + (fs + 4) * 1.6 + (i + 1) * fs * 1.32); });
  return c.toDataURL(me ? 'image/jpeg' : 'image/png', .88);
}

/* ---------- Schluchtsturm: „Battle Plan“-Tafel (Hauptvariante) ----------
   Vorschlag von Meister Proper: je Gebäude ein Kasten, Namen direkt hinein, Briefing darunter.
   Zurück zur alten Karte mit Pfeilen: CS_PLAN_STYLE = 'map' (csDrawMap/csLoadMapTpl bleiben unverändert erhalten). */
var CS_PLAN_STYLE = 'board';
// Vorlage cs-battleplan.jpg (1437×802): Textfeld [x1,y1,x2,y2] und dunkles Namensschild je Gebäude
var CSB = {
  box: { dc1:[239,86,541,168], dc2:[1024,88,1341,168], sf1:[209,252,502,346], ds2:[1075,252,1370,346], tower:[582,354,855,399],
         ds1:[186,447,493,543], sf2:[1084,449,1385,542], lab:[583,577,855,611], sw1:[146,677,344,738], sw2:[496,677,676,738], sw3:[849,677,1037,738], sw4:[1186,677,1358,738] },
  tag: { dc1:[262,59,504,84], dc2:[1041,59,1307,84], tower:[622,206,816,231], sf1:[233,227,468,252], ds2:[1080,222,1350,247], ds1:[203,425,452,450],
         sf2:[1096,425,1350,450], lab:[612,430,824,457], sw1:[150,639,354,662], sw2:[490,639,692,662], sw3:[846,639,1050,662], sw4:[1184,639,1386,662] }
};
function csLoadBoard(cb){
  if (CS_IMGS.board) return cb(CS_IMGS.board);
  var im = new Image(); im.onload = function(){ im._board = true; CS_IMGS.board = im; cb(im); }; im.onerror = function(){ cb(null); }; im.src = 'cs-battleplan.jpg?v=1';
}
function csLoadTpl(t, lang, cb){ if (CS_PLAN_STYLE === 'board') csLoadBoard(cb); else csLoadMapTpl(t, lang, cb); }
function csDraw(T, t, lang, IMG, me, loc){ return IMG && IMG._board ? csDrawBoard(T, t, lang, IMG, me, loc) : csDrawMap(T, t, lang, IMG, me, loc); }
function csWhen(k, ph, L, phs){ return CS_OPEN[k] ? (L === 'de' ? 'ab ' + CS_OPEN[k] + ' Min.' : 'from min ' + CS_OPEN[k]) : CS_PHL[L][phs[ph]]; }
function csDrawBoard(T, t, lang, IMG, me, loc){
  var DE = lang === 'de', L = DE ? 'de' : 'en', TC = CS_TACTICS[T.tac] || CS_TACTICS.lab, T = Object.assign({ s: [], m: [], ph: TC.ph }, T), groups = csGroupsOf(T);
  var S = 1920 / 1437, W = 1920, HB = Math.round(802 * S);
  // Inhalt je Gebäude: wer dort startet, wer später dazukommt
  var cont = {}, atBase = [], stay = [], unplaced = [];
  function add(k, o){ (cont[k] = cont[k] || []).push(o); }
  groups.forEach(function(x){
    var b0 = x.g.steps[0][1], prev = b0, mv = [];
    x.g.steps.forEach(function(s, i){ if (!i) return; var b = s[1]; if (!b || b === prev) return; mv.push({ to: b, ph: i }); prev = b; });
    if (CSB.box[b0]) add(b0, { k: 'n', names: x.names, out: mv.length ? mv : null });
    else if (mv.length) atBase.push(x.names.join(', ') + ' → ' + mv.map(function(m){ return CS_B[L][m.to] + ' (' + csWhen(m.to, m.ph, L, T.ph) + ')'; }).join(' → '));
    else stay.push(x.names.join(', '));
    mv.forEach(function(m){ if (CSB.box[m.to]) add(m.to, { k: 'in', names: x.names, when: csWhen(m.to, m.ph, L, T.ph), ph: m.ph }); else unplaced.push(x.names.join(', ') + ' → ' + CS_B[L][m.to]); });
  });
  // Briefing-Text vorbereiten (Höhe der Leiste unten richtet sich danach)
  var parts = [];
  if (loc) parts.push(loc);
  parts.push(DE ? TC.desc : TC.en);
  if (atBase.length) parts.push((DE ? 'Start an der Basis: ' : 'Start at the base: ') + atBase.join(' · '));
  if (stay.length) parts.push((DE ? 'Basis & Unterstützung: ' : 'Base & support: ') + stay.join(', '));
  if (unplaced.length) parts.push(unplaced.join('; '));
  if (T.note) parts.push(T.note);
  if (T.s.length) parts.push((DE ? 'Ersatz: ' : 'Substitutes: ') + T.s.join(', '));
  parts.push(DE ? 'Grün: ab 7–10 Min. (sobald das Gebäude öffnet) · Orange: ab 14 Min. · → wechselt später' : 'Green: from min 7–10 (as soon as the building opens) · Orange: from min 14 · → moves later');
  var mc = document.createElement('canvas').getContext('2d'), fs = 26, PADX = 40, lines = [];
  function wrapAll(){ lines = []; mc.font = '500 ' + fs + 'px system-ui, sans-serif'; parts.forEach(function(p, i){ if (i) lines.push(''); dsmWrap(mc, p, W - PADX * 2).forEach(function(l){ lines.push(l); }); }); }
  wrapAll(); while (lines.length > 16 && fs > 18) { fs -= 1; wrapAll(); }
  function lh(l){ return l ? fs * 1.34 : fs * .55; }
  var HS = Math.round(30 + (fs + 8) * 1.7 + lines.reduce(function(a, l){ return a + lh(l); }, 0) + 26), H = HB + HS;
  var c = document.createElement('canvas'); c.width = W; c.height = H;
  var g = c.getContext('2d'); g.drawImage(IMG, 0, 0, W, HB);
  function R(a){ return [a[0] * S, a[1] * S, (a[2] - a[0]) * S, (a[3] - a[1]) * S]; }
  function rr(x, y, w, h, r){ g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
  // Schilder neu beschriften: Sprache und Öffnungszeiten aus dem Skript
  g.textAlign = 'center'; g.textBaseline = 'middle';
  Object.keys(CSB.tag).forEach(function(k){
    var r = R(CSB.tag[k]), x = r[0] + 14 * S, y = r[1] + 2 * S, w = r[2] - 28 * S, h = r[3] - 4 * S;
    var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#363a42'); gr.addColorStop(1, '#1d2027'); g.fillStyle = gr; rr(x, y, w, h, 4); g.fill();
    var txt = CS_B[L][k] + (CS_OPEN[k] ? (DE ? ' (ab ' + CS_OPEN[k] + ' Min.)' : ' (from min ' + CS_OPEN[k] + ')') : ''), f = 24;
    do { g.font = '700 ' + f + 'px system-ui, sans-serif'; f -= 1; } while (g.measureText(txt).width > w - 10 && f > 12);
    g.fillStyle = '#fff'; g.fillText(txt, x + w / 2, y + h / 2 + 1);
  });
  // Namen in die Kästen: Schrift so groß wie möglich, notfalls kleiner
  Object.keys(cont).forEach(function(k){
    var r = R(CSB.box[k]), pad = 10, bw = r[2] - pad * 2, bh = r[3] - 8, f = 26, rows;
    function build(){
      rows = [];
      cont[k].forEach(function(it){
        var pre = it.k === 'in' ? it.when + ': ' : '', col = it.k === 'in' ? (it.ph === 2 ? '#b45309' : '#15803d') : '#0b0f19';
        g.font = (it.k === 'in' ? '700 ' + Math.round(f * .86) : '800 ' + f) + 'px system-ui, sans-serif';
        var cur = pre, fsz = it.k === 'in' ? Math.round(f * .86) : f;
        it.names.forEach(function(nm, i){ var add = (i ? ', ' : '') + nm, tst = cur + add; if (i && g.measureText(tst).width > bw) { rows.push({ s: cur.replace(/^.*?: /, function(m){ return m; }), col: col, f: fsz, w: it.k }); cur = nm; } else cur = tst; });
        rows.push({ s: cur, col: col, f: fsz, w: it.k });
        if (it.out) { var o = '→ ' + it.out.map(function(m){ return CS_B[L][m.to] + ' ' + csWhen(m.to, m.ph, L, T.ph); }).join(' → '); var fo = Math.round(f * .72); g.font = '600 ' + fo + 'px system-ui, sans-serif';
          dsmWrap(g, o, bw).forEach(function(l){ rows.push({ s: l, col: '#475569', f: fo, w: 'out' }); }); }
      });
      return rows.reduce(function(a, b){ return a + b.f * 1.18; }, 0);
    }
    while (build() > bh && f > 11) f -= 1;
    var tot = rows.reduce(function(a, b){ return a + b.f * 1.18; }, 0), y = r[1] + 4 + (bh - tot) / 2, cx = r[0] + r[2] / 2;
    g.textBaseline = 'top';
    rows.forEach(function(o){
      g.font = (o.w === 'n' ? '800 ' : o.w === 'in' ? '700 ' : '600 ') + o.f + 'px system-ui, sans-serif';
      if (me && o.w !== 'out') { var q = { s: o.s.replace(/^[^:]*: /, ''), x: cx + g.measureText(o.s).width / 2 - g.measureText(o.s.replace(/^[^:]*: /, '')).width / 2, y: y }; planMe(g, q, me, o.f); }
      g.fillStyle = o.col; g.fillText(o.s, cx, y + o.f * .09); y += o.f * 1.18;
    });
  });
  // freie Gebäude dezent kennzeichnen
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'italic 600 20px system-ui, sans-serif'; g.fillStyle = 'rgba(71,85,105,.55)';
  Object.keys(CSB.box).forEach(function(k){ if (cont[k]) return; var r = R(CSB.box[k]); g.fillText(DE ? '– nicht besetzt –' : '– not assigned –', r[0] + r[2] / 2, r[1] + r[3] / 2); });
  // Leiste unten: Kopf mit Team, Zeit, Gegner und das Briefing
  var y0 = HB, gb = g.createLinearGradient(0, y0, 0, H); gb.addColorStop(0, '#111827'); gb.addColorStop(1, '#0b1120'); g.fillStyle = gb; g.fillRect(0, y0, W, HS);
  g.fillStyle = '#d4a017'; g.fillRect(0, y0, W, 5);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  var head = 'BRIEFING · Team ' + t + (T.time ? ' · ' + T.time : '') + (T.opp ? (DE ? ' · gegen ' : ' · vs ') + T.opp : '');
  g.fillStyle = '#facc15'; g.font = '800 ' + (fs + 8) + 'px system-ui, sans-serif'; g.fillText(head, PADX, y0 + 30 + fs + 8);
  g.fillStyle = '#e6f1ff'; g.font = '500 ' + fs + 'px system-ui, sans-serif';
  var yy = y0 + 30 + (fs + 8) * 1.7; lines.forEach(function(l){ yy += lh(l); if (l) g.fillText(l, PADX, yy); });
  return c.toDataURL(me ? 'image/jpeg' : 'image/png', .88);
}

/* ---------- Wüstensturm: „4-Team-Aufstellung“ (zusätzliche Variante, Vorlage von Moon/Meister Proper) ----------
   Tabelle je Farbteam (2 Gebäude, Unterstützer, gelber Spieler), Ersatz, Mitte, darunter die Karte ds-lineup-map.jpg (1300×1262).
   Erwartet einen Team-Plan mit Taktik „team4“ (DS_TACTICS.team4). Die alten Plan-Bilder bleiben unverändert. */
var DSL_IMG = null;
function dslLoad(cb){
  if (DSL_IMG) return cb(DSL_IMG);
  var im = new Image(); im.onload = function(){ DSL_IMG = im; cb(im); }; im.onerror = function(){ cb(null); }; im.src = 'ds-lineup-map.jpg?v=1';
}
var DSL_TXT = {
  en: { title:'DESERT STORM – 4-TEAM LINEUP', sub:'Support players initially belong entirely to their color team', supp:'Support Players', subs:'SUBSTITUTES',
        center:'CENTER – AFTER THE OPENING', opt:'optional', onlyJ:'only if J is secure', guide:'STARTING LINEUP = GUIDANCE, NO FIXED BUILDING ASSIGNMENT',
        free:'All players may move freely within their colored area. Starting players should occupy the listed buildings whenever possible, but move together wherever it makes tactical sense.',
        yel:'Yellow: support your color first, gather at 9:30 and move into J together at 10:00.', vs:'vs', none:'–',
        team:{ B:'TEAM BLACK – LEFT', R:'TEAM RED – RIGHT', G:'TEAM GREEN – NORTH', U:'TEAM BLUE – SOUTH' },
        b:{ ref1:'Oil Refinery I', hosp1:'Field Hospital I', hosp2:'Field Hospital II', ref2:'Oil Refinery II', info:'Information Center', hosp4:'Field Hospital IV', hosp3:'Field Hospital III', sci:'Tech Center', silo:'Nuclear Missile Silo', arsenal:'Arsenal', merc:'Mercenary Factory' } },
  de: { title:'WÜSTENSTURM – 4-TEAM-AUFSTELLUNG', sub:'Unterstützer gehören zu Beginn ganz zu ihrem Farbteam', supp:'Unterstützer', subs:'ERSATZ',
        center:'MITTE – NACH DER ÖFFNUNG', opt:'optional', onlyJ:'nur wenn J sicher ist', guide:'STARTAUFSTELLUNG = ORIENTIERUNG, KEINE FESTE GEBÄUDEZUTEILUNG',
        free:'Alle Spieler dürfen sich in ihrem Farbbereich frei bewegen. Startspieler besetzen nach Möglichkeit die genannten Gebäude, bewegen sich aber gemeinsam, wo es taktisch sinnvoll ist.',
        yel:'Gelb: zuerst die eigene Farbe unterstützen, ab 9:30 sammeln und um 10:00 gemeinsam auf J.', vs:'gegen', none:'–',
        team:{ B:'TEAM SCHWARZ – LINKS', R:'TEAM ROT – RECHTS', G:'TEAM GRÜN – NORDEN', U:'TEAM BLAU – SÜDEN' },
        b:{ ref1:'Ölraffinerie I', hosp1:'Feldlazarett I', hosp2:'Feldlazarett II', ref2:'Ölraffinerie II', info:'Infozentrum', hosp4:'Feldlazarett IV', hosp3:'Feldlazarett III', sci:'Tech-Zentrum', silo:'Atomsilo', arsenal:'Waffenlager', merc:'Söldnerfabrik' } }
};
// Buchstaben laut Karte; Farbe der Kopfzeile und Schrift
var DSL_LET = { info:'A', ref1:'B', hosp1:'C', hosp3:'D', hosp4:'E', hosp2:'F', ref2:'G', sci:'H', arsenal:'I', silo:'J', merc:'K' };
var DSL_COL = { B:['#14171f','#ffffff'], R:['#e31b23','#ffffff'], G:['#8bc34a','#14321a'], U:['#1aa3dc','#ffffff'] };
function dslDraw(T, t, lang, IMG, me, loc){
  var X = DSL_TXT[lang === 'de' ? 'de' : 'en'], TC = DS_TACTICS.team4, CO = TC.colors;
  T = Object.assign({ s: [], m: [] }, T);
  var by = {}; T.m.forEach(function(x){ (by[x[1]] = by[x[1]] || []).push(x[0]); });
  function grp(k){ return by[k] || []; }
  function bOf(k){ var gg = TC.groups.filter(function(x){ return x.k === k; })[0]; return gg.steps[0][1]; }
  var W = 1440, PAD = 0, C1 = 96, C2 = 400, C3 = 470, C4 = W - C1 - C2 - C3;
  var HDR = 92, SUB = 62, BAR = 56, ROW = 72;
  var mc = document.createElement('canvas').getContext('2d');
  // Ersatz-Zeile und Hinweistext umbrechen (Höhe vorab berechnen)
  mc.font = '600 26px system-ui, sans-serif';
  var subsTxt = T.s.length ? T.s.join(' · ') : X.none, subsL = dsmWrap(mc, subsTxt, W - 40);
  var freeParts = [X.free, X.yel]; if (loc) freeParts.unshift(loc); if (T.note) freeParts.push(T.note);
  mc.font = '700 24px system-ui, sans-serif';
  var freeL = []; freeParts.forEach(function(p){ dsmWrap(mc, p, W - 80).forEach(function(l){ freeL.push(l); }); });
  var subsH = subsL.length * 36 + 24, freeH = freeL.length * 34 + 30;
  var MW = W, MH = IMG ? Math.round(IMG.naturalHeight * W / IMG.naturalWidth) : 0;
  var H = HDR + SUB + 4 * (BAR + 3 * ROW) + BAR + subsH + BAR + 3 * ROW + BAR + freeH + MH;
  var c = document.createElement('canvas'); c.width = W; c.height = H;
  var g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  g.textBaseline = 'middle';
  function fit(txt, w, size, weight){ var f = size; do { g.font = weight + ' ' + f + 'px system-ui, sans-serif'; f -= 1; } while (g.measureText(txt).width > w && f > 12); return f + 1; }
  function text(txt, x, y, w, size, weight, col, align){ fit(txt, w, size, weight); g.fillStyle = col; g.textAlign = align || 'left'; g.fillText(txt, align === 'center' ? x + w / 2 : x, y); }
  function bar(y, h, bg, txt, col, size){ g.fillStyle = bg; g.fillRect(0, y, W, h); text(txt, 20, y + h / 2 + 1, W - 40, size || 30, '800', col, 'center'); }
  function cell(x, y, w, h, bg){ g.fillStyle = bg; g.fillRect(x, y, w, h); g.strokeStyle = '#c9cdd3'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2); }
  function names(arr, x, y, w, h, bg, col, weight){
    cell(x, y, w, h, bg); var s = arr.length ? arr.join(' · ') : X.none;
    if (me && arr.indexOf(me) >= 0) { g.fillStyle = '#facc15'; g.fillRect(x + 4, y + 4, w - 8, h - 8); }
    text(s, x + 18, y + h / 2 + 1, w - 36, 28, weight || '500', arr.length ? col : '#9aa1ab');
  }
  var y = 0;
  // Kopf
  g.fillStyle = '#1e4d3b'; g.fillRect(0, 0, W, HDR);
  text(X.title, 200, HDR / 2 + 2, W - 400, 46, '800', '#ffffff', 'center');
  text('TEAM ' + t, W - 190, HDR / 2 + 2, 170, 28, '800', '#ffffff', 'left');
  y = HDR;
  g.fillStyle = '#e5f0dc'; g.fillRect(0, y, W, SUB);
  var subLine = [T.time, T.opp ? X.vs + ' ' + T.opp : ''].filter(Boolean).join(' · ');
  g.font = 'italic 500 26px system-ui, sans-serif';
  text('· ' + X.sub + (subLine ? '   |   ' + subLine : ''), 20, y + SUB / 2 + 1, W - 40, 26, 'italic 500', '#3d6b2e', 'left');
  y += SUB;
  // Farbteams
  ['B','R','G','U'].forEach(function(k){
    var cc = CO[k], col = DSL_COL[k];
    bar(y, BAR, col[0], X.team[k], col[1]); y += BAR;
    cc.h.forEach(function(hk){
      var b = bOf(hk);
      cell(0, y, C1, ROW, '#f3f4f6'); text(DSL_LET[b], 18, y + ROW / 2 + 1, C1 - 30, 30, '800', '#111827');
      cell(C1, y, C2, ROW, '#f3f4f6'); text(X.b[b], C1 + 16, y + ROW / 2 + 1, C2 - 32, 28, '500', '#1f2937');
      names(grp(hk), C1 + C2, y, C3, ROW, '#ffffff', '#1f2937');
      cell(C1 + C2 + C3, y, C4, ROW, '#ffffff');
      y += ROW;
    });
    cell(0, y, C1, ROW, '#eceef1');
    cell(C1, y, C2, ROW, '#eceef1'); text(X.supp, C1 + 16, y + ROW / 2 + 1, C2 - 32, 28, '800', '#111827');
    names(grp(cc.s), C1 + C2, y, C3, ROW, '#eceef1', '#1f2937');
    names(grp(cc.y), C1 + C2 + C3, y, C4, ROW, '#fde60a', '#111827', '800');
    y += ROW;
  });
  // Ersatz
  bar(y, BAR, '#253547', X.subs, '#ffffff'); y += BAR;
  g.fillStyle = '#f7f8fa'; g.fillRect(0, y, W, subsH);
  g.font = '600 26px system-ui, sans-serif'; g.fillStyle = '#111827'; g.textAlign = 'left';
  subsL.forEach(function(l, i){ g.fillText(l, 20, y + 12 + 18 + i * 36); });
  y += subsH;
  // Mitte
  bar(y, BAR, '#f6d70b', X.center, '#3b2f00'); y += BAR;
  var yel = ['yB','yR','yG','yU'].map(function(k){ return grp(k)[0]; }).filter(Boolean);
  [['silo', yel.slice(0, 2), yel.slice(2)], ['arsenal'], ['merc']].forEach(function(r){
    var silo = r[0] === 'silo', bg = silo ? '#fdf6d2' : '#ffffff';
    cell(0, y, C1, ROW, bg); text(DSL_LET[r[0]], 18, y + ROW / 2 + 1, C1 - 30, 30, '800', '#111827');
    cell(C1, y, C2, ROW, bg); text(X.b[r[0]], C1 + 16, y + ROW / 2 + 1, C2 - 32, 28, silo ? '800' : '500', '#1f2937');
    if (silo) { names(r[1], C1 + C2, y, C3, ROW, bg, '#1f2937'); names(r[2], C1 + C2 + C3, y, C4, ROW, bg, '#111827', '800'); }
    else { cell(C1 + C2, y, C3, ROW, bg); text(X.opt, C1 + C2 + 18, y + ROW / 2 + 1, C3 - 36, 28, '500', '#374151');
           cell(C1 + C2 + C3, y, C4, ROW, bg); text(X.onlyJ, C1 + C2 + C3 + 18, y + ROW / 2 + 1, C4 - 36, 28, '500', '#374151'); }
    y += ROW;
  });
  // Hinweis
  bar(y, BAR, '#4677c8', X.guide, '#ffffff', 28); y += BAR;
  g.fillStyle = '#e5f0dc'; g.fillRect(0, y, W, freeH);
  g.font = '700 24px system-ui, sans-serif'; g.fillStyle = '#2f5d27'; g.textAlign = 'center';
  freeL.forEach(function(l, i){ g.fillText(l, W / 2, y + 15 + 17 + i * 34); });
  y += freeH;
  if (IMG) g.drawImage(IMG, 0, y, MW, MH);
  return c.toDataURL(me ? 'image/jpeg' : 'image/png', .9);
}
