/* Qui se cache ? : données, portraits, plateaux toujours résolubles, questions, éliminations,
 * propositions, aides, barème, parcours complets (moteur et interface simulée) et garde des phases. */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');

/** Comparaison d'objets venant du contexte vm (autre prototype). */
const memes = (a, b, message) => assert.equal(JSON.stringify(a), JSON.stringify(b), message);

/* ----- Faux DOM minimal ----- */
class E {
  constructor(tag, attrs, ...children) {
    this.tag = tag; this.attrs = attrs || {}; this.disabled = !!this.attrs.disabled;
    this.dataset = {}; this.focusCount = 0;
    this.children = children.flat(Infinity).filter(x => x != null && x !== false);
    const self = this;
    this.classList = { add(c) { self.attrs.class = ((self.attrs.class || '') + ' ' + c).trim(); } };
  }
  // Comme le DOM : append() écrit « null » ou « false » en texte (seul el() filtre ces valeurs).
  append(...x) { this.children.push(...x.map(y => (y == null || y === false ? String(y) : y))); }
  set innerHTML(v) { this.children = []; }
  set textContent(v) { this.children = [v]; }
  get text() { return this.children.map(c => (c instanceof E ? c.text : String(c))).join(''); }
  focus() { this.focusCount++; contexte.document.activeElement = this; }
  find(fn) { return [this, ...this.children.flatMap(c => (c instanceof E ? c.find(fn) : []))].filter(fn); }
  click() { if (!this.disabled && this.attrs.onclick) this.attrs.onclick({ currentTarget: this }); }
}

const jeux = {};
let voix = false;
const lectures = [];
let modales = 0;
const contexte = {
  window: {}, console,
  document: { activeElement: null },
  JS: {
    UI: {
      el: (...a) => new E(...a),
      boutonLecture: (texte, libelle) => new E('button', { class: 'btn lecture' }, '🔊 ' + libelle),
      modale: (titre, contenu) => { modales++; return Promise.resolve(true); },
      naviguer() {}
    },
    Audio: { taire() {}, parler: t => lectures.push(t), voixDisponible: () => voix },
    Jeux: { register: g => { jeux[g.id] = g; } }
  }
};
contexte.window.JS = contexte.JS;
vm.createContext(contexte);
for (const f of ['js/data/qui-se-cache.js', 'js/games/qui-se-cache.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), contexte);

const jeu = jeux['qui-se-cache'];
const L = jeu.logique;
const D = contexte.JS.Donnees.quiSeCache;
const parId = new Map(D.personnages.map(p => [p.id, p]));

/** Hasard reproductible (mulberry32). */
function graine(n) {
  let a = n >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ====================== Enregistrement ====================== */
assert.equal(jeu.nom, 'Qui se cache ?');
assert.equal(jeu.categorie, 'auditive');
assert.equal(jeu.icone, '🔎');
assert.equal(jeu.niveauxMax, 4);
for (let n = 1; n <= 4; n++) assert(jeu.descriptionNiveau(n).length > 10);

/* ====================== Données ====================== */
assert.equal(L.validerDonnees(D).length, 0, 'données cohérentes : ' + L.validerDonnees(D).join(' ; '));
assert.equal(D.personnages.length, 24, '24 personnalités');
assert.equal(new Set(D.personnages.map(p => p.id)).size, 24, 'identifiants uniques');
assert.equal(new Set(D.questions.map(q => q.id)).size, D.questions.length, 'questions uniques');
const parUnivers = u => D.personnages.filter(p => p.univers === u).length;
assert.deepEqual([parUnivers('cinema'), parUnivers('chanson'), parUnivers('sport')], [8, 8, 8], 'huit par univers');
const femmes = D.personnages.filter(p => p.attributs.femme).length;
assert(femmes >= 8 && femmes <= 16, 'femmes et hommes');
const credits = fs.readFileSync('CREDITS-PHOTOS.md', 'utf8');
for (const p of D.personnages) {
  for (const q of D.questions) assert.equal(typeof p.attributs[q.attribut], 'boolean', p.id + ' / ' + q.attribut);
  assert(p.sources.every(s => /^https:\/\//.test(s)), 'sources : ' + p.id);
  assert(fs.existsSync(p.portrait), 'portrait local : ' + p.portrait);
  assert(fs.statSync(p.portrait).size > 5000, 'portrait non vide : ' + p.id);
  assert(!/^https?:/.test(p.portrait), 'aucune image distante');
  assert(credits.includes('`qui-se-cache/' + p.id + '.jpg`'), 'portrait crédité : ' + p.id);
  assert(credits.includes(p.photo.source), 'source photo dans les crédits : ' + p.id);
  // Chaque attribut de portrait est retrouvable dans la description ; l'activité visible correspond à l'univers.
  assert(p.descriptionPortrait.includes(p.attributs.couleur ? 'couleur' : 'noir et blanc'), 'description couleur : ' + p.id);
  assert(p.descriptionPortrait.toLowerCase().includes(p.attributs.lunettes ? 'lunettes' : 'pas de lunettes'), 'description lunettes : ' + p.id);
  assert.equal(/nœud papillon/.test(p.descriptionPortrait), true, 'description nœud papillon : ' + p.id);
  assert.equal(/pas de nœud papillon/.test(p.descriptionPortrait), !p.attributs.noeudPapillon, 'nœud papillon cohérent : ' + p.id);
  assert.equal(/ et /.test(p.activite), p.attributs.deuxActivites, 'deux activités visibles sous le portrait : ' + p.id);
  assert.equal(/hors de France|\((Maroc|Égypte|Grèce)\)|Bulgarie/.test(p.ficheCourte), p.attributs.neeEtranger, 'naissance à l’étranger dans la fiche : ' + p.id);
  assert.equal(/Paris/.test(p.ficheCourte), p.attributs.neeParis, 'naissance à Paris dans la fiche : ' + p.id);
  assert.equal(/or olympique/.test(p.ficheCourte), p.attributs.orOlympique, 'médaille dans la fiche : ' + p.id);
}
assert.equal(fs.readdirSync('img/qui-se-cache').filter(f => f.endsWith('.jpg')).length, 24, 'aucun portrait orphelin');
// Au niveau 2 et plus, les 24 personnalités sont toutes distinguables.
assert.equal(new Set(D.personnages.map(p => L.signature(p, L.questionsDuNiveau(D.questions, 2)))).size, 24);
for (let n = 1; n <= 4; n++) assert(L.plateauValide(D.plateauxSecours[n], D, n), 'plateau de secours valide au niveau ' + n);

// Données erronées : détectées.
{
  const casse = JSON.parse(JSON.stringify(D));
  delete casse.personnages[0].attributs.lunettes;
  casse.personnages[1].id = casse.personnages[2].id;
  const erreurs = L.validerDonnees(casse);
  assert(erreurs.some(e => e.includes('lunettes')), 'attribut absent détecté');
  assert(erreurs.some(e => e.includes('double')), 'doublon détecté');
}

/* ====================== Barème ====================== */
memes(L.resultatEnquete(0), { points: 100, bonus: 0 });
memes(L.resultatEnquete(1), { points: 80, bonus: 0 });
memes(L.resultatEnquete(7), { points: 0, bonus: 0 });
{
  const e = (erreurs, questions) => ({ nom: 'X', erreurs, portraits: 9, questions });
  const parfait = L.bilanPartie([e(0, 3), e(0, 4), e(0, 8)]);
  assert.equal(parfait.reussite, 1, 'le repère de questions ne retire aucun point');
  assert.equal(parfait.score, 300);
  const trois = L.bilanPartie([e(1, 3), e(1, 3), e(1, 3)]);
  assert.equal(trois.reussite, 0.8, 'trois erreurs : 80 % exactement');
  assert(trois.reussite >= 0.8, 'le niveau suivant reste accessible');
  assert(L.bilanPartie([e(2, 3), e(1, 3), e(1, 3)]).reussite < 0.8);
  assert(trois.details.includes('X, X et X') && trois.details.includes('3 corrections'));
}

/* ====================== Plateaux, secrets et résolubilité ====================== */
function ensembleIds(partie) { return [...partie.enquete.candidats].map(id => parId.get(id)); }

for (let n = 1; n <= 4; n++) {
  const cfg = L.NIVEAUX[n - 1];
  const qs = L.questionsDuNiveau(D.questions, n);
  let tests = 0;
  for (let s = 1; s <= 250; s++) {
    const rng = graine(n * 1000 + s);
    const plateau = L.construirePlateau(D, n, rng, []);
    assert(plateau && !plateau.secours, 'tirage sans recours au secours (niveau ' + n + ')');
    assert(L.plateauValide(plateau.ids, D, n), 'plateau valide');
    assert.equal(plateau.ids.length, cfg.portraits);
    if (cfg.familiers) assert(plateau.ids.every(id => parId.get(id).familier), 'niveau 1 : personnalités familières');
    const univers = plateau.ids.map(id => parId.get(id).univers);
    for (const u of ['cinema', 'chanson', 'sport']) assert.equal(univers.filter(x => x === u).length, cfg.portraits / 3, 'univers équilibrés');
    // Chaque secret possible : une suite de questions utiles isole le secret en au plus N - 1 questions.
    for (const secret of plateau.ids) {
      let candidats = plateau.ids.map(id => parId.get(id));
      const posees = [];
      while (candidats.length > 1) {
        const utiles = L.questionsUtiles(candidats, qs, posees);
        assert(utiles.length > 0, 'au moins une question utile tant qu’il reste plusieurs candidats');
        const q = utiles[Math.floor(rng() * utiles.length)];
        const rep = parId.get(secret).attributs[q.attribut];
        const ecartes = L.eliminationsAttendues(candidats, q, rep);
        assert(ecartes.length > 0 && ecartes.length < candidats.length, 'une question utile écarte sans tout écarter');
        assert(!ecartes.includes(secret), 'le secret n’est jamais écarté');
        // Les deux branches donnent exactement les exclusions attendues.
        const autre = L.eliminationsAttendues(candidats, q, !rep);
        assert.equal(ecartes.length + autre.length, candidats.length);
        assert(ecartes.every(id => !autre.includes(id)));
        candidats = candidats.filter(p => !ecartes.includes(p.id));
        posees.push(q.id);
        assert(candidats.some(p => p.id === secret));
      }
      assert(posees.length <= cfg.portraits - 1, 'isolé en au plus N - 1 questions');
      tests++;
    }
  }
  assert(tests >= 250 * cfg.portraits);
}

// Les secrets ne se répètent pas dans une partie ; un plateau impossible renvoie null, sans boucle infinie.
{
  const peu = { personnages: D.personnages.slice(0, 4), questions: D.questions, plateauxSecours: {} };
  assert.equal(L.construirePlateau(peu, 2, graine(1), []), null, 'données insuffisantes : pas de plateau');
  assert.equal(L.creerPartie(peu, 2, { rng: graine(1) }).erreur, 'plateau');
  const casse = JSON.parse(JSON.stringify(D));
  casse.personnages[0].attributs.couleur = 'oui';
  assert.equal(L.creerPartie(casse, 1, { rng: graine(1) }).erreur, 'donnees');
  // Tous les personnages déjà secrets : plus aucun secret possible.
  assert.equal(L.choisirSecret(['a', 'b'], ['a', 'b'], graine(2)), null);
}

/* ====================== Indépendance vis-à-vis du secret ====================== */
for (let n = 1; n <= 4; n++) {
  for (let s = 1; s <= 40; s++) {
    const partie = L.creerPartie(D, n, { rng: graine(s) });
    const e = partie.enquete;
    const resultats = e.plateau.map(secret => {
      e.secret = secret;
      const visibles = L.questionsVisibles(partie);
      partie.rng = graine(999 + s);
      const conseil = L.questionConseillee(ensembleIds(partie), L.questionsOrdonnees(partie), partie.rng);
      return JSON.stringify([visibles.questions.map(q => q.id), visibles.pages, conseil.id]);
    });
    assert.equal(new Set(resultats).size, 1, 'questions et conseil identiques quel que soit le secret');
  }
}

/* ====================== Moteur : parcours complets ====================== */
/**
 * Joue une partie complète avec le moteur. strategie : { fauxPropositions, mauvaisesValidations, aide }.
 */
function jouerMoteur(niveau, s, strategie) {
  const st = strategie || {};
  const hasardQuestions = st.hasard ? graine(s + 100000) : null;
  const partie = L.creerPartie(D, niveau, { rng: graine(s) });
  assert(!partie.erreur);
  const secrets = [];
  let bilan = null;
  while (!bilan) {
    const e = partie.enquete;
    assert.equal(e.numero, secrets.length + 1);
    assert(!secrets.includes(e.secret), 'secret jamais répété dans la partie');
    secrets.push(e.secret);
    assert(!L.ouvrirProposition(partie).ok, '« J’ai trouvé » indisponible avant une question');
    let faux = st.fauxPropositions || 0;
    let mauvaises = st.mauvaisesValidations || 0;
    while (partie.phase !== L.PHASES.RESULTAT) {
      assert.equal(partie.phase, L.PHASES.QUESTION);
      assert(e.candidats.has(e.secret), 'le secret reste compatible');
      if (e.candidats.size > 1 && !(faux > 0 && e.posees.length)) {
        const utiles = L.questionsOrdonnees(partie);
        const q = st.meilleures
          ? L.questionConseillee(ensembleIds(partie), utiles, () => 0).id
          : hasardQuestions ? utiles[Math.floor(hasardQuestions() * utiles.length)].id
            : st.aide ? (L.aideQuestion(partie), e.conseillee) : L.questionsVisibles(partie).questions[0].id;
        if (!st.meilleures && !hasardQuestions) assert(L.questionsVisibles(partie).questions.some(x => x.id === q), 'la question conseillée est affichée');
        const avant = e.ecartes.size;
        const res = L.poserQuestion(partie, q);
        assert(res.ok);
        assert(!L.poserQuestion(partie, q).ok, 'une question ne se pose qu’une fois');
        assert.equal(e.historique.at(-1).questionId, q, 'historique à jour');
        if (partie.cfg.manuel) {
          assert.equal(partie.phase, L.PHASES.ELIMINATION);
          assert.equal(e.ecartes.size, avant, 'rien n’est écarté avant validation');
          assert(!L.ouvrirProposition(partie).ok, 'pas de proposition pendant l’élimination');
          if (mauvaises > 0) {
            mauvaises--;
            L.basculerSelection(partie, [...e.candidats][0]);   // une carte compatible : sélection fausse
            const r = L.validerElimination(partie);
            assert(r.erreur && partie.phase === L.PHASES.ELIMINATION && e.ecartes.size === avant, 'mauvaise validation sans effet');
            L.aideElimination(partie);
          } else if (st.aide) {
            L.aideElimination(partie);
          } else {
            e.attendus.forEach(id => L.basculerSelection(partie, id));
          }
          assert(L.validerElimination(partie).ok);
        }
        assert.equal(e.ecartes.size, e.plateau.length - e.candidats.size, 'écartés = non compatibles');
        continue;
      }
      assert(L.ouvrirProposition(partie).ok);
      if (faux > 0 && e.candidats.size > 1) {
        faux--;
        const mauvais = [...e.candidats].find(id => id !== e.secret);
        L.choisirProposition(partie, mauvais);
        const n = e.historique.length;
        const r = L.confirmerProposition(partie);
        assert(r.erreur && r.message.startsWith('Ce n’est pas cette personne. Continuons l’enquête.'));
        assert(e.ecartes.has(mauvais) && !e.candidats.has(mauvais), 'proposition fausse écartée');
        assert.equal(e.historique.length, n + 1);
        assert.equal(e.historique.at(-1).type, 'proposition');
        assert(L.ouvrirProposition(partie).ok);
        assert(!L.choisirProposition(partie, mauvais).ok, 'un portrait écarté ne peut plus être proposé');
        L.annulerProposition(partie);
        continue;
      }
      assert(L.choisirProposition(partie, e.secret).ok);
      assert(L.confirmerProposition(partie).trouve);
      assert(!L.confirmerProposition(partie).ok, 'double confirmation ignorée');
    }
    const r = L.enqueteSuivante(partie);
    assert(r.ok);
    if (r.termine) {
      bilan = r.bilan;
      assert(!L.poserQuestion(partie, D.questions[0].id).ok, 'plus aucune question après la fin');
    }
  }
  assert.equal(partie.phase, L.PHASES.TERMINE);
  assert(!L.enqueteSuivante(partie).ok, 'fin de partie une seule fois');
  return { bilan, partie };
}

for (let n = 1; n <= 4; n++) {
  for (let s = 1; s <= 25; s++) {
    const parfait = jouerMoteur(n, s, {});
    assert(parfait.bilan.reussite <= 1 && parfait.bilan.reussite >= 0);
    assert.equal(parfait.bilan.score, Math.round(parfait.bilan.reussite * 300));
    assert(parfait.bilan.details.includes('sans aucune correction'));
    const aide = jouerMoteur(n, s, { aide: true });
    assert(aide.bilan.reussite < 1, 'les indices diminuent la réussite');
    // Une proposition fausse par enquête, quand il reste au moins deux portraits après la première question.
    const fautes = jouerMoteur(n, s, { fauxPropositions: 1 });
    const nbFautes = fautes.partie.enquetes.reduce((t, e) => t + e.propositionsFausses, 0);
    assert(nbFautes >= 1 && nbFautes <= 3);
    assert(fautes.partie.enquetes.every(e => e.erreurs === e.propositionsFausses + e.validationsFausses));
    assert(fautes.bilan.reussite <= (300 - 20 * nbFautes) / 300);
    if (nbFautes === 3) { assert(fautes.bilan.reussite <= 0.8); assert(fautes.bilan.score <= 240); }
    if (L.NIVEAUX[n - 1].manuel) {
      const val = jouerMoteur(n, s, { mauvaisesValidations: 1 });
      assert(val.bilan.reussite <= 0.8);
      assert(val.bilan.score <= 240);
    }
  }
}

/* ====================== Élimination manuelle : même règle pour toute carte compatible ====================== */
for (let s = 1; s <= 60; s++) {
  const partie = L.creerPartie(D, 3 + (s % 2), { rng: graine(s) });
  const e = partie.enquete;
  L.poserQuestion(partie, L.questionsVisibles(partie).questions[0].id);
  const restants = [...e.candidats];
  const autres = restants.filter(id => id !== e.secret);
  const essai = id => {
    e.selection = new Set(e.attendus);
    L.basculerSelection(partie, id);
    const avantErreurs = e.erreurs;
    const r = L.validerElimination(partie);
    return { refuse: !!r.erreur, message: r.message.replace(/« .* »/, ''), compte: e.erreurs - avantErreurs, ecartes: e.ecartes.size };
  };
  const avecSecret = essai(e.secret);
  if (autres.length) {
    const avecAutre = essai(autres[0]);
    assert.deepEqual(avecSecret, avecAutre, 'le secret et une autre carte compatible sont traités pareil');
  }
  assert(avecSecret.refuse && avecSecret.ecartes === 0);
  // Une sélection modifiée avant validation ne compte pas : seule la validation compte.
  const avant = e.erreurs;
  e.selection = new Set();
  [...e.attendus].forEach(id => { L.basculerSelection(partie, id); L.basculerSelection(partie, id); L.basculerSelection(partie, id); });
  assert.equal(e.erreurs, avant);
  assert(L.validerElimination(partie).ok);
}

/* ====================== Interface simulée ====================== */
const boutons = (racine, debut) => racine.find(x => x.tag === 'button' && x.text.includes(debut));
const bouton = (racine, debut) => boutons(racine, debut)[0];

function partieUI(niveau, scenario, options) {
  const root = new E('div');
  const messages = [];
  const temporisations = [];
  let resultat, appels = 0, actif = true, pause = false;
  voix = !!(options && options.voix);
  const ctx = {
    plusTard: (fn, ms) => temporisations.push({ fn, ms }),
    root, niveau, actif: () => actif, enPause: () => pause,
    message: (t, type) => messages.push({ t, type }),
    audio: { succes() {}, erreur() {} },
    terminer: r => { resultat = r; appels++; actif = false; }
  };
  const realRandom = Math.random;
  const rng = graine((options && options.graine) || 7);
  Math.random = rng;
  let nettoyer;
  try {
    nettoyer = jeu.start(ctx);
    scenario({ root, messages, temporisations, setPause: v => { pause = v; }, setActif: v => { actif = v; } });
  } finally { Math.random = realRandom; }
  assert.equal(typeof nettoyer, 'function');
  nettoyer();
  return { resultat, appels, messages, root };
}

/** Lit l'état affiché pour retrouver le secret : on interroge le moteur via les réponses visibles. */
function jouerEnqueteUI(root, opts) {
  const o = opts || {};
  let garde = 0;
  for (;;) {
    assert(garde++ < 40, 'enquête terminée en un nombre raisonnable d’actions');
    textesVus.push(root.text);
    const restants = root.find(x => x.attrs && x.attrs.class && x.attrs.class.includes('qsc-carte') && !x.attrs.class.includes('qsc-carte-principal')
      && !x.attrs.class.includes('qsc-ecartee'));
    if (bouton(root, 'Enquête suivante') || bouton(root, 'Voir mon bilan')) return;
    if (bouton(root, 'Valider mes choix')) {
      if (o.erreurManuelle) { o.erreurManuelle = false; bouton(root, 'Valider mes choix').click(); }
      bouton(root, 'Aidez-moi').click();
      assert(root.find(x => x.attrs['aria-pressed'] === 'true').length > 0, 'l’aide sélectionne les portraits');
      bouton(root, 'Valider mes choix').click();
      continue;
    }
    if (bouton(root, 'Je propose')) { bouton(root, 'Je propose').click(); continue; }
    if (bouton(root, 'Revenir à l’enquête')) {
      const cartes = root.find(x => x.tag === 'button' && x.attrs.class === 'qsc-carte-principal');
      // Proposition fausse volontaire, sinon la seule carte restante.
      const idx = o.erreurProposition && cartes.length > 1 ? 1 : 0;
      if (o.erreurProposition && cartes.length > 1) o.erreurProposition = false;
      cartes[idx].click();
      assert.equal(cartes[idx].attrs['aria-pressed'], 'false', 'ancien rendu non modifié');
      const choisie = root.find(x => x.tag === 'button' && x.attrs['aria-pressed'] === 'true');
      assert.equal(choisie.length, 1, 'un seul portrait choisi');
      bouton(root, 'Je propose').click();
      continue;
    }
    if (restants.length === 1 || (o.erreurProposition && bouton(root, 'J’ai trouvé') && !bouton(root, 'J’ai trouvé').disabled)) {
      bouton(root, 'J’ai trouvé').click();
      continue;
    }
    const q = root.find(x => x.tag === 'button' && (x.attrs.class || '').includes('qsc-question'));
    assert(q.length >= 1 && q.length <= 3, 'une à trois questions affichées');
    if (o.aide) bouton(root, 'Aidez-moi').click();
    const conseillee = q.length && root.find(x => x.tag === 'button' && (x.attrs.class || '').includes('qsc-conseillee'))[0];
    (conseillee || root.find(x => x.tag === 'button' && (x.attrs.class || '').includes('qsc-question'))[0]).click();
  }
}

let propositionsFaussesUI = 0;
let textesVus = [];
for (let n = 1; n <= 4; n++) {
  for (const voixActive of [false, true]) {
    for (const mode of ['simple', 'aide', 'erreurs']) {
      const { resultat, appels, messages, root } = partieUI(n, ({ root, messages, setPause }) => {
        assert(bouton(root, 'J’ai trouvé').disabled, '« J’ai trouvé » attend une première question');
        assert.equal(boutons(root, 'Fiche').length, L.NIVEAUX[n - 1].portraits, 'une fiche par portrait');
        assert(boutons(root, 'Fiche').every(b => b.attrs['aria-label'].startsWith('Fiche de ')));
        // Fiche : consultation gratuite.
        bouton(root, 'Fiche').click();
        // Pendant la pause, rien ne réagit.
        setPause(true);
        const q0 = root.find(x => x.tag === 'button' && (x.attrs.class || '').includes('qsc-question'))[0];
        q0.click();
        assert(root.text.includes('0 question posée'), 'pause : aucune action');
        setPause(false);
        for (let k = 0; k < 3; k++) {
          jouerEnqueteUI(root, { aide: mode === 'aide', erreurProposition: mode === 'erreurs', erreurManuelle: mode === 'erreurs' && L.NIVEAUX[n - 1].manuel });
          assert(root.text.includes('Bravo, c’est bien'), 'résultat affiché');
          const suite = bouton(root, k < 2 ? 'Enquête suivante' : 'Voir mon bilan');
          assert(suite, 'passage volontaire à la suite');
          suite.click();
          suite.click();   // double clic ignoré
          if (k < 2) assert(root.text.includes('Enquête ' + (k + 2) + ' sur 3'));
        }
      }, { voix: voixActive, graine: n * 10 + (voixActive ? 1 : 0) });
      assert.equal(appels, 1, 'terminer appelé une seule fois');
      assert(!/\bnull\b|\bfalse\b|undefined/.test(textesVus.join(' ')), 'aucun « null » affiché');
      if (mode === 'erreurs') {
        // Une erreur n'est possible que s'il reste au moins deux portraits après la première question.
        const fausses = messages.filter(m => m.t.startsWith('Ce n’est pas cette personne. Continuons l’enquête.')).length;
        const manuelles = messages.filter(m => m.t.startsWith('Ce n’est pas tout à fait cela')).length;
        if (L.NIVEAUX[n - 1].manuel) assert.equal(manuelles, 3, 'une validation fausse par enquête');
        assert(resultat.reussite <= (300 - 20 * (fausses + manuelles)) / 300);
        propositionsFaussesUI += fausses;
      } else {
        assert(resultat.reussite >= 0 && resultat.reussite <= 1);
        if (mode === 'aide') assert(resultat.reussite < 1);
      }
      assert(resultat.score >= Math.round(resultat.reussite * 300));
      assert(typeof resultat.details === 'string' && resultat.details.includes('démasquées'));
      assert.equal(root.find(x => x.text && x.attrs && (x.attrs.class || '').includes('lecture')).length > 0 || !voixActive, true);
    }
  }
}

assert(propositionsFaussesUI >= 8, 'le parcours « proposition fausse » est bien exercé dans l’interface');

// Sortie en cours d'enquête : aucun résultat enregistré, et les anciens boutons ne font plus rien.
{
  let ancien;
  const { appels } = partieUI(2, ({ root, setActif }) => {
    ancien = root.find(x => x.tag === 'button' && (x.attrs.class || '').includes('qsc-question'))[0];
    setActif(false);
    ancien.click();
    assert(root.text.includes('0 question posée'));
  });
  assert.equal(appels, 0);
}

// Bouton d'une enquête précédente : ignoré.
{
  const { appels } = partieUI(1, ({ root }) => {
    jouerEnqueteUI(root, {});
    const suite = bouton(root, 'Enquête suivante');
    const aideAncienne = bouton(root, 'Fiche');
    suite.click();
    const avant = root.text;
    suite.click();
    assert.equal(root.text, avant, 'ancien bouton sans effet');
    assert(aideAncienne);
  });
  assert.equal(appels, 0);
}

// Données inutilisables : message compréhensible, rien d'enregistré.
{
  const sauvegarde = contexte.JS.Donnees.quiSeCache;
  contexte.JS.Donnees.quiSeCache = { personnages: sauvegarde.personnages.slice(0, 3), questions: sauvegarde.questions, plateauxSecours: {} };
  const { appels, messages, root } = partieUI(4, () => {});
  contexte.JS.Donnees.quiSeCache = sauvegarde;
  assert.equal(appels, 0);
  assert(messages.at(-1).type === 'erreur' && messages.at(-1).t.includes('ne sera pas comptée'));
  assert(bouton(root, 'Revenir au choix des niveaux'));
}

// Lecture automatique : seulement les réponses et la présentation (jamais tout le plateau).
assert(lectures.length > 0 && lectures.every(t => t.length < 600));

console.log('OK : ' + D.personnages.length + ' personnalités, ' + D.questions.length + ' questions, plateaux des 4 niveaux résolubles pour chaque secret, '
  + 'indépendance vis-à-vis du secret, éliminations manuelles, propositions, aides, barème, parcours moteur et interface.');

// Les indices affectent la progression indépendamment du nombre de questions.
for (const [aides, attendu] of [[0, 100], [2, 80], [3, 70]]) {
  const enquetes = Array.from({ length: 3 }, () => ({ nom: 'X', erreurs: 0, portraits: 9, questions: 8, aides }));
  assert.equal(L.bilanPartie(enquetes).reussite, attendu / 100);
}
assert.equal(L.repereQuestions(6), 4);
assert.equal(L.repereQuestions(9), 6);
assert.equal(L.repereQuestions(12), 7);
// Dernier portrait : réussite immédiate puis progression différée, sans double enregistrement.
const automatique = partieUI(1, ({ root, temporisations }) => {
  for (let n = 1; n <= 3; n++) {
    jouerEnqueteUI(root, {});
    assert(root.text.includes('Passage automatique'));
    assert(!bouton(root, 'J’ai trouvé'), 'aucune confirmation du dernier portrait');
    const attente = temporisations.shift();
    assert(attente && attente.ms === 5000);
    attente.fn();
    attente.fn();
    if (n < 3) assert(root.text.includes('Enquête ' + (n + 1) + ' sur 3'));
  }
});
assert.equal(automatique.appels, 1);
// Un clic sur la suite avant la fin du délai invalide la temporisation de l’ancienne enquête.
partieUI(1, ({ root, temporisations }) => {
  jouerEnqueteUI(root, {});
  const ancienne = temporisations.shift();
  bouton(root, 'Enquête suivante').click();
  ancienne.fn();
  assert(root.text.includes('Enquête 2 sur 3'));
});

// Temporisation devenue obsolète après fermeture du jeu.
let rappelApresSortie;
const sortie = partieUI(1, ({ root, temporisations }) => {
  jouerEnqueteUI(root, {});
  rappelApresSortie = temporisations.shift().fn;
});
const avantSortie = sortie.root.text;
rappelApresSortie();
assert.equal(sortie.root.text, avantSortie);
assert.equal(sortie.appels, 0);
// Le mode manuel termine automatiquement après la validation des éliminations.
partieUI(3, ({ root, temporisations }) => {
  jouerEnqueteUI(root, {});
  assert(root.text.includes('Passage automatique'));
  assert(!bouton(root, 'J’ai trouvé'));
  assert.equal(temporisations.length, 1);
});

/* La qualité d'une question dépend du partage proposé, jamais de la réponse chanceuse. */
{
  const candidats = Array.from({ length: 6 }, (_, i) => ({ id: String(i), attributs: { equilibre: i < 3, moyen: i < 2, faible: i < 1 } }));
  const qs = ['equilibre', 'moyen', 'faible'].map(attribut => ({ id: attribut, attribut }));
  assert.equal(L.qualiteQuestion(qs[0], candidats, qs, 40).malus, 0);
  assert.equal(L.qualiteQuestion(qs[1], candidats, qs, 40).malus, 40);
  assert.equal(L.qualiteQuestion(qs[2], candidats, qs, 40).malus, 80);
  assert.equal(L.qualiteQuestion(qs[1], candidats, qs.slice(1), 40).malus, 0, 'le meilleur partage réellement disponible est gratuit');
  assert.equal(L.resultatEnquete(0, 0, 80).points, 20, 'trouver vite par chance ne supprime pas le malus');
}

// Vérifier le calcul dans le moteur, avec les mêmes questions et tous les secrets possibles.
let questionsFaiblesVerifiees = 0;
for (let seed = 1; seed <= 30; seed++) {
  const initiale = L.creerPartie(D, 1, { rng: graine(seed) });
  const utiles = L.questionsOrdonnees(initiale);
  const candidats = ensembleIds(initiale);
  const faible = utiles.find(q => L.qualiteQuestion(q, candidats, utiles, L.NIVEAUX[0].poidsStrategie).malus > 0);
  if (!faible) continue;
  const malus = L.qualiteQuestion(faible, candidats, utiles, L.NIVEAUX[0].poidsStrategie).malus;
  for (const secret of initiale.enquete.plateau) {
    const partie = L.creerPartie(D, 1, { rng: graine(seed) });
    partie.enquete.secret = secret;
    assert(L.poserQuestion(partie, faible.id).ok);
    assert.equal(partie.enquete.malusStrategie, malus);
    assert.equal(L.resumeEnquete(partie, partie.enquete).points, 100 - malus);
    L.poserQuestion(partie, faible.id);
    assert.equal(partie.enquete.malusStrategie, malus, 'un double clic ne double pas le malus');
    questionsFaiblesVerifiees++;
  }
  // Une bonne proposition anticipée est pénalisée une seule fois.
  const partie = L.creerPartie(D, 1, { rng: graine(seed) });
  const meilleure = L.questionConseillee(ensembleIds(partie), L.questionsOrdonnees(partie), () => 0);
  const groupe = partie.enquete.plateau.filter(id => parId.get(id).attributs[meilleure.attribut]);
  const autre = partie.enquete.plateau.filter(id => !parId.get(id).attributs[meilleure.attribut]);
  partie.enquete.secret = (groupe.length > 1 ? groupe : autre)[0];
  L.poserQuestion(partie, meilleure.id);
  assert(partie.enquete.candidats.size > 1);
  L.ouvrirProposition(partie);
  L.choisirProposition(partie, partie.enquete.secret);
  assert(L.confirmerProposition(partie).trouve);
  assert.equal(L.resumeEnquete(partie, partie.enquete).points, 60);
  L.confirmerProposition(partie);
  assert.equal(partie.enquete.malusStrategie, 40);
}
assert(questionsFaiblesVerifiees > 0);

// Comparer le hasard et la déduction sur les mêmes plateaux et secrets.
const simulations = 1000;
for (let niveau = 1; niveau <= 4; niveau++) {
  let validationsHasard = 0;
  let validationsPremierBouton = 0;
  for (let seed = 1; seed <= simulations; seed++) {
    const hasard = jouerMoteur(niveau, seed, { hasard: true });
    const premier = jouerMoteur(niveau, seed, {});
    const reflechi = jouerMoteur(niveau, seed, { meilleures: true });
    if (hasard.bilan.reussite >= 0.8) validationsHasard++;
    if (premier.bilan.reussite >= 0.8) validationsPremierBouton++;
    assert.equal(reflechi.bilan.reussite, 1, 'une enquête réfléchie sans indice ni erreur peut obtenir 100 %');
  }
  console.log('Niveau ' + niveau + ' : seuil de 80 % atteint ' + validationsHasard + '/' + simulations
    + ' fois au hasard et ' + validationsPremierBouton + '/' + simulations + ' fois avec le premier bouton.');
  const maximumAuHasard = niveau === 1 ? 0.15 : 0.05;
  assert(validationsHasard / simulations < maximumAuHasard, 'le hasard doit rarement atteindre le seuil');
  assert(validationsPremierBouton / simulations < maximumAuHasard, 'cliquer toujours au même endroit doit rarement atteindre le seuil');
}

// La pénalité de stratégie est visible immédiatement après une question peu efficace.
partieUI(1, ({ root }) => {
  const noms = root.find(x => x.attrs.class === 'qsc-nom').map(x => x.text);
  const candidats = D.personnages.filter(p => noms.includes(p.nom));
  const utiles = L.questionsUtiles(candidats, L.questionsDuNiveau(D.questions, 1), []);
  let mauvaisBouton;
  let malus;
  for (let page = 0; page < 6 && !mauvaisBouton; page++) {
    for (const b of root.find(x => x.tag === 'button' && (x.attrs.class || '').includes('qsc-question'))) {
      const q = utiles.find(q => b.text.includes(q.texte));
      if (q && L.qualiteQuestion(q, candidats, utiles, L.NIVEAUX[0].poidsStrategie).malus > 0) {
        mauvaisBouton = b;
        malus = L.qualiteQuestion(q, candidats, utiles, L.NIVEAUX[0].poidsStrategie).malus;
        break;
      }
    }
    if (!mauvaisBouton) bouton(root, 'Autres questions').click();
  }
  assert(mauvaisBouton, 'question peu efficace disponible');
  mauvaisBouton.click();
  assert(root.text.includes('Réussite : ' + (100 - malus) + ' %'));
  assert(root.text.includes('Cette question garantissait'));
});
