/*
 * Vérifie le générateur des mots croisés et des mots fléchés : données, taille, croisements,
 * absence de mot parasite, grille d'un seul tenant, numérotation et cases définition.
 */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');

const games = {};
const context = {
  JS: {
    UI: {
      el: () => ({}),
      melanger: t => { const a = t.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      choisir: t => t[Math.floor(Math.random() * t.length)]
    },
    Jeux: { register: g => { games[g.id] = g; } }
  }
};
context.window = context;
vm.createContext(context);
for (const f of ['js/data/mots.js', 'js/data/mots-croises.js', 'js/games/mots-croises.js', 'js/games/mots-fleches.js']) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), context);
}
const { JS } = context;

/* Données */
let nbDefs = 0;
for (const [id, theme] of Object.entries(JS.Donnees.motsCroises)) {
  const vus = new Set();
  for (const [mot, def, court] of theme.mots) {
    const g = JS.Donnees.motEnGrille(mot);
    assert(g.length >= 3 && g.length <= 10, id + ' : longueur de ' + mot);
    assert(!vus.has(g), id + ' : doublon ' + mot);
    assert(def && def.length > 5, id + ' : définition de ' + mot);
    assert(court && court.length <= 26, id + ' : définition courte de ' + mot + ' (26 caractères au plus)');
    for (const texte of [def, court]) {
      assert(!JS.Donnees.motEnGrille(texte).includes(g), id + ' : la définition de ' + mot + ' contient le mot');
    }
    vus.add(g);
    nbDefs++;
  }
}

/* Grilles */
const bilan = [];
for (const [idJeu, fleches] of [['mots-croises', false], ['mots-fleches', true]]) {
  const jeu = games[idJeu];
  assert(jeu, idJeu + ' enregistré');
  let total = 0;
  for (let n = 1; n <= jeu.niveauxMax; n++) {
    const [nombre, longueurMax, tailleMax] = jeu.NIVEAUX[n - 1];
    for (const idTheme of [null, ...Object.keys(JS.Donnees.motsCroises)]) {
      for (let e = 0; e < (idTheme ? 4 : 60); e++) {
        const p = jeu.genererGrille(n, idTheme);
        assert(p, idJeu + ' : grille niveau ' + n + ' thème ' + idTheme);
        total++;
        assert.equal(p.mots.length, nombre);
        assert(p.lignes <= tailleMax && p.colonnes <= tailleMax, 'taille');
        const L = (l, c) => (l >= 0 && l < p.lignes && c >= 0 && c < p.colonnes ? p.lettres[l][c] : null);
        // Lettres cohérentes et mots dans les bornes
        for (const m of p.mots) {
          assert(m.grille.length <= longueurMax);
          assert.equal(m.cases.length, m.grille.length);
          m.cases.forEach(([l, c], i) => assert.equal(p.lettres[l][c], m.grille[i]));
        }
        // Toute suite de 2 lettres ou plus est exactement un mot posé (pas de mot parasite).
        const attendus = new Set(p.mots.map(m => m.dir + m.l + ',' + m.c + ':' + m.grille));
        const trouves = new Set();
        for (let l = 0; l < p.lignes; l++) for (let c = 0; c < p.colonnes; c++) {
          if (!L(l, c)) continue;
          for (const [dir, dl, dc] of [['h', 0, 1], ['v', 1, 0]]) {
            if (L(l - dl, c - dc)) continue;
            let s = '', x = l, y = c;
            while (L(x, y)) { s += L(x, y); x += dl; y += dc; }
            if (s.length >= 2) trouves.add(dir + l + ',' + c + ':' + s);
          }
        }
        assert.deepEqual([...trouves].sort(), [...attendus].sort(), 'mots parasites');
        // Grille d'un seul tenant
        const depart = p.mots[0].cases[0];
        const vu = new Set([depart.join()]);
        const pile = [depart];
        while (pile.length) {
          const [l, c] = pile.pop();
          for (const [dl, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
            const k = [l + dl, c + dc].join();
            if (L(l + dl, c + dc) && !vu.has(k)) { vu.add(k); pile.push([l + dl, c + dc]); }
          }
        }
        assert.equal(vu.size, p.lettres.flat().filter(Boolean).length, 'connexe');
        // Numérotation : 1..k, dans l'ordre de lecture
        const debuts = [...new Set(p.mots.map(m => m.l + ',' + m.c))]
          .map(k => k.split(',').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        debuts.forEach(([l, c], i) => {
          p.mots.filter(m => m.l === l && m.c === c).forEach(m => assert.equal(m.numero, i + 1));
        });
        // Mots fléchés : case définition juste avant le mot, dans la grille, sans lettre, une par sens.
        if (fleches) {
          let nbDefsGrille = 0;
          for (const m of p.mots) {
            const [l, c] = m.caseDef;
            assert.equal(m.caseDef.join(), (m.dir === 'h' ? [m.l, m.c - 1] : [m.l - 1, m.c]).join(), 'case définition avant le mot');
            assert(l >= 0 && l < p.lignes && c >= 0 && c < p.colonnes, 'case définition dans la grille');
            assert.equal(p.lettres[l][c], null, 'pas de lettre dans une case définition');
            assert.equal(p.definitions.get(l + ',' + c)[m.dir], m, 'case définition enregistrée');
          }
          p.definitions.forEach(d => { nbDefsGrille += Object.keys(d).length; });
          assert.equal(nbDefsGrille, p.mots.length);
        }
      }
    }
  }
  bilan.push(total + ' grilles de ' + jeu.nom.toLowerCase());
}
console.log('OK : ' + Object.keys(JS.Donnees.motsCroises).length + ' thèmes, ' + nbDefs + ' mots avec définition longue et courte ; ' +
  bilan.join(' et ') + ', sans mot parasite, d\'un seul tenant et bien numérotées.');
