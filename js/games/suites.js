/* Suites logiques : trouver l'élément qui continue une suite de nombres ou de symboles. */
(function () {
  'use strict';
  const { el, entier, choisir, melanger } = JS.UI;

  const NB_QUESTIONS = 8;

  // Symboles de formes toutes différentes (jamais distingués par la seule couleur).
  const SYMBOLES = [
    ['⭐', 'étoile'], ['🌙', 'lune'], ['❤️', 'cœur'], ['🍎', 'pomme'], ['🐟', 'poisson'], ['🌸', 'fleur'],
    ['🔔', 'cloche'], ['🍄', 'champignon'], ['🎈', 'ballon'], ['☂️', 'parapluie'], ['🐌', 'escargot'], ['🌲', 'sapin']
  ];

  // Flèches dans le sens des aiguilles d'une montre, par huitièmes de tour.
  const FLECHES = [
    ['↑', 'flèche vers le haut'], ['↗', 'flèche en haut à droite'], ['→', 'flèche vers la droite'], ['↘', 'flèche en bas à droite'],
    ['↓', 'flèche vers le bas'], ['↙', 'flèche en bas à gauche'], ['←', 'flèche vers la gauche'], ['↖', 'flèche en haut à gauche']
  ];

  // Types de questions proposés à chaque niveau.
  const NIVEAUX = [
    ['motif-AB', 'motif-ABC', 'ajout-petit', 'motif-AB', 'ajout-petit'],
    ['motif-AABB', 'motif-ABB', 'ajout-moyen', 'retrait-petit', 'croissance-1'],
    ['motif-ABCD', 'motif-AAB', 'ajout-grand', 'retrait-moyen', 'croissance-1', 'rotation-4'],
    ['double', 'fois-10', 'retrait-grand', 'alternance-simple', 'rotation-4', 'croissance-2', 'ajout-grand'],
    ['alternance', 'carres', 'moitie', 'ajout-tres-grand', 'rotation-4-inverse', 'motif-ABCB'],
    ['ecart-croissant', 'triple', 'entrelacees', 'alternance', 'croissance-motif', 'rotation-8'],
    ['fibonacci', 'ecart-croissant', 'carres', 'entrelacees', 'moitie', 'double-plus-un', 'croissance-motif'],
    ['double-plus-un', 'fibonacci', 'ecart-croissant-2', 'alternance-double', 'carres', 'triple', 'rotation-8']
  ];

  const DESCRIPTIONS = [
    'motifs simples qui se répètent et petits nombres (+1, +2)',
    'motifs doublés, additions et soustractions simples, quantités qui grandissent',
    'motifs de quatre symboles, additions et soustractions plus grandes, flèches qui tournent',
    'doubles, multiplications par 10, alternances simples',
    'alternances, carrés, moitiés et grands nombres',
    'écarts qui grandissent, triples, deux suites mêlées',
    'suites de Fibonacci, doubles plus un, mélanges variés',
    'les suites les plus subtiles, tous types confondus'
  ];

  /* ---------- Fabrication des questions (logique pure) ---------- */

  const nombre = v => ({ texte: String(v), label: String(v), valeur: v });

  /** Quatre choix de nombres distincts dont la réponse ; les pièges plausibles passent en premier. */
  function choixNombres(reponse, pieges) {
    const valeurs = [reponse];
    const candidats = melanger(pieges).concat([reponse + 1, reponse - 1, reponse + 2, reponse - 2, reponse + 10, reponse + 3, reponse + 5]);
    for (const c of candidats) {
      if (valeurs.length >= 4) break;
      if (Number.isInteger(c) && c >= 0 && !valeurs.includes(c)) valeurs.push(c);
    }
    return melanger(valeurs).map(nombre);
  }

  function questionNombres(suite, reponse, pieges, explication, aide) {
    return {
      genre: 'nombres',
      elements: suite.map(nombre),
      reponse: nombre(reponse),
      choix: choixNombres(reponse, pieges),
      explication,
      aide
    };
  }

  function arithmetique(debut, pas, longueur) {
    const t = [];
    for (let i = 0; i < longueur; i++) t.push(debut + i * pas);
    return t;
  }

  function suiteAjout(pasMin, pasMax, debutMax) {
    const d = entier(pasMin, pasMax);
    const suite = arithmetique(entier(1, debutMax), d, 5);
    const rep = suite[4] + d;
    return questionNombres(suite, rep, [rep + 1, rep - 1, rep + d, suite[4] + d + 2],
      'On ajoute ' + d + ' à chaque fois : ' + suite[4] + ' + ' + d + ' = ' + rep + '.',
      'Regardez de combien on avance d\'un nombre au suivant.');
  }

  function suiteRetrait(pasMin, pasMax) {
    const d = entier(pasMin, pasMax);
    const debut = d * 6 + entier(0, 15);
    const suite = arithmetique(debut, -d, 5);
    const rep = suite[4] - d;
    return questionNombres(suite, rep, [rep + 1, rep - 1, suite[4] + d, rep - d],
      'On enlève ' + d + ' à chaque fois : ' + suite[4] + ' − ' + d + ' = ' + rep + '.',
      'Les nombres diminuent : de combien à chaque fois ?');
  }

  function suiteMultiplication(facteur, debutMax, longueur) {
    const suite = [entier(1, debutMax)];
    while (suite.length < longueur) suite.push(suite[suite.length - 1] * facteur);
    const dernier = suite[longueur - 1];
    const rep = dernier * facteur;
    const ecart = dernier - suite[longueur - 2];
    const nomFacteur = facteur === 2 ? ' (on double)' : facteur === 3 ? ' (on triple)' : '';
    return questionNombres(suite, rep, [dernier + ecart, rep + dernier, rep - facteur, rep + 10],
      'On multiplie par ' + facteur + ' à chaque fois' + nomFacteur + ' : ' + dernier + ' × ' + facteur + ' = ' + rep + '.',
      'Comparez chaque nombre au précédent : combien de fois plus grand ?');
  }

  function suiteMoitie() {
    const rep = entier(1, 6);
    const suite = [];
    for (let k = 5; k >= 1; k--) suite.push(rep * Math.pow(2, k));
    return questionNombres(suite, rep, [rep + 1, rep - 1, rep * 3, suite[4] - rep - 1],
      'On divise par 2 à chaque fois (on prend la moitié) : la moitié de ' + suite[4] + ' est ' + rep + '.',
      'Chaque nombre est la moitié du précédent.');
  }

  function suiteAlternance(plusMin, plusMax, moinsMax) {
    const a = entier(plusMin, plusMax);
    const b = entier(1, Math.min(moinsMax, a - 1));
    const suite = [entier(1, 10)];
    for (let i = 1; i < 7; i++) suite.push(suite[i - 1] + (i % 2 ? a : -b));
    // Le 7e terme vient d'un retrait : le suivant s'obtient donc par un ajout.
    const rep = suite[6] + a;
    return questionNombres(suite, rep, [suite[6] - b, rep + 1, rep - 1, suite[6] + a - b],
      'On ajoute ' + a + ', puis on enlève ' + b + ', et on recommence : ' + suite[6] + ' + ' + a + ' = ' + rep + '.',
      'Regardez les écarts : ils ne sont pas toujours les mêmes, mais ils reviennent.');
  }

  function suiteAlternanceDouble() {
    // ×2 puis −1 : 2, 4, 3, 6, 5, 10, 9…
    const suite = [entier(2, 4)];
    for (let i = 1; i < 7; i++) suite.push(i % 2 ? suite[i - 1] * 2 : suite[i - 1] - 1);
    const rep = suite[6] * 2;
    return questionNombres(suite, rep, [suite[6] - 1, suite[6] + 2, rep - 1, rep + 2],
      'On multiplie par 2, puis on enlève 1, et on recommence : ' + suite[6] + ' × 2 = ' + rep + '.',
      'Deux opérations différentes se succèdent, l\'une après l\'autre.');
  }

  function suiteCarres() {
    const k = entier(1, 4);
    const suite = [];
    for (let i = k; i < k + 5; i++) suite.push(i * i);
    const s = k + 5;
    const rep = s * s;
    const ecart = suite[4] - suite[3];
    return questionNombres(suite, rep, [suite[4] + ecart, rep + 1, rep - 1, rep + s],
      'Ce sont les carrés : ' + k + '×' + k + ', ' + (k + 1) + '×' + (k + 1) + '… le suivant est ' + s + '×' + s + ' = ' + rep + '.',
      'Essayez de multiplier un nombre par lui-même.');
  }

  function suiteEcartCroissant(premierEcart, croissance) {
    const suite = [entier(1, 10)];
    let ecart = premierEcart;
    for (let i = 1; i < 5; i++) { suite.push(suite[i - 1] + ecart); ecart += croissance; }
    const rep = suite[4] + ecart;
    const ecartPrecedent = ecart - croissance;
    return questionNombres(suite, rep, [suite[4] + ecartPrecedent, rep + 1, rep - 1, rep + croissance],
      'L\'écart augmente de ' + croissance + ' à chaque fois : on ajoute ' + premierEcart + ', puis ' + (premierEcart + croissance) +
      ', puis ' + (premierEcart + 2 * croissance) + '… maintenant ' + suite[4] + ' + ' + ecart + ' = ' + rep + '.',
      'Calculez les écarts entre deux nombres voisins : que remarquez-vous ?');
  }

  function suiteEntrelacees() {
    // Deux suites mêlées : 1, 10, 2, 20, 3, 30, ? → 4
    const a = entier(1, 5), pasA = entier(1, 2);
    const b = choisir([10, 20, 50]), pasB = b;
    const suite = [];
    for (let i = 0; i < 3; i++) suite.push(a + i * pasA, b + i * pasB);
    const rep = a + 3 * pasA;
    return questionNombres(suite, rep, [b + 3 * pasB, rep + 1, suite[5] + 1, rep + pasA],
      'Deux suites s\'alternent : ' + a + ', ' + (a + pasA) + ', ' + (a + 2 * pasA) + '… et ' + b + ', ' + (2 * b) + ', ' + (3 * b) +
      '… Le suivant est donc ' + rep + '.',
      'Regardez un nombre sur deux.');
  }

  function suiteFibonacci() {
    const suite = [entier(1, 3)];
    suite.push(suite[0] + entier(0, 2));
    while (suite.length < 6) suite.push(suite[suite.length - 1] + suite[suite.length - 2]);
    const rep = suite[5] + suite[4];
    return questionNombres(suite, rep, [suite[5] * 2, rep + 1, rep - 1, suite[5] + (suite[5] - suite[4])],
      'Chaque nombre est la somme des deux précédents : ' + suite[4] + ' + ' + suite[5] + ' = ' + rep + '.',
      'Additionnez deux nombres voisins.');
  }

  function suiteDoublePlusUn() {
    const suite = [entier(1, 3)];
    while (suite.length < 5) suite.push(suite[suite.length - 1] * 2 + 1);
    const rep = suite[4] * 2 + 1;
    return questionNombres(suite, rep, [rep - 1, rep + 1, suite[4] + (suite[4] - suite[3]), rep + 2],
      'On multiplie par 2, puis on ajoute 1 : ' + suite[4] + ' × 2 + 1 = ' + rep + '.',
      'Chaque nombre est un peu plus que le double du précédent.');
  }

  /* --- Suites de symboles --- */

  const symbole = ([texte, nom]) => ({ texte, label: nom, valeur: texte });

  function listeNoms(lettres, table) {
    return lettres.split('').map(l => table[l][1]).join(', ');
  }

  /** Motif répété (ex. 'AABB') : au moins deux répétitions complètes sont montrées. */
  function suiteMotif(motif) {
    const lettres = [...new Set(motif.split(''))];
    const tires = melanger(SYMBOLES);
    const table = {};
    lettres.forEach((l, i) => { table[l] = tires[i]; });
    const longueur = motif.length * 2 + entier(0, motif.length - 1);
    const suite = [];
    for (let i = 0; i < longueur; i++) suite.push(table[motif[i % motif.length]]);
    const rep = table[motif[longueur % motif.length]];
    const choix = lettres.map(l => table[l]);
    for (let i = lettres.length; choix.length < 4; i++) choix.push(tires[i]);
    return {
      genre: 'symboles',
      elements: suite.map(symbole),
      reponse: symbole(rep),
      choix: melanger(choix).map(symbole),
      explication: 'Le motif « ' + listeNoms(motif, table) + ' » se répète : la suite continue avec « ' + rep[1] + ' ».',
      aide: 'Cherchez le petit groupe de symboles qui revient toujours dans le même ordre.'
    };
  }

  /** Groupes qui grandissent : 1, 2, 3 pommes… */
  function suiteCroissance(pas) {
    const [s, autre] = melanger(SYMBOLES);
    const depart = entier(1, 2);
    const groupe = (sym, n) => ({ texte: sym[0].repeat(n), label: n + ' ' + sym[1] + (n > 1 ? 's' : ''), valeur: sym[0] + n });
    const tailles = [0, 1, 2, 3].map(i => depart + i * pas);
    const n = depart + 4 * pas;
    const rep = groupe(s, n);
    return {
      genre: 'groupes',
      elements: tailles.map(t => groupe(s, t)),
      reponse: rep,
      choix: melanger([rep, groupe(s, n - 1), groupe(s, n + 1), groupe(autre, n)]),
      explication: 'On ajoute ' + (pas === 1 ? 'un symbole' : pas + ' symboles') + ' à chaque fois : il en faut maintenant ' + n + '.',
      aide: 'Comptez les symboles dans chaque case.'
    };
  }

  /** Groupes qui grandissent en alternant deux symboles : A, AB, ABA, ABAB… */
  function suiteCroissanceMotif() {
    const [a, b] = melanger(SYMBOLES);
    const groupe = n => {
      let texte = '';
      for (let i = 0; i < n; i++) texte += (i % 2 ? b : a)[0];
      return { texte, label: n + ' symboles : ' + Array.from({ length: n }, (_, i) => (i % 2 ? b : a)[1]).join(', '), valeur: texte };
    };
    const rep = groupe(5);
    const fauxDebut = b[0] + a[0] + b[0] + a[0] + b[0];
    const fauxFin = a[0] + b[0] + a[0] + b[0] + b[0];
    return {
      genre: 'groupes',
      elements: [1, 2, 3, 4].map(groupe),
      reponse: rep,
      choix: melanger([
        rep,
        groupe(4),
        { texte: fauxDebut, label: '5 symboles : ' + [b, a, b, a, b].map(x => x[1]).join(', '), valeur: fauxDebut },
        { texte: fauxFin, label: '5 symboles : ' + [a, b, a, b, b].map(x => x[1]).join(', '), valeur: fauxFin }
      ]),
      explication: 'Chaque case a un symbole de plus, en continuant l\'alternance « ' + a[1] + ', ' + b[1] + ' » : il faut 5 symboles.',
      aide: 'Comptez les symboles de chaque case, et regardez par quoi ils commencent.'
    };
  }

  /** Flèche qui tourne d'un quart (pas 2) ou d'un huitième de tour (pas 1). */
  function suiteRotation(pas, sens) {
    const debut = entier(0, 7);
    const position = i => FLECHES[(((debut + sens * pas * i) % 8) + 8) % 8];
    const suite = [0, 1, 2, 3, 4, 5].map(position);
    const rep = position(6);
    const cran = d => FLECHES[(((debut + sens * pas * 6 + d) % 8) + 8) % 8];
    const pieges = [position(5), position(7), cran(4), cran(-sens), cran(sens)];
    const choix = [rep];
    for (const p of pieges) if (choix.length < 4 && !choix.includes(p)) choix.push(p);
    for (const f of melanger(FLECHES)) if (choix.length < 4 && !choix.includes(f)) choix.push(f);
    const tour = pas === 2 ? 'd\'un quart de tour' : 'd\'un huitième de tour';
    const direction = sens > 0 ? 'dans le sens des aiguilles d\'une montre' : 'dans le sens inverse des aiguilles d\'une montre';
    return {
      genre: 'fleches',
      elements: suite.map(symbole),
      reponse: symbole(rep),
      choix: melanger(choix).map(symbole),
      explication: 'La flèche tourne ' + tour + ' à chaque fois, ' + direction + '.',
      aide: 'Imaginez une aiguille d\'horloge : dans quel sens tourne-t-elle, et de combien ?'
    };
  }

  const FABRIQUES = {
    'motif-AB': () => suiteMotif('AB'),
    'motif-ABC': () => suiteMotif('ABC'),
    'motif-AABB': () => suiteMotif('AABB'),
    'motif-ABB': () => suiteMotif('ABB'),
    'motif-AAB': () => suiteMotif('AAB'),
    'motif-ABCD': () => suiteMotif('ABCD'),
    'motif-ABCB': () => suiteMotif('ABCB'),
    'croissance-1': () => suiteCroissance(1),
    'croissance-2': () => suiteCroissance(2),
    'croissance-motif': suiteCroissanceMotif,
    'rotation-4': () => suiteRotation(2, 1),
    'rotation-4-inverse': () => suiteRotation(2, -1),
    'rotation-8': () => suiteRotation(1, choisir([1, -1])),
    'ajout-petit': () => suiteAjout(1, 2, 5),
    'ajout-moyen': () => suiteAjout(2, 5, 10),
    'ajout-grand': () => suiteAjout(3, 10, 20),
    'ajout-tres-grand': () => suiteAjout(11, 25, 50),
    'retrait-petit': () => suiteRetrait(1, 2),
    'retrait-moyen': () => suiteRetrait(2, 5),
    'retrait-grand': () => suiteRetrait(3, 9),
    'double': () => suiteMultiplication(2, 3, 5),
    'triple': () => suiteMultiplication(3, 2, 5),
    'fois-10': () => suiteMultiplication(10, 9, 4),
    'moitie': suiteMoitie,
    'alternance-simple': () => suiteAlternance(2, 3, 1),
    'alternance': () => suiteAlternance(3, 6, 4),
    'alternance-double': suiteAlternanceDouble,
    'carres': suiteCarres,
    'ecart-croissant': () => suiteEcartCroissant(1, 1),
    'ecart-croissant-2': () => suiteEcartCroissant(2, 2),
    'entrelacees': suiteEntrelacees,
    'fibonacci': suiteFibonacci,
    'double-plus-un': suiteDoublePlusUn
  };

  /** Les questions d'une partie, en variant les types et sans doublon exact. */
  function genererPartie(niveau) {
    const types = NIVEAUX[niveau - 1];
    let ordre = [];
    const questions = [];
    const vues = new Set();
    let garde = 0;
    while (questions.length < NB_QUESTIONS && garde++ < 200) {
      if (!ordre.length) ordre = melanger(types);
      const q = FABRIQUES[ordre.pop()]();
      const cle = q.elements.map(e => e.valeur).join('|');
      if (vues.has(cle)) continue;
      vues.add(cle);
      questions.push(q);
    }
    return questions;
  }

  /* ---------- Styles propres au jeu ---------- */

  function injecterStyle() {
    if (document.getElementById('style-suites')) return;
    document.head.append(el('style', { id: 'style-suites' }, `
.sui-suite { display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch; gap: 0.6rem; width: 100%; max-width: 50rem; }
.sui-element { display: inline-flex; align-items: center; justify-content: center; min-width: 4rem; min-height: 4rem; padding: 0.3rem 0.6rem; border: 3px solid var(--bord); border-radius: var(--rayon); background: var(--carte); font-size: 1.8rem; font-weight: 700; line-height: 1.1; }
.sui-element.sui-groupe { font-size: 1.5rem; max-width: 9rem; flex-wrap: wrap; word-break: break-all; text-align: center; }
.sui-element.sui-inconnu { border-style: dashed; border-color: var(--primaire); background: var(--primaire-clair); color: var(--primaire); }
.sui-element.sui-trouve { border-style: solid; border-color: var(--succes); background: var(--succes-clair); color: var(--texte); }
.sui-choix .btn-choix { font-size: 1.8rem; min-height: 4.6rem; }
.sui-choix .btn-choix.sui-groupe { font-size: 1.4rem; word-break: break-all; }
.sui-choix .btn-choix .sui-marque { font-size: 1.1rem; }
.sui-choix .btn-choix.sui-ecarte { text-decoration: line-through; }
.sui-explication { max-width: 44rem; text-align: center; font-size: 1.1rem; font-weight: 600; }
`));
  }

  /* ---------- Jeu ---------- */

  JS.Jeux.register({
    id: 'suites',
    nom: 'Suites logiques',
    categorie: 'logique',
    icone: '🔗',
    description: 'Trouvez l\'élément qui continue une suite de nombres ou de symboles.',
    consigne: 'Observez la suite de nombres ou de symboles, puis touchez la réponse qui vient à la place du point d\'interrogation. Après chaque réponse, une phrase explique la règle. Le bouton « Indice » donne un conseil et écarte une mauvaise réponse. Huit questions, sans limite de temps.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => DESCRIPTIONS[n - 1],
    logique: { genererPartie, FABRIQUES, NIVEAUX, NB_QUESTIONS },

    start(ctx) {
      injecterStyle();
      const questions = genererPartie(ctx.niveau);
      let numero = 0;
      let points = 0;
      let bonnes = 0;
      let question = null;
      let repondu = false;
      let indiceUtilise = false;
      let boutonsChoix = [];

      const enonce = el('p', { class: 'enonce' });
      const suite = el('div', { class: 'sui-suite', role: 'group', 'aria-label': 'La suite' });
      const choix = el('div', { class: 'choix sui-choix', role: 'group', 'aria-label': 'Réponses possibles' });
      const explication = el('p', { class: 'sui-explication', 'aria-live': 'polite' });
      const boutonIndice = el('button', { class: 'btn btn-secondaire', type: 'button', onclick: donnerIndice },
        el('span', { 'aria-hidden': 'true' }, '💡'), ' Indice');
      const boutonSuivant = el('button', { class: 'btn btn-primaire btn-grand', type: 'button', hidden: true, onclick: suivante }, 'Question suivante ▶');
      ctx.root.append(enonce, suite, choix, explication, el('div', { class: 'ligne-boutons centre' }, boutonIndice, boutonSuivant));

      function classeElement(q) {
        return q.genre === 'groupes' ? 'sui-element sui-groupe' : 'sui-element';
      }

      function afficherQuestion() {
        question = questions[numero];
        repondu = false;
        indiceUtilise = false;
        enonce.textContent = 'Question ' + (numero + 1) + ' sur ' + questions.length + ' : quel élément vient à la place du « ? » ?';
        suite.replaceChildren(
          ...question.elements.map((e, i) => el('span', { class: classeElement(question), role: 'img', 'aria-label': 'Élément ' + (i + 1) + ' : ' + e.label }, e.texte)),
          el('span', { class: classeElement(question) + ' sui-inconnu', role: 'img', 'aria-label': 'Élément à trouver' }, '?')
        );
        boutonsChoix = question.choix.map((c, i) => el('button', {
          class: 'btn btn-choix' + (question.genre === 'groupes' ? ' sui-groupe' : ''),
          type: 'button',
          'aria-label': 'Réponse ' + (i + 1) + ' : ' + c.label,
          onclick: () => repondre(i)
        }, c.texte));
        choix.replaceChildren(...boutonsChoix);
        explication.textContent = '';
        boutonIndice.disabled = false;
        boutonIndice.hidden = false;
        boutonSuivant.hidden = true;
        ctx.message('', 'info');
      }

      function donnerIndice() {
        if (repondu || indiceUtilise) return;
        indiceUtilise = true;
        ctx.audio.clic();
        const fausses = boutonsChoix.filter((b, i) => question.choix[i].valeur !== question.reponse.valeur);
        const ecarte = choisir(fausses);
        const i = boutonsChoix.indexOf(ecarte);
        ecarte.disabled = true;
        ecarte.classList.add('sui-ecarte');
        ecarte.setAttribute('aria-label', 'Réponse ' + (i + 1) + ' : ' + question.choix[i].label + ', écartée');
        ecarte.append(el('span', { class: 'sui-marque', 'aria-hidden': 'true' }, ' ✗'));
        boutonIndice.disabled = true;
        ctx.message('Indice : ' + question.aide + ' Une mauvaise réponse a été écartée.', 'info');
      }

      function repondre(i) {
        if (repondu) return;
        repondu = true;
        const bonIndex = question.choix.findIndex(c => c.valeur === question.reponse.valeur);
        const juste = i === bonIndex;
        boutonsChoix.forEach(b => { b.disabled = true; });
        const bon = boutonsChoix[bonIndex];
        bon.classList.add('correct');
        bon.prepend(el('span', { class: 'sui-marque', 'aria-hidden': 'true' }, '✔ '));
        bon.setAttribute('aria-label', bon.getAttribute('aria-label') + ', bonne réponse');
        const inconnu = suite.lastChild;
        inconnu.textContent = question.reponse.texte;
        inconnu.classList.remove('sui-inconnu');
        inconnu.classList.add('sui-trouve');
        inconnu.setAttribute('aria-label', 'Élément trouvé : ' + question.reponse.label);
        if (juste) {
          bonnes++;
          points += indiceUtilise ? 0.7 : 1;
          ctx.audio.succes();
          ctx.message(choisir(['Bravo !', 'Très bien !', 'Exactement !', 'C\'est juste !']), 'succes');
        } else {
          const mauvais = boutonsChoix[i];
          mauvais.classList.add('incorrect');
          mauvais.prepend(el('span', { class: 'sui-marque', 'aria-hidden': 'true' }, '✗ '));
          ctx.audio.erreur();
          ctx.message('Ce n\'était pas tout à fait ça. Voici la règle :', 'info');
        }
        explication.textContent = question.explication;
        boutonIndice.hidden = true;
        // Bonne réponse : on enchaîne seul (le temps de lire la règle). Sinon, bouton pour lire à son rythme.
        if (juste) {
          ctx.enchainer(suivante, 3000);
          return;
        }
        boutonSuivant.textContent = numero + 1 < questions.length ? 'Question suivante ▶' : 'Voir le résultat ▶';
        boutonSuivant.hidden = false;
        boutonSuivant.focus();
      }

      function suivante() {
        if (!repondu) return;
        ctx.audio.clic();
        numero++;
        if (numero < questions.length) {
          afficherQuestion();
          return;
        }
        boutonSuivant.disabled = true;
        const reussite = points / questions.length;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: JS.UI.pluriel(bonnes, 'bonne réponse', 'bonnes réponses') + ' sur ' + questions.length + '.'
        });
      }

      // Bonus clavier : 1 à 4 pour répondre, Entrée pour continuer.
      function clavier(e) {
        if (e.ctrlKey || e.altKey || e.metaKey || document.querySelector('dialog[open]')) return;
        const k = Number(e.key);
        if (!repondu && k >= 1 && k <= boutonsChoix.length && !boutonsChoix[k - 1].disabled) {
          e.preventDefault();
          repondre(k - 1);
        }
      }
      document.addEventListener('keydown', clavier);

      afficherQuestion();
      return () => document.removeEventListener('keydown', clavier);
    }
  });
})();
