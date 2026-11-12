/* Mastermind : retrouver un code secret de couleurs grâce aux indices « bien placé » et « mal placé ». */
(function () {
  'use strict';
  const { el, entier, melanger, pluriel } = JS.UI;

  // Chaque couleur a aussi un symbole et un nom : l'information n'est jamais portée par la seule couleur.
  const COULEURS = [
    { nom: 'rouge', forme: 'rond', symbole: '●', fond: 'var(--jeu-rouge)', texte: '#ffffff' },
    { nom: 'vert', forme: 'triangle', symbole: '▲', fond: 'var(--jeu-vert)', texte: '#ffffff' },
    { nom: 'bleu', forme: 'carré', symbole: '■', fond: 'var(--jeu-bleu)', texte: '#ffffff' },
    { nom: 'jaune', forme: 'étoile', symbole: '★', fond: 'var(--jeu-jaune)', texte: '#1b1b1b' },
    { nom: 'violet', forme: 'losange', symbole: '◆', fond: 'var(--jeu-violet)', texte: '#ffffff' },
    { nom: 'orange', forme: 'cœur', symbole: '♥︎', fond: 'var(--jeu-orange)', texte: '#ffffff' }
  ];

  // [cases, couleurs, doublons permis, essais, essais visés pour la réussite complète, codes par partie]
  const NIVEAUX = [
    [3, 3, false, 10, 3, 3],
    [3, 4, false, 10, 4, 3],
    [4, 4, false, 10, 4, 2],
    [4, 5, false, 10, 5, 2],
    [4, 6, false, 12, 6, 1],
    [4, 6, true, 12, 7, 1],
    [5, 6, false, 12, 7, 1],
    [5, 6, true, 12, 8, 1]
  ];

  /* ---------- Logique pure ---------- */

  function tirerCode(cases, nbCouleurs, doublons) {
    if (doublons) return Array.from({ length: cases }, () => entier(0, nbCouleurs - 1));
    return melanger(Array.from({ length: nbCouleurs }, (_, i) => i)).slice(0, cases);
  }

  /** Compare un essai au code : { bien, mal } (les doublons ne sont comptés qu'une fois). */
  function evaluer(code, essai) {
    let bien = 0;
    const resteCode = {};
    const resteEssai = {};
    code.forEach((c, i) => {
      if (essai[i] === c) bien++;
      else {
        resteCode[c] = (resteCode[c] || 0) + 1;
        resteEssai[essai[i]] = (resteEssai[essai[i]] || 0) + 1;
      }
    });
    let mal = 0;
    for (const c of Object.keys(resteEssai)) mal += Math.min(resteEssai[c], resteCode[c] || 0);
    return { bien, mal };
  }

  function texteRetour({ bien, mal }) {
    if (!bien && !mal) return 'Aucune de ces couleurs n\'est dans le code';
    return (bien ? pluriel(bien, 'bien placé', 'bien placés') : 'aucun bien placé') + ', ' +
      (mal ? pluriel(mal, 'mal placé', 'mal placés') : 'aucun mal placé');
  }

  /** Réussite d'un code : 1 jusqu'au nombre d'essais visé, puis baisse douce ; 0,2 si le code n'est pas trouvé. */
  function reussiteCode(trouve, essais, indices, cible) {
    if (!trouve) return 0.2;
    const effort = essais + 1.5 * indices;
    return effort <= cible ? 1 : Math.max(0.4, 1 - 0.08 * (effort - cible));
  }

  /* ---------- Styles propres au jeu ---------- */

  function injecterStyle() {
    if (document.getElementById('style-mastermind')) return;
    document.head.append(el('style', { id: 'style-mastermind' }, `
.mm-info { max-width: 44rem; text-align: center; }
.mm-pion { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 3.8rem; height: 3.8rem; padding: 0; border-radius: 50%; border: 3px solid var(--bord); background: var(--c, var(--carte)); color: var(--t, var(--texte)); font: inherit; font-size: 1.7rem; font-weight: 700; line-height: 1; }
.mm-pion.mm-vide { background: var(--carte); color: var(--texte-doux); border-style: dashed; font-size: 1.1rem; }
.mm-pion.mm-petit { width: 2.5rem; height: 2.5rem; font-size: 1.15rem; border-width: 2px; }
button.mm-pion { cursor: pointer; touch-action: manipulation; }
.mm-pion.mm-selection { outline: 0.3rem solid var(--focus); outline-offset: 0.2rem; }
.mm-historique { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; width: 100%; max-width: 44rem; }
.mm-historique li { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem 0.8rem; padding: 0.4rem 0.7rem; border: 2px solid var(--bord-leger); border-radius: var(--rayon); background: var(--carte); }
.mm-historique li.mm-gagne { border-color: var(--succes); background: var(--succes-clair); }
.mm-numero { font-weight: 700; min-width: 5.5rem; }
.mm-pions { display: flex; gap: 0.35rem; }
.mm-retour { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-weight: 600; }
.mm-fiches { font-size: 1.3rem; letter-spacing: 0.1rem; white-space: nowrap; }
.mm-ligne { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.7rem; padding: 0.8rem; border: 3px solid var(--primaire); border-radius: var(--rayon); background: var(--primaire-clair); }
.mm-palette { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem; width: 100%; max-width: 44rem; }
.mm-palette .btn { flex-direction: column; gap: 0.25rem; min-width: 5.6rem; padding: 0.4rem 0.6rem; }
.mm-palette .btn .mm-pion { width: 3rem; height: 3rem; font-size: 1.4rem; }
.mm-code { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.5rem; font-weight: 700; }
`));
  }

  /* ---------- Jeu ---------- */

  JS.Jeux.register({
    id: 'mastermind',
    nom: 'Mastermind',
    categorie: 'logique',
    icone: '🎯',
    description: 'Retrouvez le code secret de couleurs grâce aux indices.',
    consigne: 'L\'ordinateur a caché un code de couleurs. Chaque couleur a aussi son symbole. Touchez une case de la ligne en cours, puis une couleur de la palette, jusqu\'à remplir la ligne, et touchez « Valider ». L\'ordinateur vous dit alors combien de couleurs sont « bien placées » (bonne couleur à la bonne place) et combien sont « mal placées » (couleur présente dans le code, mais ailleurs). Servez-vous de ces indices pour trouver le code. Le bouton « Indice » dévoile une case. Rien ne presse, les essais sont nombreux.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [cases, couleurs, doublons, essais, , codes] = NIVEAUX[n - 1];
      return 'code de ' + cases + ' cases parmi ' + couleurs + ' couleurs, ' +
        (doublons ? 'une couleur peut se répéter' : 'sans couleur répétée') + ', ' + essais + ' essais' +
        (codes > 1 ? ', ' + codes + ' codes à trouver' : '');
    },
    logique: { evaluer, tirerCode, texteRetour, reussiteCode, NIVEAUX, COULEURS },

    start(ctx) {
      injecterStyle();
      const [nbCases, nbCouleurs, doublons, essaisMax, cible, nbCodes] = NIVEAUX[ctx.niveau - 1];
      const couleurs = COULEURS.slice(0, nbCouleurs);

      let numeroCode = 0;
      let code = [];
      let essais = [];
      let ligne = [];
      let selection = 0;
      let indicesDevoiles = [];
      let fini = false;
      const resultats = [];

      const enonce = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const info = el('p', { class: 'mm-info texte-doux' },
        'Le code a ' + nbCases + ' cases, avec ' + nbCouleurs + ' couleurs possibles, ' +
        (doublons ? 'et une même couleur peut apparaître plusieurs fois.' : 'et chaque couleur n\'apparaît qu\'une fois au plus.'));
      const historique = el('ol', { class: 'mm-historique', 'aria-label': 'Essais précédents' });
      const zoneIndices = el('p', { class: 'mm-info', 'aria-live': 'polite' });
      const ligneEnCours = el('div', { class: 'mm-ligne', role: 'group', 'aria-label': 'Ligne en cours' });
      const palette = el('div', { class: 'mm-palette', role: 'group', 'aria-label': 'Palette de couleurs' },
        couleurs.map((c, i) => el('button', {
          class: 'btn btn-secondaire',
          type: 'button',
          'aria-label': 'Couleur ' + c.nom + ', symbole ' + c.forme,
          onclick: () => poserCouleur(i)
        }, pion(i, 'span'), el('span', { 'aria-hidden': 'true' }, c.nom)))
      );
      const boutonEffacer = el('button', { class: 'btn btn-secondaire', type: 'button', onclick: effacer },
        el('span', { 'aria-hidden': 'true' }, '⌫'), ' Effacer');
      const boutonRecopier = el('button', { class: 'btn btn-secondaire', type: 'button', onclick: recopier },
        el('span', { 'aria-hidden': 'true' }, '↺'), ' Recopier l\'essai précédent');
      const boutonIndice = el('button', { class: 'btn btn-secondaire', type: 'button', onclick: donnerIndice },
        el('span', { 'aria-hidden': 'true' }, '💡'), ' Indice');
      const boutonValider = el('button', { class: 'btn btn-primaire btn-grand', type: 'button', onclick: valider },
        el('span', { 'aria-hidden': 'true' }, '✔'), ' Valider');
      const zoneJeu = el('div', { class: 'ligne-boutons centre' }, boutonEffacer, boutonRecopier, boutonIndice, boutonValider);
      const zoneCode = el('div', { class: 'mm-code', 'aria-live': 'polite' });
      const boutonSuite = el('button', { class: 'btn btn-primaire btn-grand', type: 'button', hidden: true, onclick: codeSuivant }, 'Code suivant ▶');

      ctx.root.append(enonce, info, historique, zoneIndices, ligneEnCours, palette, zoneJeu, zoneCode,
        el('div', { class: 'ligne-boutons centre' }, boutonSuite));

      /** Un pion de couleur (avec son symbole) ; indice null = case vide. */
      function pion(indice, balise, attributs) {
        const c = indice == null ? null : COULEURS[indice];
        const a = Object.assign({
          class: 'mm-pion' + (c ? '' : ' mm-vide'),
          style: c ? '--c: ' + c.fond + '; --t: ' + c.texte : null,
          'aria-hidden': balise === 'span' ? 'true' : null
        }, attributs || {});
        return el(balise, a, c ? c.symbole : '');
      }

      function nomCouleur(i) {
        return COULEURS[i].nom + ' (' + COULEURS[i].forme + ')';
      }

      function nouveauCode() {
        code = tirerCode(nbCases, nbCouleurs, doublons);
        essais = [];
        indicesDevoiles = [];
        fini = false;
        historique.replaceChildren();
        zoneIndices.textContent = '';
        zoneCode.replaceChildren();
        boutonSuite.hidden = true;
        palette.hidden = false;
        zoneJeu.hidden = false;
        ligneEnCours.hidden = false;
        viderLigne();
        ctx.message(nbCodes > 1 ? 'Code ' + (numeroCode + 1) + ' sur ' + nbCodes + ' : à vous de jouer !' : 'Composez votre premier essai.', 'info');
        afficher();
      }

      function viderLigne() {
        ligne = new Array(nbCases).fill(null);
        indicesDevoiles.forEach(p => { ligne[p] = code[p]; });
        selection = ligne.indexOf(null);
        if (selection < 0) selection = 0;
      }

      function afficher() {
        const restants = essaisMax - essais.length;
        enonce.textContent = (nbCodes > 1 ? 'Code ' + (numeroCode + 1) + ' sur ' + nbCodes + ' — ' : '') +
          (fini ? 'Essais utilisés : ' + essais.length : 'Essai ' + (essais.length + 1) + ' — essais restants : ' + restants);
        ligneEnCours.replaceChildren(...ligne.map((v, i) => {
          const b = pion(v, 'button', {
            class: 'mm-pion' + (v == null ? ' mm-vide' : '') + (i === selection ? ' mm-selection' : ''),
            type: 'button',
            'aria-pressed': String(i === selection),
            'aria-label': 'Case ' + (i + 1) + ' : ' + (v == null ? 'vide' : nomCouleur(v)) + (i === selection ? ', sélectionnée' : ''),
            onclick: () => choisirCase(i)
          });
          // Les cases vides affichent leur numéro pour s'y retrouver.
          if (v == null) b.textContent = String(i + 1);
          return b;
        }));
        boutonRecopier.disabled = !essais.length;
        boutonIndice.disabled = indicesDevoiles.length >= nbCases - 1;
      }

      function choisirCase(i) {
        if (fini) return;
        ctx.audio.clic();
        selection = i;
        afficher();
      }

      function poserCouleur(c) {
        if (fini) return;
        ctx.audio.clic();
        ligne[selection] = c;
        // Passe à la prochaine case vide (en repartant du début si besoin).
        for (let k = 1; k <= nbCases; k++) {
          const j = (selection + k) % nbCases;
          if (ligne[j] == null) { selection = j; break; }
        }
        ctx.message('', 'info');
        afficher();
      }

      function effacer() {
        if (fini) return;
        ctx.audio.clic();
        if (ligne[selection] == null) {
          // Case déjà vide : on efface la dernière case remplie avant elle.
          for (let k = 1; k < nbCases; k++) {
            const j = (selection - k + nbCases) % nbCases;
            if (ligne[j] != null) { selection = j; break; }
          }
        }
        ligne[selection] = null;
        afficher();
      }

      function recopier() {
        if (fini || !essais.length) return;
        ctx.audio.clic();
        ligne = essais[essais.length - 1].essai.slice();
        selection = 0;
        afficher();
      }

      function donnerIndice() {
        if (fini) return;
        const caches = code.map((_, i) => i).filter(i => !indicesDevoiles.includes(i));
        if (caches.length <= 1) return;
        // Dévoile de préférence une case encore fausse dans la ligne en cours.
        const fausses = caches.filter(i => ligne[i] !== code[i]);
        const p = JS.UI.choisir(fausses.length ? fausses : caches);
        indicesDevoiles.push(p);
        indicesDevoiles.sort((a, b) => a - b);
        ligne[p] = code[p];
        ctx.audio.clic();
        zoneIndices.textContent = 'Indices : ' + indicesDevoiles.map(i => 'case ' + (i + 1) + ' = ' + COULEURS[code[i]].symbole + ' ' + COULEURS[code[i]].nom).join(' ; ') + '.';
        ctx.message('Coup de pouce : la case ' + (p + 1) + ' est ' + nomCouleur(code[p]) + '. Elle est déjà placée dans votre ligne.', 'info');
        afficher();
      }

      function valider() {
        if (fini) return;
        const manquantes = ligne.filter(v => v == null).length;
        if (manquantes) {
          ctx.message('Il manque encore ' + pluriel(manquantes, 'couleur') + ' dans votre ligne.', 'info');
          return;
        }
        const retour = evaluer(code, ligne);
        essais.push({ essai: ligne.slice(), retour });
        const gagne = retour.bien === nbCases;
        historique.append(el('li', { class: gagne ? 'mm-gagne' : null },
          el('span', { class: 'mm-numero' }, 'Essai ' + essais.length),
          el('span', { class: 'mm-pions', role: 'img', 'aria-label': ligne.map(nomCouleur).join(', ') }, ligne.map(v => pion(v, 'span', { class: 'mm-pion mm-petit' }))),
          el('span', { class: 'mm-retour' },
            el('span', { class: 'mm-fiches', 'aria-hidden': 'true' }, '●'.repeat(retour.bien) + '○'.repeat(retour.mal)),
            el('span', null, gagne ? 'Code trouvé !' : texteRetour(retour)))
        ));
        if (gagne) {
          ctx.audio.succes();
          ctx.message('Bravo ! Vous avez trouvé le code en ' + pluriel(essais.length, 'essai') + '.', 'succes');
          finirCode(true);
          return;
        }
        ctx.audio.clic();
        if (essais.length >= essaisMax) {
          ctx.message('Les essais sont terminés. Voici le code secret : vous y étiez presque, ce n\'est que partie remise !', 'info');
          finirCode(false);
          return;
        }
        ctx.message(texteRetour(retour) + '.', 'info');
        viderLigne();
        afficher();
      }

      function finirCode(trouve) {
        fini = true;
        resultats.push({ trouve, essais: essais.length, reussite: reussiteCode(trouve, essais.length, indicesDevoiles.length, cible) });
        palette.hidden = true;
        zoneJeu.hidden = true;
        ligneEnCours.hidden = true;
        zoneCode.replaceChildren(
          el('span', null, 'Le code secret était :'),
          el('span', { class: 'mm-pions', role: 'img', 'aria-label': code.map(nomCouleur).join(', ') }, code.map(v => pion(v, 'span'))),
          el('span', { class: 'texte-doux' }, code.map(v => COULEURS[v].nom).join(', '))
        );
        numeroCode++;
        afficher();
        // Code trouvé : on enchaîne seul. Sinon, bouton pour observer le code secret à son rythme.
        if (trouve) {
          ctx.enchainer(codeSuivant, 3000);
          return;
        }
        boutonSuite.textContent = numeroCode < nbCodes ? 'Code suivant ▶' : 'Voir le résultat ▶';
        boutonSuite.hidden = false;
        boutonSuite.focus();
      }

      function codeSuivant() {
        ctx.audio.clic();
        if (numeroCode < nbCodes) {
          nouveauCode();
          return;
        }
        boutonSuite.disabled = true;
        const reussite = resultats.reduce((s, r) => s + r.reussite, 0) / resultats.length;
        const trouves = resultats.filter(r => r.trouve).length;
        const totalEssais = resultats.reduce((s, r) => s + r.essais, 0);
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: nbCodes > 1
            ? pluriel(trouves, 'code trouvé', 'codes trouvés') + ' sur ' + nbCodes + ', en ' + pluriel(totalEssais, 'essai') + ' au total.'
            : (trouves ? 'Code trouvé en ' + pluriel(totalEssais, 'essai') + '.' : 'Code non trouvé cette fois-ci, mais chaque essai entraîne la logique.')
        });
      }

      // Bonus clavier : chiffres pour les couleurs, flèches, effacement, Entrée pour valider.
      function clavier(e) {
        if (fini || e.ctrlKey || e.altKey || e.metaKey || document.querySelector('dialog[open]')) return;
        const k = Number(e.key);
        if (k >= 1 && k <= nbCouleurs) { e.preventDefault(); poserCouleur(k - 1); }
        else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); effacer(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); choisirCase((selection - 1 + nbCases) % nbCases); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); choisirCase((selection + 1) % nbCases); }
        else if (e.key === 'Enter' && !(e.target.closest && e.target.closest('button, a, input, select, textarea'))) {
          e.preventDefault();
          valider();
        }
      }
      document.addEventListener('keydown', clavier);

      nouveauCode();
      return () => document.removeEventListener('keydown', clavier);
    }
  });
})();
