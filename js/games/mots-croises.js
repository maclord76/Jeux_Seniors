/*
 * Mots croisés, et moteur commun avec les mots fléchés (js/games/mots-fleches.js).
 * Mots croisés : définitions numérotées à côté de la grille.
 * Mots fléchés : chaque définition est écrite dans une case de la grille, avec une flèche
 * vers son mot (à droite pour un mot horizontal, en bas pour un mot vertical).
 */
(function () {
  'use strict';
  const { el } = JS.UI;

  // [nombre de mots, longueur maximale d'un mot, taille maximale de la grille, lettres données, description]
  const NIVEAUX = [
    [4, 6, 8, 'initiale', '4 mots courts, la première lettre de chaque mot est donnée'],
    [5, 7, 9, 'initiale', '5 mots, la première lettre de chaque mot est donnée'],
    [6, 8, 10, 'une', '6 mots, une lettre est donnée dans chaque mot'],
    [7, 9, 11, 'aucune', '7 mots, sans lettre donnée'],
    [8, 10, 12, 'aucune', '8 mots, sans lettre donnée'],
    [10, 10, 13, 'aucune', '10 mots, grande grille, sans lettre donnée']
  ];

  // Ordre alphabétique : plus facile à parcourir des yeux que l'AZERTY pour qui n'a pas l'habitude du clavier.
  const CLAVIER = ['ABCDEFGHIJ', 'KLMNOPQRST', 'UVWXYZ'];
  const SENS = { h: 'horizontal', v: 'vertical' };

  function cle(l, c) { return l + ',' + c; }

  /* ---------- Génération de la grille ---------- */

  /**
   * Essaie d'entrecroiser `nombre` mots pris dans `candidats` (déjà mélangés).
   * Règles classiques : chaque nouveau mot croise un mot déjà posé, et aucune lettre ne touche
   * une autre lettre sans former un croisement (pas de mot parasite dans la grille).
   * En mode fléché, la case juste avant chaque mot est réservée à sa définition :
   * aucune lettre ne peut s'y poser ensuite, et elle compte dans la taille de la grille.
   */
  function construire(candidats, nombre, tailleMax, fleches) {
    const cases = new Map();   // cle → { lettre, h, v }
    const defs = new Set();    // cases réservées aux définitions (mode fléché)
    const places = [];
    let b = null;              // bornes actuelles de la grille
    let croisementsTotal = 0;
    const lettre = (l, c) => { const x = cases.get(cle(l, c)); return x ? x.lettre : null; };

    /** Bornes de la grille si l'on ajoutait les cases données. */
    function etendre(base, points) {
      const r = base ? Object.assign({}, base) : { minL: Infinity, maxL: -Infinity, minC: Infinity, maxC: -Infinity };
      points.forEach(([l, c]) => {
        r.minL = Math.min(r.minL, l); r.maxL = Math.max(r.maxL, l);
        r.minC = Math.min(r.minC, c); r.maxC = Math.max(r.maxC, c);
      });
      return r;
    }

    function extremites(m, l, c, dir) {
      const dl = dir === 'v' ? 1 : 0, dc = dir === 'h' ? 1 : 0;
      const n = m.grille.length;
      const points = [[l, c], [l + dl * (n - 1), c + dc * (n - 1)]];
      if (fleches) points.push([l - dl, c - dc]);
      return points;
    }

    function evaluer(m, l, c, dir) {
      const dl = dir === 'v' ? 1 : 0, dc = dir === 'h' ? 1 : 0;
      const n = m.grille.length;
      if (lettre(l - dl, c - dc) || lettre(l + dl * n, c + dc * n)) return null;
      let croisements = 0;
      for (let i = 0; i < n; i++) {
        const x = l + dl * i, y = c + dc * i;
        if (fleches && defs.has(cle(x, y))) return null;
        const existant = cases.get(cle(x, y));
        if (existant) {
          if (existant.lettre !== m.grille[i] || existant[dir]) return null;
          croisements++;
        } else if (lettre(x + dc, y + dl) || lettre(x - dc, y - dl)) {
          return null;
        }
      }
      const r = etendre(b, extremites(m, l, c, dir));
      const haut = r.maxL - r.minL + 1, large = r.maxC - r.minC + 1;
      if (haut > tailleMax || large > tailleMax) return null;
      return { croisements, aire: haut * large, ecart: Math.abs(haut - large) };
    }

    function poser(m, l, c, dir) {
      const dl = dir === 'v' ? 1 : 0, dc = dir === 'h' ? 1 : 0;
      for (let i = 0; i < m.grille.length; i++) {
        const k = cle(l + dl * i, c + dc * i);
        const caseG = cases.get(k) || { lettre: m.grille[i], h: false, v: false };
        caseG[dir] = true;
        cases.set(k, caseG);
      }
      if (fleches) defs.add(cle(l - dl, c - dc));
      b = etendre(b, extremites(m, l, c, dir));
      places.push(Object.assign({}, m, { l, c, dir }));
    }

    /** Meilleur emplacement qui croise la grille actuelle, ou null. */
    function chercherPlace(m) {
      let meilleur = null;
      for (const [k, caseG] of cases) {
        if (caseG.h && caseG.v) continue;
        const dir = caseG.h ? 'v' : 'h';
        const [x, y] = k.split(',').map(Number);
        for (let j = 0; j < m.grille.length; j++) {
          if (m.grille[j] !== caseG.lettre) continue;
          const l = dir === 'v' ? x - j : x, c = dir === 'h' ? y - j : y;
          const note = evaluer(m, l, c, dir);
          if (!note || note.croisements < 1) continue;
          const valeur = note.croisements * 100 - note.aire - note.ecart * 2 + Math.random();
          if (!meilleur || valeur > meilleur.valeur) meilleur = { l, c, dir, valeur, croisements: note.croisements };
        }
      }
      return meilleur;
    }

    // Premier mot : le plus long des premiers candidats, posé horizontalement.
    const reste = candidats.slice();
    let iPremier = 0;
    for (let i = 1; i < Math.min(4, reste.length); i++) {
      if (reste[i].grille.length > reste[iPremier].grille.length) iPremier = i;
    }
    if (reste[iPremier].grille.length + (fleches ? 1 : 0) > tailleMax) return null;
    poser(reste.splice(iPremier, 1)[0], 0, 0, 'h');

    let progres = true;
    while (places.length < nombre && progres) {
      progres = false;
      for (let i = 0; i < reste.length && places.length < nombre; i++) {
        const place = chercherPlace(reste[i]);
        if (!place) continue;
        poser(reste[i], place.l, place.c, place.dir);
        croisementsTotal += place.croisements;
        reste.splice(i, 1);
        i--;
        progres = true;
      }
    }
    if (places.length < nombre) return null;
    const aire = (b.maxL - b.minL + 1) * (b.maxC - b.minC + 1);
    return { places, bornes: b, note: croisementsTotal * 10 - aire / 4 };
  }

  /** Recadre la grille, numérote les mots, calcule leurs cases et (en mode fléché) leur case définition. */
  function finaliser(resultat, theme, id, fleches) {
    const { places, bornes } = resultat;
    const lignes = bornes.maxL - bornes.minL + 1;
    const colonnes = bornes.maxC - bornes.minC + 1;
    const lettres = Array.from({ length: lignes }, () => Array(colonnes).fill(null));
    const definitions = new Map();   // cle → { h: mot, v: mot }
    const mots = places.map(p => {
      const l = p.l - bornes.minL, c = p.c - bornes.minC;
      const dl = p.dir === 'v' ? 1 : 0, dc = p.dir === 'h' ? 1 : 0;
      const cases = [];
      for (let i = 0; i < p.grille.length; i++) {
        cases.push([l + dl * i, c + dc * i]);
        lettres[l + dl * i][c + dc * i] = p.grille[i];
      }
      const m = { mot: p.mot, definition: p.definition, court: p.court, grille: p.grille, dir: p.dir, l, c, cases };
      if (fleches) {
        m.caseDef = [l - dl, c - dc];
        const k = cle(l - dl, c - dc);
        const d = definitions.get(k) || {};
        d[p.dir] = m;
        definitions.set(k, d);
      }
      return m;
    });
    // Numérotation classique : de gauche à droite, ligne par ligne.
    const debuts = Array.from(new Set(mots.map(m => cle(m.l, m.c))))
      .map(k => k.split(',').map(Number))
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const numeros = new Map(debuts.map(([l, c], i) => [cle(l, c), i + 1]));
    mots.forEach(m => { m.numero = numeros.get(cle(m.l, m.c)); });
    mots.sort((a, b) => (a.dir === b.dir ? 0 : a.dir === 'h' ? -1 : 1) || a.numero - b.numero);
    return { lignes, colonnes, lettres, mots, numeros, definitions, theme: { id, nom: theme.nom, icone: theme.icone } };
  }

  /**
   * Génère une grille pour un niveau, sur un thème tiré au hasard (ou imposé).
   * niveaux : table des niveaux du jeu ; fleches : true pour les mots fléchés.
   * Renvoie { lignes, colonnes, lettres: [[lettre|null]], mots: [{ mot, definition, court, grille, dir, numero, cases, caseDef }],
   *           numeros: Map, definitions: Map, theme } ou null.
   */
  function genererGrille(niveaux, niveau, idTheme, fleches) {
    const [nombre, longueurMax, tailleMax] = niveaux[niveau - 1];
    const themes = idTheme ? [idTheme] : JS.UI.melanger(Object.keys(JS.Donnees.motsCroises));
    for (const id of themes) {
      const theme = JS.Donnees.motsCroises[id];
      const vus = new Set();
      const mots = theme.mots
        .map(([mot, definition, court]) => ({ mot, definition, court, grille: JS.Donnees.motEnGrille(mot) }))
        .filter(m => {
          if (m.grille.length < 3 || m.grille.length > longueurMax || vus.has(m.grille)) return false;
          vus.add(m.grille);
          return true;
        });
      if (mots.length < nombre) continue;
      let meilleur = null;
      for (let essai = 0; essai < 40; essai++) {
        const r = construire(JS.UI.melanger(mots), nombre, tailleMax, fleches);
        if (r && (!meilleur || r.note > meilleur.note)) meilleur = r;
      }
      if (meilleur) return finaliser(meilleur, theme, id, fleches);
    }
    return null;
  }

  /* ---------- Affichage ---------- */

  function injecterStyle() {
    if (document.getElementById('style-mots-croises')) return;
    document.head.append(el('style', { id: 'style-mots-croises' }, `
      .mc-zone { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 1rem 1.5rem; width: 100%; }
      .mc-gauche { flex: 1 1 20rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; min-width: 0; max-width: 40rem; }
      .mf .mc-gauche { max-width: 48rem; }
      .mc-definition { width: 100%; max-width: 40rem; margin: 0; padding: 0.6rem 1rem; border: 3px solid var(--primaire); border-radius: var(--rayon); background: var(--carte); min-height: 4.2rem; }
      .mc-definition .mc-ref { display: block; font-size: 0.9rem; color: var(--texte-doux); }
      .mc-grille .tuile { position: relative; min-height: 0; border-width: 2px; border-radius: 0.25rem; }
      .mc-noire { aspect-ratio: 1 / 1; }
      .mc-num { position: absolute; top: 0.12rem; left: 0.18rem; font-size: 0.5rem; font-weight: 700; line-height: 1; color: var(--texte-doux); }
      .mc-grille .tuile.mc-mot { background: var(--primaire-clair); border-color: var(--primaire); }
      .mc-grille .tuile.correct { background: var(--succes-clair); border-color: var(--succes); }
      .mc-grille .tuile.incorrect { background: var(--attention-clair); border-color: var(--attention); }
      .mc-grille .tuile.incorrect .mc-lettre { text-decoration: line-through; }
      .mc-grille .tuile.mc-courante { background: var(--accent-clair); outline: 0.25rem solid var(--focus); outline-offset: -0.25rem; z-index: 1; }
      .mc-donnee .mc-lettre { color: var(--texte-doux); text-decoration: underline dotted; text-underline-offset: 0.12em; }
      .mc-aide .mc-lettre { color: var(--accent); text-decoration: underline dashed; text-underline-offset: 0.12em; }
      .mc-revele .mc-lettre { color: var(--attention); font-style: italic; }
      .mc-defs { flex: 1 1 16rem; max-width: 28rem; margin: 0; }
      .mc-defs h2 { font-size: 1.1rem; margin: 0.2rem 0 0.4rem; }
      .mc-defs ol { list-style: none; padding: 0; margin: 0 0 0.8rem; display: flex; flex-direction: column; gap: 0.25rem; }
      .mc-def { width: 100%; text-align: left; font: inherit; font-size: 0.95rem; font-weight: 600; line-height: 1.35; padding: 0.35rem 0.5rem; border: 2px solid transparent; border-radius: 0.6rem; background: transparent; color: var(--texte); cursor: pointer; }
      .mc-def:hover { border-color: var(--bord-leger); }
      .mc-def.mc-actif { background: var(--primaire-clair); border-color: var(--primaire); }
      .mc-def.trouve { color: var(--texte-doux); }
      .mc-def .mc-n { font-weight: 800; }
      .mc-clavier { display: flex; flex-direction: column; gap: 0.35rem; width: 100%; max-width: 34rem; }
      .mc-rangee { display: flex; justify-content: center; gap: 0.3rem; }
      .mc-touche { flex: 1 1 0; min-width: 0; max-width: 3.2rem; min-height: 2.9rem; padding: 0; border: 2px solid var(--primaire); border-radius: 0.5rem; background: var(--carte); color: var(--texte); font: inherit; font-size: 1.15rem; font-weight: 700; cursor: pointer; touch-action: manipulation; user-select: none; }
      .mc-touche:hover { background: var(--primaire-clair); }
      .mc-touche:active { transform: translateY(1px); }
      .mc-touche.mc-large { flex: 2.2 1 0; max-width: 7.5rem; font-size: 0.85rem; }
      .mc-touche[disabled] { opacity: 0.5; cursor: default; }

      /* Mots fléchés : cases définition et cases vides */
      .mf-theme { margin: 0; font-weight: 700; font-size: 1.1rem; }
      .mf-vide { aspect-ratio: 1 / 1; border-radius: 0.25rem; background: var(--bord-leger); opacity: 0.55; }
      .mf-case-def { aspect-ratio: 1 / 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .mf-def { position: relative; flex: 1 1 0; min-height: 0; min-width: 0; display: flex; align-items: center; justify-content: center;
        padding: 0.1rem 0.15rem; border: 2px solid var(--primaire); border-radius: 0.25rem; background: var(--primaire-clair); color: var(--texte);
        font: inherit; font-size: var(--taille-def, 12px); font-weight: 700; line-height: 1.12; text-align: center;
        overflow: hidden; overflow-wrap: break-word; hyphens: auto; cursor: pointer; touch-action: manipulation; }
      .mf-def.mf-h { padding-right: 0.7rem; }
      .mf-def.mf-v { padding-bottom: 0.65rem; }
      .mf-fleche { position: absolute; color: var(--primaire); font-size: 0.65rem; line-height: 1; }
      .mf-h .mf-fleche { right: 0.08rem; top: 50%; transform: translateY(-50%); }
      .mf-v .mf-fleche { bottom: 0.05rem; left: 50%; transform: translateX(-50%); }
      .mf-def:hover { border-color: var(--primaire-fonce); }
      .mf-def.mc-actif { background: var(--accent-clair); border-color: var(--focus); outline: 0.2rem solid var(--focus); outline-offset: -0.2rem; }
      .mf-def.trouve { background: var(--succes-clair); border-color: var(--succes); color: var(--texte-doux); }
      .mf-compact .mf-texte { display: none; }
      .mf-compact .mf-def { padding: 0; }
      .mf-compact .mf-fleche { position: static; transform: none; font-size: 0.85rem; }
    `));
  }

  /**
   * Déroule une partie. config : { niveaux, fleches }.
   * Renvoie la fonction de nettoyage.
   */
  function demarrer(ctx, config) {
    injecterStyle();
    const fleches = !!config.fleches;
    const aideNiveau = config.niveaux[ctx.niveau - 1][3];
    const partie = genererGrille(config.niveaux, ctx.niveau, null, fleches);
    if (!partie) {
      ctx.message('La grille n\'a pas pu être préparée. Revenez en arrière et relancez la partie.', 'erreur');
      return;
    }
    const { lignes, colonnes, lettres, mots, numeros, definitions, theme } = partie;

    /* ---------- État ---------- */
    const etat = lettres.map(ligne => ligne.map(x => (x ? { solution: x, saisie: '', donnee: false, aide: false, mots: {} } : null)));
    mots.forEach(m => {
      m.trouve = false;
      m.revele = false;
      m.detail = false;   // définition détaillée demandée (mots fléchés)
      m.cases.forEach(([l, c]) => { etat[l][c].mots[m.dir] = m; });
    });
    const donner = ([l, c]) => { etat[l][c].donnee = true; etat[l][c].saisie = etat[l][c].solution; };
    if (aideNiveau === 'initiale') mots.forEach(m => donner(m.cases[0]));
    if (aideNiveau === 'une') {
      mots.forEach(m => {
        if (!m.cases.some(([l, c]) => etat[l][c].donnee)) donner(JS.UI.choisir(m.cases));
      });
    }
    // Un mot entièrement donné par ses croisements est compté comme trouvé d'emblée.
    mots.forEach(m => { if (m.cases.every(([l, c]) => etat[l][c].donnee)) m.trouve = true; });

    let direction = 'h';
    let courant = null;     // [l, c]
    let indices = 0;
    let details = 0;        // définitions détaillées demandées (mots fléchés)
    let revelee = false;
    let aCorriger = new Set();

    const verrouillee = (l, c) => {
      const e = etat[l][c];
      return e.donnee || e.aide || revelee || Object.values(e.mots).some(m => m.trouve);
    };
    const motCourant = () => {
      const e = etat[courant[0]][courant[1]];
      return e.mots[direction] || e.mots[direction === 'h' ? 'v' : 'h'];
    };
    const indexDans = (m, l, c) => m.cases.findIndex(([x, y]) => x === l && y === c);
    const nomMot = m => (fleches ? 'défini par « ' + m.court + ' »' : 'n° ' + m.numero + ' ' + SENS[m.dir]);

    /* ---------- Grille ---------- */
    const tailleMax = Math.max(lignes, colonnes);
    const largeurCase = fleches
      ? (tailleMax <= 8 ? 4.6 : tailleMax <= 10 ? 4.2 : 3.8)
      : (tailleMax <= 8 ? 3.2 : tailleMax <= 10 ? 2.9 : 2.6);
    const plateau = el('div', {
      class: 'plateau mc-grille',
      role: 'group',
      'aria-label': 'Grille de ' + (fleches ? 'mots fléchés' : 'mots croisés') + ', ' + lignes + ' lignes et ' + colonnes + ' colonnes',
      style: {
        '--colonnes': colonnes,
        '--ecart': '0.15rem',
        '--largeur-max': (colonnes * largeurCase) + 'rem',
        '--taille-tuile': tailleMax <= 8 ? '1.5rem' : tailleMax <= 10 ? '1.3rem' : '1.1rem'
      }
    });
    const boutons = etat.map((ligne, l) => ligne.map((e, c) => {
      if (!e) {
        const d = fleches && definitions.get(cle(l, c));
        if (d) plateau.append(caseDefinition(d));
        else plateau.append(el('div', { class: fleches ? 'mf-vide' : 'mc-noire', 'aria-hidden': 'true' }));
        return null;
      }
      const numero = !fleches && numeros.get(cle(l, c));
      const lettreSpan = el('span', { class: 'mc-lettre' });
      const b = el('button', { class: 'tuile', type: 'button', onclick: () => toucherCase(l, c) },
        numero ? el('span', { class: 'mc-num', 'aria-hidden': 'true' }, String(numero)) : null,
        lettreSpan);
      b._lettre = lettreSpan;
      plateau.append(b);
      return b;
    }));

    /** Case fléchée : une ou deux définitions (celle du mot de droite en haut, celle du mot du dessous en bas). */
    function caseDefinition(d) {
      return el('div', { class: 'mf-case-def' }, ['h', 'v'].filter(dir => d[dir]).map(dir => {
        const m = d[dir];
        m.bouton = el('button', { class: 'mf-def mf-' + dir, type: 'button', onclick: () => choisirMot(m) },
          el('span', { class: 'mf-texte' }, m.court),
          el('span', { class: 'mf-fleche', 'aria-hidden': 'true' }, dir === 'h' ? '▶' : '▼'));
        return m.bouton;
      }));
    }

    // En mode fléché, la taille du texte des définitions suit la taille des cases ;
    // si les cases sont trop petites (téléphone), seule la flèche reste : la définition s'affiche au-dessus.
    let observateur = null;
    if (fleches && typeof ResizeObserver === 'function') {
      observateur = new ResizeObserver(() => {
        const largeur = plateau.clientWidth / colonnes;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 22;
        const base = Math.max(11, Math.min(18, largeur * 0.165));
        plateau.style.setProperty('--taille-def', base + 'px');
        const compact = largeur < rem * 3.1;
        if (compact !== plateau.classList.contains('mf-compact')) {
          plateau.classList.toggle('mf-compact', compact);
          if (courant) maj();   // le bandeau dépend du mode compact
        }
        // Le mot le plus long de chaque définition doit tenir sur une ligne (gras ≈ 0,7 em par lettre).
        mots.forEach(m => {
          const plusLong = Math.max(...m.court.split(/[\s'’:,-]+/).map(x => x.length));
          const ajuste = (largeur - 22) / (0.7 * plusLong);
          m.bouton.style.fontSize = Math.max(11, Math.min(base, ajuste)) + 'px';
        });
      });
      observateur.observe(plateau);
    }

    /* ---------- Définitions ---------- */
    const definition = el('p', { class: 'enonce mc-definition', 'aria-live': 'polite' });
    let defs = null;
    if (!fleches) {
      const listeDefs = dir => el('ol', null, mots.filter(m => m.dir === dir).map(m => {
        m.bouton = el('button', { class: 'mc-def', type: 'button', onclick: () => choisirMot(m) });
        return el('li', null, m.bouton);
      }));
      defs = el('section', { class: 'panneau mc-defs', 'aria-labelledby': 'mc-titre-defs' },
        el('h2', { id: 'mc-titre-defs' }, el('span', { 'aria-hidden': 'true' }, theme.icone + ' '), 'Thème : ' + theme.nom),
        el('h2', null, '➡ Horizontalement'), listeDefs('h'),
        el('h2', null, '⬇ Verticalement'), listeDefs('v'));
    }

    /* ---------- Clavier à l'écran ---------- */
    const touches = [];
    const clavier = el('div', { class: 'mc-clavier', role: 'group', 'aria-label': 'Clavier' },
      CLAVIER.map((rangee, i) => el('div', { class: 'mc-rangee' },
        rangee.split('').map(x => {
          const t = el('button', { class: 'mc-touche', type: 'button', onclick: () => saisir(x) }, x);
          touches.push(t);
          return t;
        }),
        i === CLAVIER.length - 1 ? [
          el('button', { class: 'mc-touche mc-large', type: 'button', 'aria-label': 'Effacer la lettre', onclick: effacer }, '⌫ Effacer'),
          el('button', { class: 'mc-touche mc-large', type: 'button', 'aria-label': 'Changer de sens : horizontal ou vertical', onclick: changerSens }, '⇄ Sens')
        ] : null
      )));

    const compteur = el('p', { class: 'enonce', 'aria-live': 'polite' });
    const boutonIndice = el('button', { class: 'btn', type: 'button', onclick: donnerIndice }, '💡 Une lettre');
    const boutonVerifier = el('button', { class: 'btn', type: 'button', onclick: verifier }, '🔎 Vérifier');
    const boutonFin = el('button', { class: 'btn btn-discret', type: 'button', onclick: abandonner }, 'Voir la solution et terminer');
    // Mots fléchés : la définition détaillée est un indice, affiché seulement à la demande.
    const boutonDetail = fleches
      ? el('button', { class: 'btn', type: 'button', onclick: montrerDetail }, '📖 Définition détaillée')
      : null;
    const boutonsAide = [boutonIndice, boutonDetail, boutonVerifier, boutonFin].filter(Boolean);

    ctx.root.append(
      compteur,
      el('div', { class: 'mc-zone' + (fleches ? ' mf' : '') },
        el('div', { class: 'mc-gauche' },
          fleches ? el('p', { class: 'mf-theme' }, el('span', { 'aria-hidden': 'true' }, theme.icone + ' '), 'Thème : ' + theme.nom) : null,
          definition, plateau, clavier),
        defs),
      el('div', { class: 'ligne-boutons centre' }, boutonsAide)
    );

    const premier = mots.find(m => !m.trouve) || mots[0];
    choisirMot(premier, true);
    ctx.message(fleches
      ? 'Touchez une case définition (avec sa flèche) ou une case blanche, puis écrivez le mot.'
      : 'Touchez une case ou une définition, puis écrivez le mot.', 'info');

    document.addEventListener('keydown', surTouche);

    /* ---------- Mise à jour de l'affichage ---------- */

    function nbTrouves() {
      return mots.filter(m => m.trouve).length;
    }

    function maj() {
      const m = motCourant();
      const dansMot = new Set(m.cases.map(([l, c]) => cle(l, c)));
      etat.forEach((ligne, l) => ligne.forEach((e, c) => {
        if (!e) return;
        const b = boutons[l][c];
        const trouve = Object.values(e.mots).some(x => x.trouve);
        const revele = Object.values(e.mots).some(x => x.revele);
        b.classList.toggle('mc-mot', dansMot.has(cle(l, c)));
        b.classList.toggle('mc-courante', courant[0] === l && courant[1] === c);
        b.classList.toggle('correct', trouve);
        b.classList.toggle('incorrect', aCorriger.has(cle(l, c)));
        b.classList.toggle('mc-donnee', e.donnee);
        b.classList.toggle('mc-aide', e.aide && !e.donnee);
        b.classList.toggle('mc-revele', revele && !trouve && !e.donnee && !e.aide);
        b._lettre.textContent = e.saisie;
        const numero = !fleches && numeros.get(cle(l, c));
        b.setAttribute('aria-label', 'Ligne ' + (l + 1) + ', colonne ' + (c + 1) +
          (numero ? ', début du mot ' + numero : '') + ' : ' + (e.saisie || 'vide') +
          (e.donnee ? ', lettre donnée' : e.aide ? ', lettre d\'aide' : '') +
          (trouve ? ', mot trouvé' : '') + (aCorriger.has(cle(l, c)) ? ', à corriger' : ''));
        if (courant[0] === l && courant[1] === c) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      }));
      mots.forEach(x => {
        x.bouton.classList.toggle('trouve', x.trouve);
        x.bouton.classList.toggle('mc-actif', x === m);
        if (fleches) {
          x.bouton.setAttribute('aria-label', 'Définition du mot ' + SENS[x.dir] + ' : ' + x.court + ', ' +
            x.grille.length + ' lettres' + (x.trouve ? ', trouvé : ' + x.mot : x.revele ? ', solution : ' + x.mot : ''));
          return;
        }
        const prefixe = x.trouve ? '✓ ' : x.revele ? '→ ' : '';
        x.bouton.textContent = '';
        x.bouton.append(
          el('span', { class: 'mc-n' }, prefixe + x.numero + '. '),
          x.definition + ' (' + x.grille.length + ' lettres)' +
          (x.revele ? ' : ' + x.mot.toUpperCase() : '')
        );
        x.bouton.setAttribute('aria-label', x.numero + ' ' + SENS[x.dir] + ' : ' + x.definition + ', ' +
          x.grille.length + ' lettres' + (x.trouve ? ', trouvé : ' + x.mot : x.revele ? ', solution : ' + x.mot : ''));
      });
      // Bandeau : toujours en mots croisés. En mots fléchés, seulement si la définition détaillée
      // a été demandée pour ce mot, ou sur petit écran (les cases n'y montrent que la flèche).
      const compact = plateau.classList.contains('mf-compact');
      const texteBandeau = !fleches || m.detail ? m.definition : compact ? m.court : null;
      definition.hidden = !texteBandeau;
      definition.textContent = '';
      if (texteBandeau) {
        definition.append(
          el('span', { class: 'mc-ref' }, (m.dir === 'h' ? '➡ ' : '⬇ ') +
            (fleches ? 'Mot ' + SENS[m.dir] : m.numero + ' ' + SENS[m.dir]) + ' · ' +
            m.grille.length + ' lettres' + (fleches && m.detail ? ' · définition détaillée' : '') +
            (m.trouve ? ' · ✓ trouvé' : '')),
          texteBandeau
        );
      }
      compteur.textContent = 'Mots trouvés : ' + nbTrouves() + ' sur ' + mots.length;
      // Si le joueur navigue au clavier dans la grille, le focus suit la case courante.
      if (plateau.contains(document.activeElement) && document.activeElement.classList.contains('tuile')) {
        boutons[courant[0]][courant[1]].focus({ preventScroll: true });
      }
    }

    /* ---------- Sélection ---------- */

    function choisirMot(m, silencieux) {
      if (!silencieux) ctx.audio.clic();
      direction = m.dir;
      const libre = m.cases.find(([l, c]) => !etat[l][c].saisie && !verrouillee(l, c)) || m.cases[0];
      courant = libre.slice();
      maj();
    }

    function toucherCase(l, c) {
      if (!ctx.actif()) return;
      ctx.audio.clic();
      const e = etat[l][c];
      if (courant && courant[0] === l && courant[1] === c && e.mots.h && e.mots.v) {
        direction = direction === 'h' ? 'v' : 'h';
      } else {
        courant = [l, c];
        if (!e.mots[direction]) direction = direction === 'h' ? 'v' : 'h';
      }
      maj();
    }

    function changerSens() {
      if (!ctx.actif()) return;
      const e = etat[courant[0]][courant[1]];
      if (e.mots.h && e.mots.v) {
        ctx.audio.clic();
        direction = direction === 'h' ? 'v' : 'h';
        maj();
      } else {
        ctx.message('Cette case n\'appartient qu\'à un seul mot. Touchez une case partagée par deux mots pour changer de sens.', 'info');
      }
    }

    function deplacer(dl, dc) {
      let [l, c] = courant;
      do {
        l += dl;
        c += dc;
      } while (l >= 0 && l < lignes && c >= 0 && c < colonnes && !etat[l][c]);
      if (l < 0 || l >= lignes || c < 0 || c >= colonnes) return;
      courant = [l, c];
      const voulu = dl ? 'v' : 'h';
      direction = etat[l][c].mots[voulu] ? voulu : (voulu === 'h' ? 'v' : 'h');
      maj();
    }

    /** Mot suivant non trouvé, dans l'ordre des définitions. */
    function motSuivant(m) {
      const i = mots.indexOf(m);
      for (let k = 1; k <= mots.length; k++) {
        const x = mots[(i + k) % mots.length];
        if (!x.trouve) return x;
      }
      return null;
    }

    /* ---------- Saisie ---------- */

    /** Vérifie les mots qui passent par une case ; renvoie les mots nouvellement trouvés. */
    function controler(l, c) {
      const nouveaux = [];
      Object.values(etat[l][c].mots).forEach(m => {
        if (m.trouve) return;
        if (m.cases.every(([x, y]) => etat[x][y].saisie === etat[x][y].solution)) {
          m.trouve = true;
          nouveaux.push(m);
        }
      });
      return nouveaux;
    }

    /** Félicite pour les mots trouvés ; renvoie true si la grille est terminée. */
    function feliciter(nouveaux) {
      ctx.audio.succes();
      const reste = mots.length - nbTrouves();
      if (reste === 0) {
        maj();
        ctx.message('Bravo, la grille est complète !', 'succes');
        boutonsAide.concat(touches).forEach(b => { b.disabled = true; });
        ctx.plusTard(finir, 1600);
        return true;
      }
      const noms = nouveaux.map(x => '« ' + x.mot + ' »').join(' et ');
      ctx.message('Bravo, ' + noms + (nouveaux.length > 1 ? ' sont justes' : ' est juste') + ' ! Encore ' + JS.UI.pluriel(reste, 'mot') + '.', 'succes');
      return false;
    }

    function saisir(x) {
      if (!ctx.actif() || revelee) return;
      const m = motCourant();
      let i = indexDans(m, courant[0], courant[1]);
      while (i < m.cases.length && verrouillee(...m.cases[i])) i++;
      if (i >= m.cases.length) {
        // Fin du mot atteinte : on cherche une case libre depuis le début.
        i = m.cases.findIndex(([l, c]) => !verrouillee(l, c));
        if (i < 0) {
          ctx.message('Ce mot est déjà complet. Choisissez une autre définition.', 'info');
          return;
        }
      }
      const [l, c] = m.cases[i];
      ctx.audio.clic();
      etat[l][c].saisie = x;
      aCorriger.delete(cle(l, c));
      courant = [l, c];

      const nouveaux = controler(l, c);
      if (nouveaux.length && feliciter(nouveaux)) return;
      if (m.trouve) {
        choisirMot(motSuivant(m), true);
        return;
      }

      // Case suivante libre du mot.
      let j = i + 1;
      while (j < m.cases.length && verrouillee(...m.cases[j])) j++;
      if (j < m.cases.length) courant = m.cases[j].slice();
      if (m.cases.every(([a, b]) => etat[a][b].saisie)) {
        ctx.message('Le mot ' + nomMot(m) + ' est rempli mais pas encore juste. Vous pouvez changer une lettre, ou utiliser « Vérifier ».', 'info');
      } else if (!nouveaux.length) {
        ctx.message('');
      }
      maj();
    }

    function effacer() {
      if (!ctx.actif() || revelee) return;
      const m = motCourant();
      const [l, c] = courant;
      if (!verrouillee(l, c) && etat[l][c].saisie) {
        etat[l][c].saisie = '';
        aCorriger.delete(cle(l, c));
      } else {
        let i = indexDans(m, l, c) - 1;
        while (i >= 0 && verrouillee(...m.cases[i])) i--;
        if (i < 0) { maj(); return; }
        const [pl, pc] = m.cases[i];
        etat[pl][pc].saisie = '';
        aCorriger.delete(cle(pl, pc));
        courant = [pl, pc];
      }
      ctx.audio.clic();
      ctx.message('');
      maj();
    }

    function surTouche(e) {
      if (!ctx.actif() || revelee) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      const cible = e.target;
      if (cible && /^(INPUT|TEXTAREA|SELECT)$/.test(cible.tagName)) return;
      const dansJeu = !document.activeElement || document.activeElement === document.body ||
        ctx.root.contains(document.activeElement) || document.activeElement.id === 'app';
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        effacer();
        return;
      }
      const flechesClavier = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (flechesClavier[e.key]) {
        if (!dansJeu) return;
        e.preventDefault();
        deplacer(...flechesClavier[e.key]);
        return;
      }
      if (e.key.length === 1) {
        const lettre = JS.Donnees.motEnGrille(e.key);
        if (lettre.length === 1) {
          e.preventDefault();
          saisir(lettre);
        }
      }
    }

    /* ---------- Aides ---------- */

    function donnerIndice() {
      if (!ctx.actif() || revelee) return;
      let m = motCourant();
      if (m.trouve) m = motSuivant(m);
      if (!m) return;
      const cible = m.cases.find(([l, c]) => !verrouillee(l, c) && etat[l][c].saisie !== etat[l][c].solution);
      if (!cible) return;
      const [l, c] = cible;
      etat[l][c].saisie = etat[l][c].solution;
      etat[l][c].aide = true;
      aCorriger.delete(cle(l, c));
      indices++;
      direction = m.dir;
      courant = [l, c];
      ctx.audio.clic();
      const nouveaux = controler(l, c);
      if (nouveaux.length && feliciter(nouveaux)) return;
      if (m.trouve) {
        choisirMot(motSuivant(m), true);
        return;
      }
      if (!nouveaux.length) ctx.message('Voici une lettre du mot ' + nomMot(m) + ', soulignée en tirets.', 'info');
      // On avance sur la case libre suivante du mot.
      const suivante = m.cases.find(([a, b]) => !verrouillee(a, b) && !etat[a][b].saisie);
      if (suivante) courant = suivante.slice();
      maj();
    }

    function verifier() {
      if (!ctx.actif() || revelee) return;
      const fausses = [];
      let ecrites = 0;
      etat.forEach((ligne, l) => ligne.forEach((e, c) => {
        if (!e || verrouillee(l, c) || !e.saisie) return;
        ecrites++;
        if (e.saisie !== e.solution) fausses.push(cle(l, c));
      }));
      if (!ecrites) {
        ctx.message('Écrivez d\'abord quelques lettres, puis vérifiez.', 'info');
        return;
      }
      if (!fausses.length) {
        ctx.message('Toutes les lettres écrites sont justes. Continuez comme ça !', 'succes');
        return;
      }
      aCorriger = new Set(fausses);
      ctx.message(JS.UI.pluriel(fausses.length, 'lettre est à corriger', 'lettres sont à corriger') +
        ' : elles sont barrées dans la grille.', 'info');
      maj();
      ctx.plusTard(() => { aCorriger = new Set(); maj(); }, 4000);
    }

    async function abandonner() {
      if (!ctx.actif() || revelee) return;
      const ok = await JS.UI.confirmer('Voir la solution ?',
        'Les mots restants vont s\'afficher dans la grille et la partie se terminera.',
        'Oui, voir la solution', 'Continuer à chercher');
      if (!ok || !ctx.actif()) return;
      revelee = true;
      aCorriger = new Set();
      mots.filter(m => !m.trouve).forEach(m => {
        m.revele = true;
        m.cases.forEach(([l, c]) => { etat[l][c].saisie = etat[l][c].solution; });
      });
      boutonsAide.concat(touches).forEach(b => { b.disabled = true; });
      maj();
      ctx.message('Voici la grille complète. Les mots qui restaient sont écrits en italique.', 'info');
      ctx.plusTard(finir, 5000);
    }

    /** Mots fléchés : affiche la définition détaillée du mot choisi au-dessus de la grille. */
    function montrerDetail() {
      if (!ctx.actif() || revelee) return;
      let m = motCourant();
      if (m.trouve) m = motSuivant(m) || m;
      if (m.detail) {
        choisirMot(m, true);
        ctx.message('La définition détaillée de ce mot est déjà affichée au-dessus de la grille.', 'info');
        return;
      }
      ctx.audio.clic();
      m.detail = true;
      details++;
      choisirMot(m, true);
      ctx.message('Voici la définition détaillée, au-dessus de la grille. Elle restera affichée pour ce mot.', 'info');
    }

    function finir() {
      const trouves = nbTrouves();
      // Chaque mot trouvé vaut la part de ses lettres écrites sans l'aide « Une lettre » :
      // un mot rempli à moitié par l'aide vaut 50 %, entièrement par l'aide 0 %.
      const points = mots.filter(m => m.trouve).reduce((total, m) => {
        // Les lettres données au départ ne comptent ni pour ni contre.
        const aEcrire = m.cases.filter(([l, c]) => !etat[l][c].donnee);
        const aidees = aEcrire.filter(([l, c]) => etat[l][c].aide).length;
        return total + (aEcrire.length ? 1 - aidees / aEcrire.length : 1);
      }, 0);
      const reussite = Math.max(0, Math.min(1, points / mots.length - details * 0.02));
      const aides = [];
      if (indices) aides.push(JS.UI.pluriel(indices, 'lettre d\'aide', 'lettres d\'aide'));
      if (details) aides.push(JS.UI.pluriel(details, 'définition détaillée', 'définitions détaillées'));
      ctx.terminer({
        reussite,
        score: Math.round(reussite * 100 * ctx.niveau),
        details: JS.UI.pluriel(trouves, 'mot trouvé', 'mots trouvés') + ' sur ' + mots.length +
          ' (thème : ' + theme.nom + ')' +
          (aides.length ? ', avec ' + aides.join(' et ') : ', sans aide') + '.'
      });
    }

    return () => {
      document.removeEventListener('keydown', surTouche);
      if (observateur) observateur.disconnect();
    };
  }

  // Moteur partagé avec les mots fléchés.
  JS.MotsCroises = { genererGrille, demarrer };

  JS.Jeux.register({
    id: 'mots-croises',
    nom: 'Mots croisés',
    categorie: 'mots',
    icone: '✏️',
    description: 'Remplissez la grille grâce à des définitions simples.',
    consigne: 'Lisez une définition, puis écrivez le mot dans la grille. Touchez une case ou une définition pour choisir un mot, puis tapez les lettres avec le clavier affiché sous la grille ou avec celui de l\'ordinateur. Les accents ne comptent pas. Une case partagée par deux mots : touchez-la une deuxième fois, ou utilisez la touche « Sens », pour passer du mot horizontal au mot vertical. Un mot juste devient vert. Le bouton « Une lettre » vous en donne une, et « Vérifier » signale les lettres à corriger. Les lettres données par l\'aide ne comptent pas dans la réussite du mot.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => NIVEAUX[n - 1][4],
    // Exposés pour les tests.
    genererGrille: (niveau, idTheme) => genererGrille(NIVEAUX, niveau, idTheme, false),
    NIVEAUX,

    start(ctx) {
      return demarrer(ctx, { niveaux: NIVEAUX, fleches: false });
    }
  });
})();
