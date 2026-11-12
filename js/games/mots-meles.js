/* Mots mêlés : retrouver dans une grille de lettres les mots d'un thème. */
(function () {
  'use strict';
  const { el } = JS.UI;

  // Directions [dLigne, dColonne]
  const DROITE = [0, 1], BAS = [1, 0], DIAG_BAS = [1, 1], DIAG_HAUT = [-1, 1];
  const GAUCHE = [0, -1], HAUT = [-1, 0], DIAG_BAS_G = [1, -1], DIAG_HAUT_G = [-1, -1];

  // [taille de la grille, nombre de mots, directions autorisées, description]
  const NIVEAUX = [
    [8, 5, [DROITE, BAS], 'mots horizontaux et verticaux'],
    [9, 6, [DROITE, BAS], 'mots horizontaux et verticaux'],
    [10, 7, [DROITE, BAS, DIAG_BAS], 'premières diagonales'],
    [10, 8, [DROITE, BAS, DIAG_BAS, DIAG_HAUT], 'diagonales'],
    [11, 9, [DROITE, BAS, DIAG_BAS, DIAG_HAUT, GAUCHE], 'certains mots écrits de droite à gauche'],
    [12, 10, [DROITE, BAS, DIAG_BAS, DIAG_HAUT, GAUCHE, HAUT], 'mots à l\'envers'],
    [13, 11, [DROITE, BAS, DIAG_BAS, DIAG_HAUT, GAUCHE, HAUT, DIAG_BAS_G, DIAG_HAUT_G], 'toutes les directions'],
    [14, 12, [DROITE, BAS, DIAG_BAS, DIAG_HAUT, GAUCHE, HAUT, DIAG_BAS_G, DIAG_HAUT_G], 'toutes les directions']
  ];

  // Lettres de remplissage, pondérées comme en français pour un aspect naturel.
  const REMPLISSAGE = 'EEEEEEAAAAASSSSIIIIINNNNRRRRTTTTUUUOOOLLLDDCCMMPPGBVHFQJXYZ';

  /** Choisit des mots du thème : longueur adaptée, aucun mot contenu dans un autre. */
  function choisirMots(theme, nombre, taille) {
    const candidats = JS.UI.melanger(theme.mots)
      .map(mot => ({ mot, grille: JS.Donnees.motEnGrille(mot) }))
      .filter(m => m.grille.length >= 3 && m.grille.length <= Math.min(taille, 10));
    const retenus = [];
    for (const c of candidats) {
      if (retenus.length >= nombre) break;
      if (retenus.some(r => r.grille.includes(c.grille) || c.grille.includes(r.grille))) continue;
      retenus.push(c);
    }
    return retenus.length === nombre ? retenus : null;
  }

  /**
   * Essaie de placer un mot ; renvoie la liste de ses cases ou null.
   * Les directions sont essayées une à une dans un ordre tiré au hasard : chaque direction
   * autorisée a ainsi autant de chances d'être utilisée (y compris les mots à l'envers).
   */
  function placerMot(grille, taille, mot, directions) {
    for (const [dl, dc] of JS.UI.melanger(directions)) {
      const positions = [];
      for (let l = 0; l < taille; l++) for (let c = 0; c < taille; c++) positions.push([l, c]);
      const cases = essayerDirection(grille, taille, mot, dl, dc, JS.UI.melanger(positions));
      if (cases) return cases;
    }
    return null;
  }

  function essayerDirection(grille, taille, mot, dl, dc, positions) {
    for (const [l, c] of positions) {
      const finL = l + dl * (mot.length - 1), finC = c + dc * (mot.length - 1);
      if (finL < 0 || finL >= taille || finC < 0 || finC >= taille) continue;
      let possible = true;
      for (let i = 0; i < mot.length && possible; i++) {
        const lettre = grille[l + dl * i][c + dc * i];
        if (lettre && lettre !== mot[i]) possible = false;
      }
      if (!possible) continue;
      const cases = [];
      for (let i = 0; i < mot.length; i++) {
        grille[l + dl * i][c + dc * i] = mot[i];
        cases.push([l + dl * i, c + dc * i]);
      }
      return cases;
    }
    return null;
  }

  /**
   * Génère une grille complète pour un niveau (1..8).
   * Renvoie { taille, lettres: [[...]], theme, mots: [{ mot, grille, cases }] }.
   */
  function genererGrille(niveau, idTheme) {
    const [taille, nombre, directions] = NIVEAUX[niveau - 1];
    const themes = Object.keys(JS.Donnees.mots);
    for (let tentative = 0; tentative < 60; tentative++) {
      const id = idTheme || JS.UI.choisir(themes);
      const theme = JS.Donnees.mots[id];
      const mots = choisirMots(theme, nombre, taille);
      if (!mots) continue;
      const lettres = Array.from({ length: taille }, () => Array(taille).fill(''));
      // Les plus longs d'abord : ils sont plus difficiles à caser.
      const ordre = mots.slice().sort((a, b) => b.grille.length - a.grille.length);
      let ok = true;
      for (const m of ordre) {
        m.cases = placerMot(lettres, taille, m.grille, directions);
        if (!m.cases) { ok = false; break; }
      }
      if (!ok) continue;
      for (let l = 0; l < taille; l++) {
        for (let c = 0; c < taille; c++) {
          if (!lettres[l][c]) lettres[l][c] = JS.UI.choisir(REMPLISSAGE);
        }
      }
      return { taille, lettres, theme: Object.assign({ id }, theme), mots };
    }
    return null;
  }

  function injecterStyle() {
    if (document.getElementById('style-mots-meles')) return;
    document.head.append(el('style', { id: 'style-mots-meles' }, `
      .mm-zone { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 1rem 1.5rem; width: 100%; }
      .mm-grille { flex: 1 1 18rem; }
      .mm-grille .tuile { min-height: 0; border-width: 2px; border-radius: 0.4rem; }
      .mm-grille .tuile.correct { box-shadow: inset 0 0 0 0.15rem var(--succes); }
      .mm-grille .tuile.mm-indice { background: var(--accent-clair); outline: 0.25rem dashed var(--focus); outline-offset: -0.3rem; animation: mm-clignote 0.9s ease-in-out infinite; }
      @keyframes mm-clignote { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
      .mm-liste { flex: 0 1 15rem; margin: 0; }
      .mm-liste h2 { font-size: 1.1rem; }
      .mm-liste ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; }
      .mm-liste li { font-weight: 700; font-size: 1.05rem; min-width: 8rem; }
      .mm-liste li.trouve { text-decoration: line-through; color: var(--texte-doux); }
    `));
  }

  JS.Jeux.register({
    id: 'mots-meles',
    nom: 'Mots mêlés',
    categorie: 'mots',
    icone: '🔤',
    description: 'Retrouvez dans la grille les mots cachés d\'un thème.',
    consigne: 'Des mots sont cachés dans la grille. Pour en entourer un, touchez sa première lettre, puis sa dernière lettre. Pour annuler, touchez de nouveau la première lettre. Les mots trouvés sont barrés dans la liste. Si vous cherchez longtemps, le bouton « Indice » vous montre où commence un mot, puis où il finit. Un mot trouvé avec un indice compte moins dans la réussite.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [taille, nombre, , texte] = NIVEAUX[n - 1];
      return 'grille de ' + taille + ' × ' + taille + ', ' + nombre + ' mots à trouver, ' + texte;
    },
    // Exposé pour les tests.
    genererGrille,

    start(ctx) {
      injecterStyle();
      const partie = genererGrille(ctx.niveau);
      if (!partie) {
        ctx.message('La grille n\'a pas pu être préparée. Revenez en arrière et relancez la partie.', 'erreur');
        return;
      }
      const { taille, lettres, theme, mots } = partie;
      let premiere = null;   // { l, c } de la première lettre touchée
      let indices = 0;
      let erreurs = 0;
      let revelee = false;
      mots.forEach(m => { m.trouve = false; m.indices = 0; });

      /* ---------- Grille ---------- */
      const tailleTuile = taille <= 9 ? '1.5rem' : taille <= 11 ? '1.25rem' : '1.05rem';
      const plateau = el('div', {
        class: 'plateau mm-grille',
        role: 'group',
        'aria-label': 'Grille de lettres, ' + taille + ' lignes et ' + taille + ' colonnes',
        style: {
          '--colonnes': taille,
          '--ecart': taille <= 10 ? '0.25rem' : '0.18rem',
          '--largeur-max': (taille * (taille <= 10 ? 3 : 2.6)) + 'rem',
          '--taille-tuile': tailleTuile
        }
      });
      const cases = lettres.map((ligne, l) => ligne.map((lettre, c) => {
        const b = el('button', {
          class: 'tuile',
          'aria-label': 'Ligne ' + (l + 1) + ', colonne ' + (c + 1) + ' : ' + lettre,
          onclick: () => toucher(l, c)
        }, lettre);
        plateau.append(b);
        return b;
      }));

      /* ---------- Liste des mots ---------- */
      const elementsListe = mots.map(m => {
        m.li = el('li', null, m.mot.toUpperCase());
        return m.li;
      });
      const liste = el('section', { class: 'panneau mm-liste', 'aria-labelledby': 'mm-titre-liste' },
        el('h2', { id: 'mm-titre-liste' }, el('span', { 'aria-hidden': 'true' }, theme.icone + ' '), 'Thème : ' + theme.nom),
        el('ul', null, elementsListe));

      const compteur = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const boutonIndice = el('button', { class: 'btn', onclick: donnerIndice }, '💡 Indice');
      const boutonFin = el('button', { class: 'btn btn-discret', onclick: abandonner }, 'Voir la solution et terminer');

      ctx.root.append(
        compteur,
        el('div', { class: 'mm-zone' }, plateau, liste),
        el('div', { class: 'ligne-boutons centre' }, boutonIndice, boutonFin)
      );
      majCompteur();
      ctx.message('Touchez la première lettre d\'un mot, puis sa dernière lettre.', 'info');

      function nbTrouves() {
        return mots.filter(m => m.trouve).length;
      }

      function majCompteur() {
        compteur.textContent = 'Mots trouvés : ' + nbTrouves() + ' sur ' + mots.length;
      }

      /** Cases alignées entre deux points (ligne, colonne ou diagonale), sinon null. */
      function alignement(a, b) {
        const dl = b.l - a.l, dc = b.c - a.c;
        if (dl !== 0 && dc !== 0 && Math.abs(dl) !== Math.abs(dc)) return null;
        const n = Math.max(Math.abs(dl), Math.abs(dc));
        const pl = Math.sign(dl), pc = Math.sign(dc);
        const res = [];
        for (let i = 0; i <= n; i++) res.push([a.l + pl * i, a.c + pc * i]);
        return res;
      }

      function toucher(l, c) {
        if (!ctx.actif() || revelee) return;
        ctx.audio.clic();
        if (!premiere) {
          premiere = { l, c };
          cases[l][c].classList.add('selection');
          ctx.message('Première lettre choisie. Touchez maintenant la dernière lettre du mot.', 'info');
          return;
        }
        const depart = premiere;
        cases[depart.l][depart.c].classList.remove('selection');
        premiere = null;

        if (depart.l === l && depart.c === c) {
          ctx.message('Sélection annulée. Touchez la première lettre d\'un mot.', 'info');
          return;
        }
        const chemin = alignement(depart, { l, c });
        if (!chemin) {
          // Lettres non alignées : la nouvelle lettre devient le nouveau départ.
          premiere = { l, c };
          cases[l][c].classList.add('selection');
          ctx.message('Ces deux lettres ne sont pas sur une même ligne. Cette lettre devient la nouvelle première lettre.', 'info');
          return;
        }
        const texte = chemin.map(([x, y]) => lettres[x][y]).join('');
        const envers = texte.split('').reverse().join('');
        const mot = mots.find(m => !m.trouve && (m.grille === texte || m.grille === envers));
        if (mot) {
          valider(mot, chemin);
          return;
        }
        if (mots.some(m => m.trouve && (m.grille === texte || m.grille === envers))) {
          ctx.message('Ce mot est déjà trouvé. Cherchez les autres !', 'info');
          return;
        }
        erreurs++;
        ctx.audio.erreur();
        ctx.message('Ce n\'est pas un mot de la liste. Essayez encore, vous allez y arriver !', 'erreur');
        chemin.forEach(([x, y]) => cases[x][y].classList.add('incorrect'));
        ctx.plusTard(() => chemin.forEach(([x, y]) => cases[x][y].classList.remove('incorrect')), 900);
      }

      function marquerTrouve(mot, chemin) {
        mot.trouve = true;
        // Retire l'éventuel indice posé sur l'emplacement prévu du mot.
        mot.cases.forEach(([x, y]) => cases[x][y].classList.remove('mm-indice'));
        (chemin || mot.cases).forEach(([x, y]) => {
          cases[x][y].classList.add('correct');
          cases[x][y].classList.remove('mm-indice');
          cases[x][y].setAttribute('aria-label', cases[x][y].getAttribute('aria-label').replace(/ \(.*\)$/, '') + ' (lettre d\'un mot trouvé)');
        });
        mot.li.classList.add('trouve');
        mot.li.textContent = '✓ ' + mot.mot.toUpperCase();
        mot.li.setAttribute('aria-label', mot.mot + ', trouvé');
      }

      function valider(mot, chemin) {
        marquerTrouve(mot, chemin);
        ctx.audio.succes();
        majCompteur();
        const reste = mots.length - nbTrouves();
        if (reste === 0) {
          ctx.message('Bravo, vous avez trouvé tous les mots !', 'succes');
          boutonIndice.disabled = true;
          boutonFin.disabled = true;
          ctx.plusTard(finir, 1400);
        } else {
          ctx.message('Bravo, vous avez trouvé « ' + mot.mot + ' » ! Encore ' + JS.UI.pluriel(reste, 'mot') + '.', 'succes');
        }
      }

      function donnerIndice() {
        if (!ctx.actif() || revelee) return;
        const restants = mots.filter(m => !m.trouve);
        if (!restants.length) return;
        // On aide d'abord sur le mot qui a déjà reçu un indice, pour aller jusqu'au bout.
        const mot = restants.find(m => m.indices > 0) || JS.UI.choisir(restants);
        mot.indices++;
        indices++;
        const [l, c] = mot.cases[0];
        cases[l][c].classList.add('mm-indice');
        cases[l][c].setAttribute('aria-label', cases[l][c].getAttribute('aria-label') + ' (indice : début du mot ' + mot.mot + ')');
        if (mot.indices >= 2) {
          const [fl, fc] = mot.cases[mot.cases.length - 1];
          cases[fl][fc].classList.add('mm-indice');
          ctx.message('Le mot « ' + mot.mot + ' » commence et finit sur les deux lettres encadrées en pointillés.', 'info');
        } else {
          ctx.message('Regardez la lettre encadrée en pointillés : c\'est le début du mot « ' + mot.mot + ' ».', 'info');
        }
      }

      async function abandonner() {
        if (!ctx.actif() || revelee) return;
        const ok = await JS.UI.confirmer('Voir la solution ?',
          'Les mots restants vont s\'afficher dans la grille et la partie se terminera.',
          'Oui, voir la solution', 'Continuer à chercher');
        if (!ok || !ctx.actif()) return;
        revelee = true;
        if (premiere) cases[premiere.l][premiere.c].classList.remove('selection');
        mots.filter(m => !m.trouve).forEach(m => {
          m.revele = true;
          m.cases.forEach(([x, y]) => cases[x][y].classList.add('selection'));
          m.li.textContent = '→ ' + m.mot.toUpperCase();
        });
        boutonIndice.disabled = true;
        boutonFin.disabled = true;
        ctx.message('Voici les mots qui restaient, encadrés dans la grille.', 'info');
        ctx.plusTard(finir, 4000);
      }

      function finir() {
        const trouves = nbTrouves();
        // Chaque mot trouvé vaut 100 % sans indice, 65 % avec son début montré,
        // 30 % avec son début et sa fin montrés.
        const points = mots.filter(m => m.trouve).reduce((total, m) => total + Math.max(0.3, 1 - 0.35 * m.indices), 0);
        const penalite = Math.min(0.4, Math.max(0, erreurs - 3) * 0.02);
        const reussite = Math.max(0, Math.min(1, points / mots.length - penalite));
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: JS.UI.pluriel(trouves, 'mot trouvé', 'mots trouvés') + ' sur ' + mots.length +
            ' (thème : ' + theme.nom + ')' + (indices ? ', avec ' + JS.UI.pluriel(indices, 'indice') : ', sans indice') + '.'
        });
      }
    }
  });
})();
