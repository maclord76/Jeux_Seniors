const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor(tag, attrs = {}, ...children) {
    this.tag = tag;
    this.attrs = attrs || {};
    this.children = children.flat().filter(x => x != null);
    this.disabled = !!this.attrs.disabled;
    this.parentNode = null;
    this.adopter(this.children);
  }
  adopter(children) { children.forEach(x => { if (x instanceof Element) x.parentNode = this; }); }
  append(...children) { this.children.push(...children.flat()); this.adopter(children.flat()); }
  replaceChildren(...children) {
    this.children.forEach(x => { if (x instanceof Element) x.parentNode = null; });
    this.children = children.flat().filter(x => x != null);
    this.adopter(this.children);
  }
  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter(x => x !== this);
    this.parentNode = null;
  }
  setAttribute(key, value) { this.attrs[key] = value; }
  getAttribute(key) { return this.attrs[key]; }
  set textContent(value) { this.children = [String(value)]; }
  get textContent() { return this.children.map(x => x instanceof Element ? x.textContent : String(x)).join(''); }
  querySelectorAll(selector) { return this.children.filter(x => x instanceof Element && x.tag === selector); }
  querySelector(selector) { return this.querySelectorAll(selector)[0]; }
  focus() {}
  click() { if (!this.disabled) this.attrs.onclick({ currentTarget: this }); }
}
const document = { head: new Element('head'), getElementById() { return null; } };
const games = {};
let decorsMelanges = 0;
let autresDecorsMelanges = 0;
const context = { document, JS: { UI: {
  el: (...args) => new Element(...args),
  boutonJauge: (libelle, duree, onclick) => new Element('button', { onclick }, libelle),
  melanger(values) {
    if (values.length === 4) {
      const debut = autresDecorsMelanges++ % 4;
      return [...values.slice(debut), ...values.slice(0, debut)];
    }
    if (values.length === 3) {
      const debut = decorsMelanges++ % 3;
      return [...values.slice(debut), ...values.slice(0, debut)];
    }
    return [...values].reverse();
  }
}, Jeux: { register(game) { games[game.id] = game; } } } };
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/games/changement-scene.js', 'utf8'), context);
const game = games['quest-ce-qui-a-change'];
assert.ok(game && game.categorie === 'visuelle');
const scenes = [
  { dossier: 'changement-cuisine', objets: ['fruit', 'tasse', 'assiette', 'torchon', 'arrosoir'] },
  { dossier: 'changement-salon', objets: ['coussin', 'livre', 'theiere', 'vase', 'horloge'] },
  { dossier: 'changement-veranda', objets: ['bottes', 'lavande', 'arrosoir', 'chapeau', 'nichoir'] },
  { dossier: 'changement-chambre', objets: ['lampe', 'tableau', 'plaid', 'reveil', 'chaussons'] },
  { dossier: 'changement-salle-bain', objets: ['serviette', 'miroir', 'savon', 'tapis', 'fougere'] }
];
for (const { dossier, objets } of scenes) {
  for (const objet of objets) {
    for (let variante = 0; variante < 5; variante++) {
      assert.ok(fs.existsSync(`img/${dossier}/${objet}-${variante}.png`),
        `Zone contextualisée manquante : ${dossier}/${objet}-${variante}`);
    }
  }
  assert.ok(fs.existsSync(`img/${dossier}/planche-5x5.png`));
}
assert.ok(fs.existsSync('img/changement-salon/reference.png'));
assert.ok(fs.existsSync('img/changement-veranda/reference.png'));
assert.ok(fs.existsSync('img/changement-chambre/reference.png'));
assert.ok(fs.existsSync('img/changement-salle-bain/reference.png'));
const decorsGlobaux = new Set();
for (let level = 1; level <= game.niveauxMax; level++) {
  for (const correct of [true, false]) {
    const root = new Element('div');
    let result, completions = 0, active = true, enchainement = null;
    let minuteries = [];
    // Simule l'écoulement du temps : exécute toutes les minuteries en attente.
    const avancer = () => { const enAttente = minuteries; minuteries = []; enAttente.forEach(fn => { if (active) fn(); }); };
    const cleanup = game.start({ root, niveau: level, actif: () => active,
      plusTard(fn) { minuteries.push(fn); }, enchainer(fn) { enchainement = fn; },
      message() {}, audio: { succes() {} }, terminer(value) { result = value; completions++; active = false; } });
    const [counter, instruction, scene, choices, actions] = root.children[0].children;
    const picture = () => scene.children.filter(x => !x.attrs.class.includes('fondu-sortant')).map(x => x.attrs.style);
    const decorsVus = new Set();
    for (let round = 1; round <= 3; round++) {
      assert.equal(counter.textContent, 'Scène ' + round + ' sur 3');
      assert.equal(choices.children.length, 0);
      const before = picture();
      assert.equal(before.length, 5);
      const decor = scene.getAttribute('style');
      assert.match(decor, /background-image:url\("img\/(?:scene-cuisine-exemple-v3|changement-(?:salon|veranda|chambre|salle-bain)\/reference)\.png"\)/);
      decorsVus.add(decor);
      decorsGlobaux.add(decor);
      assert.ok(before.every(style => /background-image:url\("img\/changement-(?:cuisine|salon|veranda|chambre|salle-bain)\/[\w-]+-[0-4]\.png"\)/.test(style)));
      const ready = actions.children[0];
      ready.click();
      ready.click();
      assert.equal(choices.children.length, 5);
      const after = picture();
      const changed = before.map((style, index) => style !== after[index] ? index : -1).filter(x => x >= 0);
      assert.equal(changed.length, level);
      // Fondu enchaîné : l'ancienne version de chaque objet modifié s'efface sous la nouvelle.
      const sortants = scene.children.filter(x => x.attrs.class.includes('fondu-sortant'));
      assert.deepEqual(sortants.map(x => x.attrs.style).sort(), changed.map(i => before[i]).sort());
      assert.ok(scene.children.indexOf(sortants[sortants.length - 1]) < level, 'les anciennes versions restent dessous');
      const entrants = scene.children.filter(x => x.attrs.class.includes('fondu-entrant'));
      assert.deepEqual(entrants.map(x => x.attrs.style), changed.map(i => after[i]));
      avancer();
      assert.equal(scene.children.length, 5, 'les anciennes versions sont retirées après le fondu');
      assert.deepEqual(picture(), after);
      assert.equal(actions.children[0].disabled, true);
      const picks = correct ? changed : [...changed.slice(0, level - 1), ...Array.from({length:5}, (_,i) => i).filter(i => !changed.includes(i))].slice(0, level);
      const picked = new Set();
      for (const index of picks) if (!picked.has(index)) { choices.children[index].click(); picked.add(index); }
      for (let i = 0; picked.size < level; i++) if (!picked.has(i)) { choices.children[i].click(); picked.add(i); }
      if (correct) {
        const first = changed[0];
        choices.children[first].click();
        assert.equal(choices.children[first].attrs['aria-pressed'], 'false');
        assert.equal(actions.children[0].disabled, true);
        choices.children[first].click();
      }
      assert.equal(actions.children[0].disabled, false);
      actions.children[0].click();
      assert.ok(instruction.textContent.includes(correct ? 'Bravo' : 'modifiés'));
      assert.ok(choices.children.every(button => button.disabled));
      if (correct) {
        // Tout retrouvé : la scène suivante s'enchaîne seule.
        assert.equal(actions.children.length, 0);
        assert.equal(typeof enchainement, 'function');
        const suite = enchainement;
        enchainement = null;
        suite();
      } else actions.children[0].click();
    }
    assert.equal(decorsVus.size, 3);
    assert.ok([...decorsVus].some(decor => decor.includes('changement-salle-bain/reference.png')));
    assert.equal(completions, 1);
    assert.equal(result.reussite, correct ? 1 : Math.max(0, (level - 2) / level));
    const final = result;
    cleanup();
    assert.equal(completions, 1);
    assert.equal(result, final);
  }
}
assert.equal(decorsGlobaux.size, 5);
console.log('OK : 5 planches 5 × 5, salle de bain présente, trois décors distincts par partie, cinq zones chacun, 4 niveaux et progression.');
