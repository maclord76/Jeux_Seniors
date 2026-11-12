/* Objet manquant (jeu de Kim) : observer des objets, puis retrouver celui qui a disparu. */
(function () {
  'use strict';
  const { el } = JS.UI;

  // [emoji, nom]
  const OBJETS = [
    ['🍎', 'Pomme'], ['🍌', 'Banane'], ['🍇', 'Raisin'], ['🍓', 'Fraise'], ['🍐', 'Poire'],
    ['🍒', 'Cerises'], ['🥕', 'Carotte'], ['🌽', 'Maïs'], ['🍞', 'Pain'], ['🧀', 'Fromage'],
    ['🐶', 'Chien'], ['🐱', 'Chat'], ['🐰', 'Lapin'], ['🐮', 'Vache'], ['🐷', 'Cochon'],
    ['🐔', 'Poule'], ['🦋', 'Papillon'], ['🐟', 'Poisson'], ['🌻', 'Tournesol'], ['🌹', 'Rose'],
    ['🌲', 'Sapin'], ['🍄', 'Champignon'], ['☀️', 'Soleil'], ['🌙', 'Lune'], ['⭐', 'Étoile'],
    ['☂️', 'Parapluie'], ['🎈', 'Ballon de baudruche'], ['🎁', 'Cadeau'], ['📚', 'Livres'], ['✏️', 'Crayon'],
    ['⏰', 'Réveil'], ['🎩', 'Chapeau'], ['👓', 'Lunettes'], ['🔑', 'Clé'], ['🧸', 'Ours en peluche'],
    ['⚽', 'Ballon de football'], ['🎸', 'Guitare'], ['🚲', 'Vélo'], ['⛵', 'Voilier'], ['🏠', 'Maison'],
    ['🚗', 'Voiture'], ['✂️', 'Ciseaux'], ['☕', 'Tasse de café'], ['🔔', 'Cloche'], ['📷', 'Appareil photo'],
    ['⌚', 'Montre'], ['🕯️', 'Bougie'], ['🎺', 'Trompette']
  ];

  // [nombre d'objets, objets manquants, positions mélangées, nombre de propositions]
  const NIVEAUX = [
    [4, 1, false, 4],
    [5, 1, false, 4],
    [6, 1, false, 5],
    [6, 1, true, 5],
    [7, 1, true, 6],
    [8, 1, true, 6],
    [8, 2, true, 7],
    [10, 2, true, 8]
  ];
  const MANCHES = 5;

  const CSS = `
    .om-objet { position: relative; cursor: default; }
    .om-objet.om-trou { border-style: dashed; border-color: var(--bord-leger); background: var(--fond); color: var(--texte-doux); font-size: 1.4rem; }
    .om-objet.correct { outline: 4px dashed var(--succes); outline-offset: 2px; }
    .om-objet.correct::after {
      content: '✓'; position: absolute; top: -0.5rem; right: -0.5rem;
      width: 1.5rem; height: 1.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: var(--succes); color: var(--carte); font-size: 0.9rem;
    }
    .om-proposition { flex-direction: column; gap: 0.2rem; }
    .om-proposition .om-emoji { font-size: 2.2rem; line-height: 1.1; }
    .om-bas { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  `;

  function injecterStyle() {
    if (document.getElementById('style-objet-manquant')) return;
    document.head.append(el('style', { id: 'style-objet-manquant' }, CSS));
  }

  /** « Objet disparu : 🍎 Pomme » ou « Objets disparus : 🍎 Pomme et 🐱 Chat ». */
  function nommer(objets) {
    return (objets.length > 1 ? 'Objets disparus : ' : 'Objet disparu : ') + objets.map(o => o[0] + ' ' + o[1]).join(' et ');
  }

  JS.Jeux.register({
    id: 'objet-manquant',
    nom: 'Objet manquant',
    categorie: 'visuelle',
    icone: '🔍',
    description: 'Observez des objets, puis retrouvez celui qui a disparu.',
    consigne: 'Des objets s\'affichent : observez-les bien, sans vous presser. Touchez « J\'ai bien regardé » quand vous êtes prêt. Les objets se cachent puis réapparaissent, mais l\'un d\'eux a disparu : touchez-le parmi les propositions. Aux derniers niveaux, deux objets disparaissent.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [nb, manquants, melange] = NIVEAUX[n - 1];
      return nb + ' objets, ' + (manquants > 1 ? '2 objets disparaissent' : '1 objet disparaît') +
        (melange ? ', les objets changent de place' : ', les objets restent à leur place');
    },

    start(ctx) {
      injecterStyle();
      const [nbObjets, nbManquants, melange, nbPropositions] = NIVEAUX[ctx.niveau - 1];
      const colonnes = nbObjets <= 4 ? nbObjets : nbObjets <= 6 ? 3 : nbObjets <= 8 ? 4 : 5;

      let manche = 0;
      let points = 0;        // somme des réussites de chaque manche (0 à 1)
      let trouvesTotal = 0;  // objets disparus correctement retrouvés
      let jeton = 0;         // invalide les minuteries d'une phase terminée
      let tour = null;       // données de la manche en cours

      const compteur = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const plateau = el('div', {
        class: 'plateau',
        style: { '--colonnes': colonnes, '--largeur-max': (colonnes * 7) + 'rem', '--taille-tuile': colonnes > 4 ? '2.2rem' : '2.6rem' }
      });
      const zoneBas = el('div', { class: 'om-bas' });
      ctx.root.append(compteur, plateau, zoneBas);

      function majCompteur() {
        compteur.textContent = 'Manche ' + manche + ' sur ' + MANCHES;
      }

      /** Affiche une liste d'objets (null = emplacement vide). marques : objets à signaler comme retrouvés. */
      function afficherPlateau(liste, marques) {
        plateau.innerHTML = '';
        plateau.append(...liste.map(objet => {
          if (!objet) return el('div', { class: 'tuile om-objet om-trou', role: 'img', 'aria-label': 'Emplacement vide' }, '?');
          const marque = marques && marques.includes(objet);
          return el('div', {
            class: 'tuile om-objet' + (marque ? ' correct' : ''),
            role: 'img',
            'aria-label': objet[1] + (marque ? ', l\'objet qui avait disparu' : '')
          }, objet[0]);
        }));
      }

      function afficherCaches() {
        plateau.innerHTML = '';
        for (let i = 0; i < nbObjets; i++) {
          plateau.append(el('div', { class: 'tuile om-objet cachee', role: 'img', 'aria-label': 'Objet caché' }, '?'));
        }
      }

      /* ---------- 1. Observation ---------- */

      function nouvelleManche() {
        manche++;
        jeton++;
        const objets = JS.UI.melanger(OBJETS).slice(0, nbObjets);
        const manquants = JS.UI.melanger(objets).slice(0, nbManquants);
        const leurres = JS.UI.melanger(OBJETS.filter(o => !objets.includes(o))).slice(0, nbPropositions - nbManquants);
        tour = {
          objets,
          manquants,
          propositions: JS.UI.melanger(manquants.concat(leurres)),
          reponses: 0,
          bons: 0,
          boutons: []
        };
        majCompteur();
        afficherPlateau(objets);
        zoneBas.innerHTML = '';
        // Passage automatique après un temps généreux ; la jauge du bouton montre le temps restant.
        const duree = 6000 + 2000 * nbObjets;
        const bouton = JS.UI.boutonJauge('👍 J\'ai bien regardé', duree, () => cacher());
        zoneBas.append(bouton);
        ctx.message('Observez bien les objets. Prenez votre temps.', 'info');
        bouton.focus();

        const j = jeton;
        ctx.plusTard(() => { if (j === jeton) cacher(); }, duree);
      }

      /* ---------- 2. Les objets se cachent ---------- */

      function cacher() {
        jeton++;
        const j = jeton;
        zoneBas.innerHTML = '';
        afficherCaches();
        ctx.message('Les objets se cachent…', 'info');
        ctx.plusTard(() => { if (j === jeton) question(); }, 1300);
      }

      /* ---------- 3. Question ---------- */

      function question() {
        jeton++;
        const { objets, manquants } = tour;
        const restants = objets.filter(o => !manquants.includes(o));
        // Sans mélange, les objets restent à leur place et l'emplacement du disparu reste vide.
        afficherPlateau(melange ? JS.UI.melanger(restants) : objets.map(o => (manquants.includes(o) ? null : o)));

        ctx.message(nbManquants > 1
          ? 'Deux objets ont disparu. Lesquels ? Touchez-les l\'un après l\'autre.'
          : 'Un objet a disparu. Lequel ?', 'info');

        tour.boutons = tour.propositions.map(objet => el('button', {
          class: 'btn btn-choix om-proposition',
          'aria-label': objet[1],
          onclick: e => repondre(objet, e.currentTarget)
        }, el('span', { class: 'om-emoji', 'aria-hidden': 'true' }, objet[0]), el('span', { class: 'om-nom' }, objet[1])));

        zoneBas.innerHTML = '';
        zoneBas.append(el('div', { class: 'choix' }, tour.boutons));
      }

      function marquer(bouton, juste) {
        bouton.disabled = true;
        bouton.classList.add(juste ? 'correct' : 'incorrect');
        const nom = bouton.querySelector('.om-nom');
        nom.textContent = (juste ? '✓ ' : '✗ ') + nom.textContent;
        bouton.setAttribute('aria-label', bouton.getAttribute('aria-label') + (juste ? ', bonne réponse' : ', ce n\'était pas celui-ci'));
      }

      function repondre(objet, bouton) {
        if (tour.reponses >= nbManquants || bouton.disabled) return;
        const juste = tour.manquants.includes(objet);
        ctx.audio.clic();
        marquer(bouton, juste);
        tour.reponses++;
        if (juste) tour.bons++;

        if (tour.reponses < nbManquants) {
          ctx.message(juste
            ? 'Bien vu ! Il manque encore un objet.'
            : 'Ce n\'est pas celui-ci. Il manque deux objets : choisissez-en encore un.', juste ? 'succes' : 'info');
          return;
        }
        bilanManche();
      }

      /* ---------- 4. Bilan de la manche ---------- */

      function bilanManche() {
        const { manquants, bons, boutons, propositions } = tour;
        points += bons / nbManquants;
        trouvesTotal += bons;

        // On montre la bonne réponse, sans insister sur l'erreur.
        boutons.forEach((b, i) => {
          if (!b.disabled && manquants.includes(propositions[i])) marquer(b, true);
          b.disabled = true;
        });
        afficherPlateau(tour.objets, manquants);

        if (bons === nbManquants) {
          ctx.audio.succes();
          ctx.message('Bravo, c\'est exact ! ' + nommer(manquants) + '.', 'succes');
        } else if (bons > 0) {
          ctx.message('Très bien pour l\'un des deux ! ' + nommer(manquants) + '. Les voici à leur place.', 'info');
        } else {
          ctx.message('Ce n\'est pas grave. ' + nommer(manquants) + '. ' +
            (nbManquants > 1 ? 'Les voici à leur place.' : 'Le voici à sa place.'), 'info');
        }

        const derniere = manche >= MANCHES;
        // Tout est juste : on enchaîne seul. Sinon, on laisse observer la réponse à son rythme.
        if (bons === nbManquants) {
          ctx.enchainer(() => (derniere ? finir() : nouvelleManche()));
          return;
        }
        const suite = el('button', {
          class: 'btn btn-primaire btn-grand',
          onclick: () => (derniere ? finir() : nouvelleManche())
        }, derniere ? 'Voir le résultat ▶' : 'Manche suivante ▶');
        zoneBas.append(el('div', { class: 'ligne-boutons centre' }, suite));
        suite.focus();
      }

      function finir() {
        const reussite = points / MANCHES;
        const total = MANCHES * nbManquants;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: 'Objets disparus retrouvés : ' + trouvesTotal + ' sur ' + total + '.'
        });
      }

      nouvelleManche();
    }
  });
})();
