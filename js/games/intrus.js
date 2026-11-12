/* Trouver l'intrus : dans une grille d'images identiques, une seule est légèrement différente. */
(function () {
  'use strict';
  const { el } = JS.UI;

  /*
   * Paires [image habituelle, intrus], de la plus facile (1) à la plus proche (3).
   * Aucune paire ne diffère seulement par la couleur : il y a toujours une différence de forme.
   */
  const PAIRES = {
    1: [
      ['🐶', '🐱'], ['☀️', '🌙'], ['🌻', '🌹'], ['🚗', '🚲'], ['⚽', '🏀'], ['🍌', '🍐'], ['🐟', '🐢'],
      ['🏠', '⛪'], ['✏️', '✂️'], ['🎈', '🎁'], ['🔑', '🔒'], ['🍓', '🍒'], ['🐭', '🐸'], ['☂️', '👒']
    ],
    2: [
      ['🙂', '😐'], ['😊', '😢'], ['🐱', '🐯'], ['🐭', '🐹'], ['🌲', '🌳'], ['🍋', '🍊'], ['🚗', '🚙'],
      ['🏠', '🏡'], ['☁️', '⛅'], ['🐔', '🐤'], ['🐶', '🐕'], ['👍', '👎'], ['🐮', '🐷'], ['🌷', '🌹']
    ],
    3: [
      ['🙂', '🙃'], ['🕐', '🕑'], ['🕒', '🕓'], ['⭐', '🌟'], ['😀', '😃'], ['😄', '😁'], ['😺', '😸'],
      ['🔉', '🔊'], ['🌖', '🌕'], ['🙂', '😊'], ['✋', '🤚'], ['🌘', '🌗'], ['😐', '😑']
    ]
  };

  // [taille de la grille, familles de paires utilisées, nombre de manches]
  const NIVEAUX = [
    [3, [1], 6],
    [4, [1], 6],
    [4, [1, 2], 6],
    [5, [2], 5],
    [5, [2, 3], 5],
    [6, [2, 3], 5],
    [6, [3], 5],
    [7, [3], 5]
  ];

  // Réussite d'une manche selon le nombre d'essais en trop.
  const POINTS = [1, 0.75, 0.5, 0.35];
  // Nombre d'essais en trop avant de proposer un indice.
  const SEUIL_INDICE = 2;

  const CSS = `
    .in-case { position: relative; }
    .in-case.in-indice { border-style: dashed; border-color: var(--primaire); background: var(--primaire-clair); }
    .in-case.correct::after {
      content: '✓'; position: absolute; top: -0.45rem; right: -0.45rem;
      width: 1.4rem; height: 1.4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: var(--succes); color: var(--carte); font-size: 0.85rem;
    }
  `;

  function injecterStyle() {
    if (document.getElementById('style-intrus')) return;
    document.head.append(el('style', { id: 'style-intrus' }, CSS));
  }

  JS.Jeux.register({
    id: 'intrus',
    nom: 'Trouver l\'intrus',
    categorie: 'visuelle',
    icone: '🕵️',
    description: 'Toutes les images se ressemblent… sauf une !',
    consigne: 'Toutes les images de la grille sont identiques, sauf une qui est légèrement différente : c\'est l\'intrus. Regardez attentivement et touchez-le. Si vous vous trompez, ce n\'est pas grave : continuez à chercher, un indice vous aidera si besoin.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [taille, familles, manches] = NIVEAUX[n - 1];
      const difficulte = Math.max(...familles);
      const textes = { 1: 'images bien différentes', 2: 'images assez proches', 3: 'images très proches' };
      return 'grille de ' + taille + ' × ' + taille + ', ' + textes[difficulte] + ', ' + manches + ' manches';
    },

    start(ctx) {
      injecterStyle();
      const [taille, familles, nbManches] = NIVEAUX[ctx.niveau - 1];
      const paires = JS.UI.melanger(familles.flatMap(f => PAIRES[f]));
      const tailleEmoji = { 3: '2.6rem', 4: '2.3rem', 5: '2rem', 6: '1.75rem', 7: '1.5rem' }[taille];

      let manche = 0;
      let points = 0;
      let premierCoup = 0;   // manches réussies sans erreur
      let erreurs = 0;       // erreurs de la manche en cours
      let bloque = false;
      let indexIntrus = 0;
      let cases = [];

      const compteur = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const plateau = el('div', {
        class: 'plateau',
        style: {
          '--colonnes': taille,
          '--largeur-max': (8 + taille * 3.8) + 'rem',
          '--taille-tuile': tailleEmoji,
          '--ecart': taille > 5 ? '0.35rem' : '0.6rem'
        }
      });
      ctx.root.append(compteur, plateau);

      function nouvelleManche() {
        manche++;
        erreurs = 0;
        bloque = false;
        compteur.textContent = 'Manche ' + manche + ' sur ' + nbManches;

        // Une paire différente à chaque manche ; on inverse parfois les rôles.
        let [habituel, intrus] = paires[(manche - 1) % paires.length];
        if (Math.random() < 0.5) [habituel, intrus] = [intrus, habituel];
        indexIntrus = JS.UI.entier(0, taille * taille - 1);

        plateau.innerHTML = '';
        cases = [];
        for (let i = 0; i < taille * taille; i++) {
          const ligne = Math.floor(i / taille) + 1;
          const colonne = (i % taille) + 1;
          const b = el('button', {
            class: 'tuile in-case',
            'aria-label': 'Ligne ' + ligne + ', colonne ' + colonne,
            onclick: () => toucher(i)
          }, i === indexIntrus ? intrus : habituel);
          cases.push(b);
        }
        plateau.append(...cases);
        plateau.classList.remove('anim-apparition');
        void plateau.offsetWidth;
        plateau.classList.add('anim-apparition');
        ctx.message('Quelle image est différente des autres ?', 'info');
      }

      function toucher(i) {
        if (bloque) return;
        const b = cases[i];
        if (i === indexIntrus) {
          bloque = true;
          b.classList.remove('in-indice');
          b.classList.add('correct');
          b.setAttribute('aria-label', b.getAttribute('aria-label') + ' : l\'intrus');
          points += POINTS[Math.min(erreurs, POINTS.length - 1)];
          if (erreurs === 0) premierCoup++;
          ctx.audio.succes();
          ctx.message(erreurs === 0 ? 'Bravo, du premier coup !' : 'Bravo, vous l\'avez trouvé !', 'succes');
          ctx.plusTard(() => (manche >= nbManches ? finir() : nouvelleManche()), 1500);
          return;
        }

        erreurs++;
        ctx.audio.erreur();
        b.classList.add('incorrect', 'anim-secousse');
        ctx.plusTard(() => b.classList.remove('incorrect', 'anim-secousse'), 900);

        if (erreurs === SEUIL_INDICE) {
          // Indice : on encadre en pointillés la ligne qui contient l'intrus.
          const ligne = Math.floor(indexIntrus / taille);
          for (let c = 0; c < taille; c++) cases[ligne * taille + c].classList.add('in-indice');
          ctx.message('Petit indice : l\'intrus se trouve dans la ligne n° ' + (ligne + 1) + ', encadrée en pointillés.', 'info');
        } else if (erreurs > SEUIL_INDICE) {
          ctx.message('Pas tout à fait. Regardez bien la ligne encadrée en pointillés.', 'info');
        } else {
          ctx.message('Ce n\'est pas celle-ci. Regardez encore, prenez votre temps.', 'info');
        }
      }

      function finir() {
        const reussite = points / nbManches;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: 'Intrus trouvés : ' + nbManches + ' sur ' + nbManches + ', dont ' + premierCoup + ' du premier coup.'
        });
      }

      nouvelleManche();
    }
  });
})();
