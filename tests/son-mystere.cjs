/* Le son mystère : données, tirage, choix par niveau et parcours complets (bonnes réponses, erreurs, son illisible). */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');

class E {
  constructor(tag, attrs, ...children) {
    this.tag = tag; this.attrs = attrs || {}; this.disabled = !!this.attrs.disabled;
    this.children = children.flat(Infinity).filter(x => x != null && x !== false);
    this.classList = { add() {}, remove() {} };
  }
  append(...x) { this.children.push(...x.flat(Infinity).filter(y => y != null)); }
  set innerHTML(v) { this.children = []; }
  set textContent(v) { this.children = [v]; }
  get textContent() { return this.text; }
  focus() {}
  querySelector(sel) { return this.find(e => (e.attrs.class || '').split(' ').includes(sel.slice(1)))[0]; }
  find(fn) { return [this, ...this.children.flatMap(c => (c instanceof E ? c.find(fn) : []))].filter(fn); }
  get text() { return this.children.map(c => (c instanceof E ? c.text : c)).join(''); }
  click() { if (!this.disabled) this.attrs.onclick({ currentTarget: this }); }
}

// Faux lecteur audio : lit aussitôt, sauf les fichiers déclarés illisibles.
const illisibles = new Set();
class FauxAudio {
  constructor() { this.ecouteurs = {}; }
  addEventListener(type, fn) { (this.ecouteurs[type] = this.ecouteurs[type] || []).push(fn); }
  emettre(type) { (this.ecouteurs[type] || []).forEach(fn => fn()); }
  removeAttribute() {}
  load() {}
  pause() { this.emettre('pause'); }
  play() {
    const nom = this.src.split('/').pop().replace('.mp3', '');
    this.emettre(illisibles.has(nom) ? 'error' : 'playing');
    return { catch() {} };
  }
}

const jeux = {};
const melanger = t => { const r = t.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const contexte = {
  window: {}, Audio: FauxAudio, setInterval: () => 1, clearInterval() {},
  document: { getElementById: () => true },
  JS: {
    UI: { el: (...a) => new E(...a), melanger, pluriel: (n, s, p) => n + ' ' + (n > 1 ? (p || s + 's') : s) },
    Audio: { taire() {}, parler() {} },
    Jeux: { register: g => { jeux[g.id] = g; } }
  }
};
contexte.window.JS = contexte.JS;
vm.createContext(contexte);
for (const f of ['js/data/sons-mysteres.js', 'js/games/son-mystere.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), contexte);

const jeu = jeux['son-mystere'];
const { tirer, choixPour, bravo, correction, pointsPour, NIVEAUX, MANCHES } = jeu.logique;
const sons = contexte.JS.Donnees.sonsMysteres;
const univers = contexte.JS.Donnees.sonsMysteresUnivers;
const parId = Object.fromEntries(sons.map(s => [s.id, s]));
const incompatibles = (a, b) => (a.exclus || []).includes(b.id) || (b.exclus || []).includes(a.id);

/* ----- Données ----- */
assert(sons.length >= 30, 'au moins une trentaine de sons');
assert.equal(new Set(sons.map(s => s.id)).size, sons.length, 'identifiants uniques');
assert.equal(new Set(sons.map(s => s.nom)).size, sons.length, 'libellés uniques');
const credits = fs.readFileSync('CREDITS-SONS.md', 'utf8');
const avecExtraitsLocaux = fs.existsSync('audio/sons-mysteres');
for (const s of sons) {
  if (avecExtraitsLocaux) {
    assert(fs.existsSync('audio/sons-mysteres/' + s.id + '.mp3'), 'fichier audio de ' + s.id);
    assert(fs.statSync('audio/sons-mysteres/' + s.id + '.mp3').size > 2000, 'fichier non vide : ' + s.id);
  }
  assert(credits.includes('`' + s.id + '.mp3`'), 'source créditée : ' + s.id);
  assert(univers[s.univers], 'univers connu : ' + s.id);
  assert(s.nom && s.emoji && s.phrase, 'libellé, image et phrase : ' + s.id);
  for (const id of (s.proches || []).concat(s.exclus || [])) assert(parId[id], s.id + ' renvoie à un son inconnu : ' + id);
}
if (avecExtraitsLocaux) assert.equal(fs.readdirSync('audio/sons-mysteres').filter(f => f.endsWith('.mp3')).length, sons.length, 'aucun fichier audio orphelin');

/* ----- Formulations ----- */
assert.equal(bravo('une machine à écrire'), 'Bravo, c\'est bien une machine à écrire !');
assert.equal(correction('une machine à écrire'), 'Ce son était celui d\'une machine à écrire.');
assert.equal(correction('le vent'), 'Ce son était celui du vent.');
assert.equal(correction('les vagues de la mer'), 'Ce son était celui des vagues de la mer.');
assert.equal(correction('des oies'), 'Ce son était celui des oies.');
assert.equal(correction('la pluie'), 'Ce son était celui de la pluie.');
assert.equal(correction('l\'eau qui coule du robinet'), 'Ce son était celui de l\'eau qui coule du robinet.');
assert.equal(bravo('des oies'), 'Bravo, ce sont bien des oies !');

/* ----- Malus de réécoute ----- */
assert.equal(pointsPour(0), 1);
assert.equal(pointsPour(1), 0.8);
assert(pointsPour(1) > pointsPour(2) && pointsPour(2) > pointsPour(3), 'chaque réécoute coûte');
assert.equal(pointsPour(50), 0.4, 'une bonne réponse garde toujours des points');

/* ----- Tirage et choix, tous niveaux, nombreuses répétitions ----- */
for (let n = 1; n <= jeu.niveauxMax; n++) {
  for (let essai = 0; essai < 300; essai++) {
    const { questions, reserve } = tirer(n, []);
    assert.equal(questions.length, MANCHES);
    assert.equal(new Set(questions).size, MANCHES, 'pas de son répété dans une partie');
    assert.equal(new Set(questions.map(q => q.univers)).size, MANCHES, 'univers variés');
    assert(questions.every(q => !reserve.includes(q)));
    if (n <= 2) assert(questions.every(q => q.facile), 'sons faciles aux premiers niveaux');
    for (const q of questions) {
      const choix = choixPour(q, n);
      assert.equal(choix.length, NIVEAUX[n - 1].choix, 'nombre de choix au niveau ' + n + ' pour ' + q.id);
      assert.equal(choix.filter(c => c.bonne).length, 1);
      assert.equal(new Set(choix.map(c => c.nom)).size, choix.length, 'choix tous différents');
      const fausses = choix.filter(c => !c.bonne);
      for (const f of fausses.filter(f => f.id)) {
        assert(!incompatibles(parId[f.id], q), 'réponse ambiguë : ' + f.id + ' avec ' + q.id);
        if (n <= 2) assert.notEqual(parId[f.id].univers, q.univers, 'niveaux 1 et 2 : autres univers');
        if (n === 3 || n === 4) assert.equal(parId[f.id].univers, q.univers, 'niveaux 3 et 4 : même univers');
      }
    }
  }
}

// Les sons de la partie précédente ne reviennent pas tout de suite.
for (let essai = 0; essai < 200; essai++) {
  const precedents = tirer(4, []).questions.map(q => q.id);
  assert(tirer(4, precedents).questions.every(q => !precedents.includes(q.id)));
}

/* ----- Parcours complets ----- */
// La bonne réponse est le bouton dont le libellé correspond au fichier que le lecteur vient de lire.
let dernierFichier = null;
const jouer = FauxAudio.prototype.play;
FauxAudio.prototype.play = function () { dernierFichier = this.src.split('/').pop().replace('.mp3', ''); return jouer.call(this); };
function estBonne(b) {
  return b.text.toLowerCase().includes(parId[dernierFichier].nom.slice(1));
}
function partie(niveau, scenario) {
  const root = new E('div');
  const profil = {};
  const messages = [];
  let resultat, appels = 0;
  const attentes = [];   // passages automatiques programmés par le jeu
  const suivre = () => { assert.equal(attentes.length, 1, 'un passage automatique programmé'); attentes.shift()(); };
  const nettoyer = jeu.start({
    root, niveau, profil, actif: () => !resultat, enPause: () => false,
    message: t => messages.push(t), audio: { succes() {}, erreur() {} },
    enchainer: fn => { attentes.push(fn); },
    terminer: r => { resultat = r; appels++; }
  });
  const bouton = debut => root.find(e => e.tag === 'button' && e.text.includes(debut)).at(-1);
  const choix = () => root.find(e => e.tag === 'button' && (e.attrs.class || '').includes('btn-choix'));
  scenario({ root, bouton, choix, messages, profil, suivre, attentes });
  assert.equal(typeof nettoyer, 'function');
  nettoyer();
  return { resultat, appels, profil, messages };
}

for (let n = 1; n <= jeu.niveauxMax; n++) for (const juste of [true, false]) {
  illisibles.clear();
  const { resultat, appels, profil } = partie(n, ({ root, bouton, choix, messages, suivre }) => {
    for (let m = 0; m < MANCHES; m++) {
      assert(choix().every(b => b.disabled), 'réponses bloquées avant la première écoute');
      bouton('Écouter le son').click();
      assert(bouton('Arrêter le son'), 'indication pendant la lecture');
      bouton('Arrêter le son').click();
      bouton('Réécouter le son').click();
      const avant = choix();
      const bonne = avant.find(estBonne);
      (juste ? bonne : avant.find(b => b !== bonne)).click();
      assert(choix().every(b => b.disabled), 'réponses bloquées après le choix');
      assert.equal(choix().filter(b => b.text.includes('✓')).length, 1, 'bonne réponse toujours montrée');
      assert.equal(choix().filter(b => b.text.includes('✗')).length, juste ? 0 : 1);
      assert(messages.at(-1).startsWith(juste ? 'Bravo' : 'Ce son était celui'));
      assert(!bouton('Réécouter le son'), 'réécoute retirée après la réponse');
      const zoneEcoute = root.find(e => e.attrs.class === 'sm-ecoute')[0];
      assert(zoneEcoute.text.includes('Bonne réponse : '), 'résultat à la place du bouton d’écoute');
      assert(zoneEcoute.text.includes(parId[dernierFichier].phrase), 'anecdote avec le résultat');
      assert.equal(root.find(e => e.attrs.class === 'panneau sm-bilan').length, 1, 'un seul résultat');
      const libelle = m === MANCHES - 1 ? 'Voir le résultat' : 'Continuer';
      // Bonne réponse : pas de bouton, le jeu passe seul à la suite ; sinon le joueur continue quand il veut.
      if (juste) { assert(!bouton(libelle)); suivre(); } else bouton(libelle).click();
    }
  });
  assert.equal(appels, 1);
  // Une réécoute par manche avant de répondre : 80 % au lieu de 100 %.
  assert.equal(Math.round(resultat.reussite * 100), juste ? 80 : 0);
  if (juste) assert(resultat.details.includes('3 réécoutes'));
  assert.equal(profil.sonsMysteresRecents.length, MANCHES, 'sons entendus mémorisés');
}

// Un son illisible : la partie continue avec une autre question, et le score ne compte que les manches jouées.
{
  let remplace = null;
  const { resultat, appels } = partie(3, ({ bouton, choix, messages, suivre }) => {
    for (let m = 0; m < MANCHES; m++) {
      if (m === 1) {
        // On rend illisible le son de cette manche, quel qu'il soit.
        const original = FauxAudio.prototype.play;
        FauxAudio.prototype.play = function () { remplace = this.src; this.emettre('error'); return { catch() {} }; };
        bouton('Écouter le son').click();
        FauxAudio.prototype.play = original;
        assert(messages.at(-1).includes('ne peut pas être lu'));
        assert(choix().every(b => b.disabled));
        bouton('Passer à une autre question').click();
      }
      bouton('Écouter le son').click();
      if (m === 1) assert(!remplace.endsWith('/' + dernierFichier + '.mp3'), 'un autre son a été proposé');
      choix().find(estBonne).click();
      suivre();
    }
  });
  assert.equal(appels, 1);
  assert.equal(resultat.reussite, 1);
  assert(resultat.details.includes('3 sons reconnus sur 3'));
}

// Une seule réécoute dans toute la partie, même si le lecteur signale plusieurs fois le début de la lecture :
// elle n'est comptée qu'une fois et le niveau suivant reste accessible (au moins 80 %).
{
  const normal = FauxAudio.prototype.play;
  FauxAudio.prototype.play = function () { const r = normal.call(this); this.emettre('playing'); this.emettre('playing'); return r; };
  const { resultat } = partie(1, ({ bouton, choix, suivre }) => {
    for (let m = 0; m < MANCHES; m++) {
      bouton('Écouter le son').click();
      if (m === 0) { bouton('Arrêter le son').click(); bouton('Réécouter le son').click(); }
      choix().find(estBonne).click();
      suivre();
    }
  });
  FauxAudio.prototype.play = normal;
  assert.equal(Math.round(resultat.reussite * 100), 93);
  assert(resultat.reussite >= 0.8, 'une réécoute ne bloque pas le niveau suivant');
  assert(resultat.details.includes('avec 1 réécoute.'));
}

// Tous les sons illisibles : après trois échecs, la partie s'arrête sans être comptée.
{
  sons.forEach(s => illisibles.add(s.id));
  const { resultat, appels, messages } = partie(2, ({ bouton, root }) => {
    for (let i = 0; i < 2; i++) {
      bouton('Écouter le son').click();
      bouton('Passer à une autre question').click();
    }
    bouton('Écouter le son').click();
    assert(root.find(e => e.tag === 'a' && e.attrs.href === '#/accueil').length, 'retour à l\'accueil proposé');
  });
  assert.equal(appels, 0);
  assert.equal(resultat, undefined);
  assert(messages.at(-1).includes('ne sera pas comptée'));
  illisibles.clear();
}

console.log('OK : ' + sons.length + ' sons, tirages et choix des ' + jeu.niveauxMax + ' niveaux, parcours justes et faux, son illisible, sons indisponibles.');
