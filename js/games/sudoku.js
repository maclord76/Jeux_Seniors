/* Sudoku : remplir la grille pour que chaque chiffre apparaisse une seule fois par ligne, par colonne et par bloc. */
(function () {
  'use strict';
  const { el } = JS.UI;

  // [taille, hauteur d'un bloc, largeur d'un bloc, cases vides visées]
  const NIVEAUX = [
    [4, 2, 2, 6],
    [4, 2, 2, 10],
    [6, 2, 3, 14],
    [6, 2, 3, 20],
    [9, 3, 3, 36],
    [9, 3, 3, 42],
    [9, 3, 3, 47],
    [9, 3, 3, 52]
  ];

  /* ---------- Logique pure (sans affichage) ---------- */

  /** Décrit une grille : taille, dimensions des blocs et numéro de bloc de chaque case. */
  function creerModele(taille, hauteurBloc, largeurBloc) {
    const blocs = [];
    const blocsParLigne = taille / largeurBloc;
    for (let i = 0; i < taille * taille; i++) {
      const l = Math.floor(i / taille);
      const c = i % taille;
      blocs.push(Math.floor(l / hauteurBloc) * blocsParLigne + Math.floor(c / largeurBloc));
    }
    return { taille, hauteurBloc, largeurBloc, blocs };
  }

  function nombreDeBits(x) {
    let n = 0;
    while (x) { x &= x - 1; n++; }
    return n;
  }

  /**
   * Résout par retour arrière (case la plus contrainte d'abord) en s'arrêtant à `limite` solutions.
   * Renvoie { nombre, solution } ; aleatoire = true mélange l'ordre des chiffres essayés.
   */
  function resoudre(modele, grille, limite, aleatoire) {
    const n = modele.taille;
    const tout = (1 << (n + 1)) - 2;
    const lignes = new Array(n).fill(0);
    const colonnes = new Array(n).fill(0);
    const blocs = new Array(n).fill(0);
    const g = grille.slice();
    for (let i = 0; i < n * n; i++) {
      const v = g[i];
      if (!v) continue;
      const bit = 1 << v;
      const l = Math.floor(i / n), c = i % n, b = modele.blocs[i];
      if ((lignes[l] | colonnes[c] | blocs[b]) & bit) return { nombre: 0, solution: null };
      lignes[l] |= bit; colonnes[c] |= bit; blocs[b] |= bit;
    }
    let nombre = 0;
    let solution = null;

    function explorer() {
      let meilleure = -1, meilleurMasque = 0, meilleurCompte = 99;
      for (let i = 0; i < n * n; i++) {
        if (g[i]) continue;
        const masque = tout & ~(lignes[Math.floor(i / n)] | colonnes[i % n] | blocs[modele.blocs[i]]);
        if (!masque) return false;
        const compte = nombreDeBits(masque);
        if (compte < meilleurCompte) {
          meilleure = i; meilleurMasque = masque; meilleurCompte = compte;
          if (compte === 1) break;
        }
      }
      if (meilleure < 0) {
        nombre++;
        if (!solution) solution = g.slice();
        return nombre >= limite;
      }
      let candidats = [];
      for (let v = 1; v <= n; v++) if (meilleurMasque & (1 << v)) candidats.push(v);
      if (aleatoire) candidats = JS.UI.melanger(candidats);
      const l = Math.floor(meilleure / n), c = meilleure % n, b = modele.blocs[meilleure];
      for (const v of candidats) {
        const bit = 1 << v;
        g[meilleure] = v;
        lignes[l] |= bit; colonnes[c] |= bit; blocs[b] |= bit;
        const fini = explorer();
        lignes[l] &= ~bit; colonnes[c] &= ~bit; blocs[b] &= ~bit;
        if (fini) { g[meilleure] = 0; return true; }
      }
      g[meilleure] = 0;
      return false;
    }

    explorer();
    return { nombre, solution };
  }

  /** Une grille complète tirée au hasard. */
  function grilleComplete(modele) {
    const vide = new Array(modele.taille * modele.taille).fill(0);
    return resoudre(modele, vide, 1, true).solution;
  }

  /** Retire des cases au hasard tant que la solution reste unique. */
  function retirerCases(modele, solution, cible) {
    const depart = solution.slice();
    let vides = 0;
    for (const i of JS.UI.melanger(depart.map((_, k) => k))) {
      if (vides >= cible) break;
      const v = depart[i];
      depart[i] = 0;
      if (resoudre(modele, depart, 2, false).nombre === 1) vides++;
      else depart[i] = v;
    }
    return { depart, vides };
  }

  /** Génère la grille d'un niveau : { modele, solution, depart, vides }. */
  function genererGrille(niveau) {
    const [taille, hb, lb, cible] = NIVEAUX[niveau - 1];
    const modele = creerModele(taille, hb, lb);
    let meilleur = null;
    for (let essai = 0; essai < 6; essai++) {
      const solution = grilleComplete(modele);
      const { depart, vides } = retirerCases(modele, solution, cible);
      if (!meilleur || vides > meilleur.vides) meilleur = { modele, solution, depart, vides };
      if (vides >= cible) break;
    }
    return meilleur;
  }

  /* ---------- Styles propres au jeu ---------- */

  function injecterStyle() {
    if (document.getElementById('style-sudoku')) return;
    document.head.append(el('style', { id: 'style-sudoku' }, `
.sdk-disposition { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 1.2rem; width: 100%; }
.sdk-grille { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); width: 100%; max-width: var(--largeur-max); border: 0.25rem solid var(--texte); background: var(--carte); }
.sdk-case { position: relative; aspect-ratio: 1 / 1; min-width: 0; padding: 0; border: 0 solid var(--bord); border-right-width: 0.06rem; border-bottom-width: 0.06rem; background: var(--carte); color: var(--primaire); font: inherit; font-size: var(--taille-chiffre); font-weight: 500; line-height: 1; cursor: pointer; touch-action: manipulation; user-select: none; }
.sdk-case.sdk-droite { border-right: 0.22rem solid var(--texte); }
.sdk-case.sdk-bas { border-bottom: 0.22rem solid var(--texte); }
.sdk-case.sdk-fin-ligne { border-right-width: 0; }
.sdk-case.sdk-fin-colonne { border-bottom-width: 0; }
.sdk-case.sdk-donnee { color: var(--texte); font-weight: 800; cursor: default; }
.sdk-case.sdk-aide { text-decoration: underline; text-decoration-thickness: 0.12rem; text-underline-offset: 0.2rem; }
.sdk-case.sdk-zone { background: var(--primaire-clair); }
.sdk-case.sdk-meme { background: var(--accent-clair); box-shadow: inset 0 0 0 0.18rem var(--accent); }
.sdk-case.sdk-selection { outline: 0.28rem solid var(--focus); outline-offset: -0.28rem; z-index: 1; }
.sdk-case.sdk-faux { background: var(--attention-clair); box-shadow: inset 0 0 0 0.2rem var(--attention); color: var(--attention); }
.sdk-case.sdk-faux::after { content: '✗'; position: absolute; top: 0.05rem; right: 0.15rem; font-size: 0.8rem; font-weight: 800; color: var(--attention); }
.sdk-cote { display: flex; flex-direction: column; gap: 0.8rem; width: 100%; max-width: 20rem; }
.sdk-pave { display: grid; grid-template-columns: repeat(var(--colonnes-pave), minmax(0, 1fr)); gap: 0.5rem; }
.sdk-pave .btn { font-size: 1.6rem; min-height: 3.8rem; padding: 0.2rem; }
.sdk-cote .ligne-boutons { margin-top: 0; }
.sdk-cote .ligne-boutons .btn { flex: 1 1 8rem; }
`));
  }

  /* ---------- Jeu ---------- */

  JS.Jeux.register({
    id: 'sudoku',
    nom: 'Sudoku',
    categorie: 'logique',
    icone: '🔢',
    description: 'Placez les chiffres pour que chacun apparaisse une seule fois par ligne, colonne et bloc.',
    consigne: 'Touchez une case vide, puis touchez un chiffre en bas pour l\'y placer. Chaque chiffre doit apparaître une seule fois dans chaque ligne, chaque colonne et chaque bloc entouré d\'un trait épais. Les chiffres en gras sont donnés au départ. Le bouton « Vérifier » repère les cases à revoir, le bouton « Indice » remplit une case pour vous. Prenez tout votre temps.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [taille, hb, lb, vides] = NIVEAUX[n - 1];
      const chiffres = 'chiffres de 1 à ' + taille;
      const blocs = hb === lb ? 'blocs de ' + hb + '×' + lb : 'blocs de ' + hb + ' lignes sur ' + lb + ' colonnes';
      return 'grille de ' + taille + '×' + taille + ' (' + chiffres + ', ' + blocs + '), environ ' + vides + ' cases à remplir';
    },
    logique: { creerModele, resoudre, genererGrille, NIVEAUX },

    start(ctx) {
      injecterStyle();
      const { modele, solution, depart, vides } = genererGrille(ctx.niveau);
      const n = modele.taille;
      const valeurs = depart.slice();
      const fixe = depart.map(v => v !== 0);
      const aidee = new Array(n * n).fill(false);
      let faux = new Set();
      let selection = valeurs.indexOf(0);
      let indices = 0;
      let verificationsFautives = 0;
      let termine = false;

      const ligneDe = i => Math.floor(i / n);
      const colonneDe = i => i % n;

      const compteur = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const grille = el('div', {
        class: 'sdk-grille',
        role: 'group',
        'aria-label': 'Grille de sudoku de ' + n + ' cases sur ' + n,
        // Variables CSS passées en texte : style['--x'] = … n'a aucun effet dans les navigateurs.
        style: '--n: ' + n + '; --largeur-max: ' + (n === 9 ? 28 : n === 6 ? 24 : 19) + 'rem; --taille-chiffre: ' +
          (n === 9 ? 1.45 : n === 6 ? 1.9 : 2.4) + 'rem'
      });
      const cases = valeurs.map((_, i) => {
        const l = ligneDe(i), c = colonneDe(i);
        const classes = ['sdk-case'];
        if (c % modele.largeurBloc === modele.largeurBloc - 1 && c < n - 1) classes.push('sdk-droite');
        if (l % modele.hauteurBloc === modele.hauteurBloc - 1 && l < n - 1) classes.push('sdk-bas');
        if (c === n - 1) classes.push('sdk-fin-ligne');
        if (l === n - 1) classes.push('sdk-fin-colonne');
        return el('button', { class: classes.join(' '), type: 'button', onclick: () => choisirCase(i) });
      });
      grille.append(...cases);

      const pave = el('div', {
        class: 'sdk-pave',
        role: 'group',
        'aria-label': 'Chiffres',
        style: '--colonnes-pave: ' + (n === 4 ? 2 : 3)
      });
      for (let v = 1; v <= n; v++) {
        pave.append(el('button', { class: 'btn', type: 'button', 'aria-label': 'Placer le chiffre ' + v, onclick: () => placer(v) }, String(v)));
      }

      const cote = el('div', { class: 'sdk-cote' },
        pave,
        el('div', { class: 'ligne-boutons' },
          el('button', { class: 'btn btn-secondaire', type: 'button', onclick: () => placer(0) },
            el('span', { 'aria-hidden': 'true' }, '⌫'), ' Effacer')
        ),
        el('div', { class: 'ligne-boutons' },
          el('button', { class: 'btn btn-primaire', type: 'button', onclick: verifier },
            el('span', { 'aria-hidden': 'true' }, '✔'), ' Vérifier'),
          el('button', { class: 'btn btn-secondaire', type: 'button', onclick: donnerIndice },
            el('span', { 'aria-hidden': 'true' }, '💡'), ' Indice')
        )
      );

      ctx.root.append(compteur, el('div', { class: 'sdk-disposition' }, grille, cote));
      majAffichage();
      ctx.message('Touchez une case vide, puis un chiffre.', 'info');

      function memeBloc(a, b) {
        return modele.blocs[a] === modele.blocs[b];
      }

      function majAffichage() {
        const valeurSel = selection >= 0 ? valeurs[selection] : 0;
        cases.forEach((b, i) => {
          const v = valeurs[i];
          b.textContent = v ? String(v) : '';
          const dansZone = selection >= 0 && i !== selection &&
            (ligneDe(i) === ligneDe(selection) || colonneDe(i) === colonneDe(selection) || memeBloc(i, selection));
          b.classList.toggle('sdk-donnee', fixe[i]);
          b.classList.toggle('sdk-aide', aidee[i]);
          b.classList.toggle('sdk-selection', i === selection);
          b.classList.toggle('sdk-zone', dansZone);
          b.classList.toggle('sdk-meme', !!valeurSel && v === valeurSel && i !== selection);
          b.classList.toggle('sdk-faux', faux.has(i));
          let label = 'Ligne ' + (ligneDe(i) + 1) + ', colonne ' + (colonneDe(i) + 1) + ' : ' + (v ? String(v) : 'vide');
          if (aidee[i]) label += ', donné en indice';
          else if (fixe[i]) label += ', donné au départ';
          if (faux.has(i)) label += ', à revoir';
          if (i === selection) label += ', sélectionnée';
          b.setAttribute('aria-label', label);
          b.setAttribute('aria-pressed', String(i === selection));
        });
        const restantes = valeurs.filter(v => !v).length;
        compteur.textContent = restantes
          ? 'Cases à remplir : ' + restantes + (indices ? ' — indices utilisés : ' + indices : '')
          : 'La grille est remplie.';
      }

      function choisirCase(i) {
        if (termine) return;
        ctx.audio.clic();
        selection = i;
        if (fixe[i]) ctx.message('Ce chiffre ' + (aidee[i] ? 'vient d\'un indice' : 'est donné au départ') + ' : il ne peut pas être changé.', 'info');
        else ctx.message('', 'info');
        majAffichage();
      }

      function placer(v) {
        if (termine) return;
        if (selection < 0) {
          ctx.message('Touchez d\'abord une case de la grille.', 'info');
          return;
        }
        if (fixe[selection]) {
          ctx.message('Cette case est déjà donnée. Choisissez une case vide.', 'info');
          return;
        }
        ctx.audio.clic();
        valeurs[selection] = v;
        faux.delete(selection);
        ctx.message('', 'info');
        majAffichage();
        verifierFin();
      }

      function verifierFin() {
        if (valeurs.some(v => !v)) return;
        if (valeurs.every((v, i) => v === solution[i])) {
          terminer();
        } else {
          ctx.message('La grille est remplie, mais quelques cases sont à revoir. Touchez « Vérifier » pour les repérer.', 'info');
        }
      }

      function verifier() {
        if (termine) return;
        const erreurs = [];
        valeurs.forEach((v, i) => { if (v && !fixe[i] && v !== solution[i]) erreurs.push(i); });
        faux = new Set(erreurs);
        majAffichage();
        if (erreurs.length) {
          verificationsFautives++;
          ctx.audio.erreur();
          ctx.message((erreurs.length === 1 ? 'Une case est à revoir' : erreurs.length + ' cases sont à revoir') +
            ' : elle' + (erreurs.length > 1 ? 's sont marquées' : ' est marquée') + ' d\'une croix ✗. Pas d\'inquiétude, vous pouvez la changer.', 'info');
        } else {
          const restantes = valeurs.filter(v => !v).length;
          ctx.audio.succes();
          ctx.message('Tout est juste pour l\'instant ! Encore ' + JS.UI.pluriel(restantes, 'case') + ' à remplir.', 'succes');
        }
      }

      function donnerIndice() {
        if (termine) return;
        let cible = -1;
        if (selection >= 0 && !fixe[selection] && valeurs[selection] !== solution[selection]) cible = selection;
        if (cible < 0) {
          const fausses = valeurs.map((v, i) => i).filter(i => !fixe[i] && valeurs[i] && valeurs[i] !== solution[i]);
          const videsRestantes = valeurs.map((v, i) => i).filter(i => !valeurs[i]);
          cible = fausses.length ? fausses[0] : JS.UI.choisir(videsRestantes);
        }
        if (cible == null || cible < 0) return;
        indices++;
        valeurs[cible] = solution[cible];
        fixe[cible] = true;
        aidee[cible] = true;
        faux.delete(cible);
        selection = cible;
        ctx.audio.clic();
        ctx.message('Voici un coup de pouce : un ' + solution[cible] + ' ligne ' + (ligneDe(cible) + 1) + ', colonne ' + (colonneDe(cible) + 1) + ' (souligné).', 'info');
        majAffichage();
        verifierFin();
      }

      function terminer() {
        termine = true;
        selection = -1;
        faux = new Set();
        majAffichage();
        cases.forEach(b => { b.disabled = true; });
        ctx.audio.succes();
        ctx.message('Bravo, la grille est complète et juste !', 'succes');
        const reussite = Math.max(0.3, Math.min(1, 1 - 0.6 * indices / Math.max(1, vides) - 0.05 * verificationsFautives));
        ctx.plusTard(() => ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: 'Grille de ' + n + '×' + n + ' complétée ' +
            (indices ? 'avec ' + JS.UI.pluriel(indices, 'indice') : 'sans indice') + '.'
        }), 1200);
      }

      function deplacer(dl, dc) {
        if (selection < 0) { selection = 0; majAffichage(); return; }
        const l = (ligneDe(selection) + dl + n) % n;
        const c = (colonneDe(selection) + dc + n) % n;
        selection = l * n + c;
        majAffichage();
        cases[selection].focus();
      }

      // Bonus clavier : chiffres, effacement et flèches.
      function clavier(e) {
        if (termine || e.ctrlKey || e.altKey || e.metaKey) return;
        if (document.querySelector('dialog[open]')) return;
        const chiffre = Number(e.key);
        if (e.key.length === 1 && chiffre >= 1 && chiffre <= n) { placer(chiffre); e.preventDefault(); }
        else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { placer(0); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { deplacer(-1, 0); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { deplacer(1, 0); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { deplacer(0, -1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { deplacer(0, 1); e.preventDefault(); }
      }
      document.addEventListener('keydown', clavier);
      return () => document.removeEventListener('keydown', clavier);
    }
  });
})();
