const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// Données
const contexteDonnees = { window: {} };
contexteDonnees.window = contexteDonnees;
vm.runInNewContext(fs.readFileSync('js/data/proverbes.js', 'utf8'), contexteDonnees);
const window = contexteDonnees;
const proverbes = window.JS.Donnees.proverbes;
const bas = s => s.toLocaleLowerCase('fr');
const echapper = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parDifficulte = { 1: 0, 2: 0, 3: 0 };
for (const p of proverbes) {
  assert.equal(p.texte.split('___').length, 2, 'un seul trou : ' + p.texte);
  assert.equal(new Set([p.reponse, ...p.leurres].map(bas)).size, 4, 'leurres distincts : ' + p.texte);
  if (!p.second) continue;
  parDifficulte[p.difficulte]++;
  const { mot, leurres } = p.second;
  const occurrences = p.texte.match(new RegExp('(?<![\\p{L}])' + echapper(mot) + '(?![\\p{L}])', 'gu')) || [];
  assert.equal(occurrences.length, 1, '« ' + mot + ' » doit apparaître une seule fois : ' + p.texte);
  assert.equal(leurres.length, 3, '3 leurres pour le second mot : ' + p.texte);
  const tous = [p.reponse, ...p.leurres, mot, ...leurres].map(bas);
  assert.equal(new Set(tous).size, tous.length, 'aucun doublon entre les propositions : ' + p.texte);
}
assert.ok(parDifficulte[1] >= 8 && parDifficulte[2] >= 8 && parDifficulte[3] >= 8, 'assez de proverbes à deux mots');

// Jeu : génère chaque niveau et vérifie les propositions et les trous.
class Element {
  constructor(tag, attrs = {}, ...children) {
    this.tag = tag; this.attrs = attrs || {}; this.children = []; this.classes = new Set(String(this.attrs.class || '').split(' ').filter(Boolean));
    this.disabled = !!this.attrs.disabled; this.value = '';
    this.classList = { add: (...c) => c.forEach(x => this.classes.add(x)), remove: (...c) => c.forEach(x => this.classes.delete(x)),
      toggle: (c, v) => (v ? this.classes.add(c) : this.classes.delete(c)), contains: c => this.classes.has(c) };
    children.flat(Infinity).filter(x => x != null && x !== false).forEach(x => this.children.push(x));
  }
  // Comme le DOM : append natif convertit tout ce qui n'est pas un nœud en texte (un tableau donne « [object …] »).
  append(...children) { children.forEach(x => this.children.push(x instanceof Element ? x : String(x))); }
  set innerHTML(v) { this.children = []; }
  set textContent(v) { this.children = [String(v)]; }
  get textContent() { return this.children.map(x => x instanceof Element ? x.textContent : String(x)).join(''); }
  setAttribute(k, v) { this.attrs[k] = v; }
  removeAttribute(k) { delete this.attrs[k]; }
  focus() {} select() {}
  click() { if (!this.disabled && this.attrs.onclick) this.attrs.onclick({ currentTarget: this }); }
  tous() { return this.children.flatMap(x => x instanceof Element ? [x, ...x.tous()] : []); }
}
const games = {};
let ordrePartie = null;
const JS = {
  Donnees: window.JS.Donnees,
  UI: {
    el: (...a) => new Element(...a),
    melanger: v => {
      const r = [...v].sort(() => Math.random() - 0.5);
      // Le dernier mélange de 8 proverbes donne l'ordre de la partie.
      if (r.length === 8 && r.every(x => x && x.texte)) ordrePartie = r;
      return r;
    },
    normaliser: s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(),
    pluriel: (n, s, p) => n + ' ' + (n > 1 ? (p || s + 's') : s)
  },
  Jeux: { register(g) { games[g.id] = g; } }
};
const document = { head: new Element('head'), getElementById: () => null };
vm.runInNewContext(fs.readFileSync('js/games/proverbes.js', 'utf8'), { JS, document });
const jeu = games.proverbes;
assert.equal(jeu.niveauxMax, 12);
const attendu = { 1: [1, 2], 2: [1, 2], 3: [1, 4], 4: [1, 4], 7: [2, 4], 8: [2, 4], 9: [2, 6], 10: [2, 6] };
for (let niveau = 1; niveau <= 12; niveau++) {
  for (const tout of [true, false]) {
    const root = new Element('div');
    let resultat = null, suite = null;
    jeu.start({ root, niveau, actif: () => !resultat, message() {}, audio: { succes() {}, erreur() {} },
      enchainer(fn) { suite = fn; }, terminer(r) { resultat = r; } });
    for (let q = 0; q < 8; q++) {
      const trous = root.tous().filter(e => e.classes.has('prov-trou'));
      // Le proverbe affiché est le q-ième de la partie ; le texte rendu doit correspondre à son découpage.
      const { decouper, NIVEAUX } = jeu.logique;
      const mots = NIVEAUX[niveau - 1].mots;
      const p = ordrePartie[q];
      const rendu = root.tous().find(e => e.classes.has('prov-texte')).children.map(x => x instanceof Element ? null : x);
      assert.equal(JSON.stringify(rendu), JSON.stringify(decouper(p, mots).map(m => typeof m === 'string' ? m : null)),
        'texte affiché : ' + p.texte);
      const reponses = decouper(p, mots).filter(m => typeof m === 'object').map(m => m.reponse);
      const champs = root.tous().filter(e => e.tag === 'input');
      if (niveau <= 4 || (niveau >= 7 && niveau <= 10)) {
        const [nbTrous, nbChoix] = attendu[niveau];
        assert.equal(trous.length, nbTrous, 'niveau ' + niveau + ' : trous');
        const choix = root.tous().filter(e => e.classes.has('btn-choix'));
        assert.equal(choix.length, nbChoix, 'niveau ' + niveau + ' : propositions');
        reponses.forEach(r => assert.ok(choix.some(b => b.textContent === r),
          'niveau ' + niveau + ' : « ' + r + ' » doit être proposé (' + choix.map(b => b.textContent).join(', ') + ') — ' + p.texte));
        for (const r of reponses) {
          const b = choix.find(x => x.textContent === r);
          (tout ? b : choix.find(x => !reponses.includes(x.textContent) && !x.disabled) || b).click();
        }
        const valider = root.tous().find(e => e.tag === 'button' && e.textContent.includes('Valider'));
        if (valider) valider.click();
      } else {
        assert.equal(trous.length, niveau <= 6 ? 1 : 2, 'niveau ' + niveau + ' : trous');
        assert.equal(champs.length, trous.length, 'niveau ' + niveau + ' : un champ par mot');
        champs.forEach((c, i) => { c.value = tout ? reponses[i] : 'zzzz'; });
        root.tous().find(e => e.tag === 'button' && e.textContent === 'Valider').click();
        if (!tout) {
          root.tous().find(e => e.tag === 'button' && e.textContent === 'Valider').click();
          const choix = root.tous().filter(e => e.classes.has('btn-choix'));
          assert.equal(choix.length, 4, 'niveau ' + niveau + ' : 4 propositions après deux erreurs');
          reponses.forEach(r => choix.find(x => x.textContent === r).click());
          const valider = root.tous().find(e => e.tag === 'button' && e.textContent.includes('Valider'));
          if (valider) valider.click();
        }
      }
      if (suite) { const f = suite; suite = null; f(); }
      else root.tous().find(e => e.tag === 'button' && /suivant|bilan/.test(e.textContent)).click();
    }
    assert.ok(resultat, 'niveau ' + niveau + ' : partie terminée');
    if (tout) assert.equal(resultat.reussite, 1, 'niveau ' + niveau + ' : tout juste = 100 %');
    else assert.ok(resultat.reussite < 1, 'niveau ' + niveau + ' : erreurs pénalisées');
  }
}
console.log('OK : ' + proverbes.length + ' proverbes (' + Object.values(parDifficulte).reduce((a, b) => a + b) +
  ' à deux mots), 12 niveaux jouables.');
