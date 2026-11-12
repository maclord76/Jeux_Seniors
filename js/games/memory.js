/* Jeu des paires (Memory) : retourner les cartes deux par deux pour retrouver les paires. */
(function () {
  'use strict';
  const { el } = JS.UI;

  const THEMES = {
    fruits: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍐', '🍑', '🍍', '🥝', '🍋', '🍉', '🥥', '🥕', '🌽', '🍆'],
    animaux: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
    nature: ['🌻', '🌹', '🌷', '🌼', '🌲', '🍀', '🍁', '🌵', '🌙', '⭐', '☀️', '🌈', '❄️', '🔥', '💧'],
    objets: ['🎈', '🎁', '📚', '✏️', '⏰', '☂️', '🎩', '👓', '🔑', '🧸', '⚽', '🎸', '🚲', '⛵', '🏠']
  };

  // [nombre de paires, colonnes, aperçu initial en ms]
  // Chaque niveau commence par un aperçu des images (durée de base + 300 ms par paire).
  const NIVEAUX = [
    [3, 3, 3000],
    [4, 4, 3000],
    [6, 4, 2500],
    [8, 4, 2500],
    [10, 5, 2000],
    [12, 6, 2000],
    [12, 6, 2000],
    [15, 6, 2000]
  ];

  JS.Jeux.register({
    id: 'memory',
    nom: 'Jeu des paires',
    categorie: 'visuelle',
    icone: '🃏',
    description: 'Retournez les cartes et retrouvez les paires identiques.',
    consigne: 'Au début, toutes les images sont montrées un moment : touchez « J\'ai bien regardé » quand vous êtes prêt. Ensuite, touchez une carte pour la retourner, puis une deuxième. Si les deux images sont identiques, la paire reste visible. Sinon, les cartes se retournent : essayez de vous souvenir de leur place. Prenez tout votre temps.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [paires, , apercu] = NIVEAUX[n - 1];
      return (paires * 2) + ' cartes' + (apercu ? ', avec un aperçu au début' : '') + (n === 7 ? ', images d\'un même thème' : '');
    },

    start(ctx) {
      const [nbPaires, colonnes, apercu] = NIVEAUX[ctx.niveau - 1];
      // Au niveau 7, toutes les images viennent du même thème (plus difficile à distinguer).
      const source = ctx.niveau === 7
        ? JS.UI.choisir(Object.values(THEMES))
        : JS.UI.melanger(Object.values(THEMES).flat());
      const images = JS.UI.melanger(source).slice(0, nbPaires);
      const cartes = JS.UI.melanger(images.concat(images)).map((image, i) => ({ image, index: i, trouvee: false }));

      let retournees = [];
      let essais = 0;
      let paires = 0;
      let bloque = apercu > 0;

      const compteur = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const plateau = el('div', {
        class: 'plateau',
        style: { '--colonnes': colonnes, '--largeur-max': (colonnes * 7) + 'rem', '--taille-tuile': colonnes > 4 ? '1.9rem' : '2.4rem' }
      });

      const boutons = cartes.map(carte => {
        const b = el('button', { class: 'tuile cachee', onclick: () => toucher(carte) });
        carte.bouton = b;
        afficherCarte(carte, false);
        return b;
      });
      plateau.append(...boutons);
      ctx.root.append(compteur, plateau);
      majCompteur();

      function afficherCarte(carte, visible) {
        const b = carte.bouton;
        b.textContent = visible ? carte.image : '?';
        b.classList.toggle('cachee', !visible);
        b.setAttribute('aria-label', 'Carte ' + (carte.index + 1) + (visible ? ' : ' + carte.image : ', cachée'));
      }

      function majCompteur() {
        compteur.textContent = 'Paires trouvées : ' + paires + ' sur ' + nbPaires + ' — essais : ' + essais;
      }

      function toucher(carte) {
        if (bloque || carte.trouvee || retournees.includes(carte)) return;
        ctx.audio.clic();
        afficherCarte(carte, true);
        retournees.push(carte);
        if (retournees.length < 2) return;

        essais++;
        const [a, b] = retournees;
        if (a.image === b.image) {
          a.trouvee = b.trouvee = true;
          [a, b].forEach(c => { c.bouton.classList.add('correct'); c.bouton.disabled = true; });
          retournees = [];
          paires++;
          ctx.audio.succes();
          ctx.message('Bravo, une paire !', 'succes');
          majCompteur();
          if (paires === nbPaires) {
            const reussite = Math.min(1, (nbPaires * 1.6) / essais);
            ctx.plusTard(() => ctx.terminer({
              reussite,
              score: Math.round(reussite * 100 * ctx.niveau),
              details: 'Toutes les paires trouvées en ' + JS.UI.pluriel(essais, 'essai') + '.'
            }), 900);
          }
        } else {
          bloque = true;
          majCompteur();
          ctx.message('Ce n\'est pas une paire. Observez bien leur place.', 'info');
          ctx.plusTard(() => {
            afficherCarte(a, false);
            afficherCarte(b, false);
            retournees = [];
            bloque = false;
          }, 1400);
        }
      }

      if (apercu) {
        // Aperçu : fin au clic sur « J'ai bien regardé » ou à la fin de la jauge.
        const duree = apercu + nbPaires * 300;
        const zoneApercu = el('div', { class: 'ligne-boutons centre' });
        let enApercu = true;
        const finApercu = () => {
          if (!enApercu) return;
          enApercu = false;
          zoneApercu.remove();
          cartes.forEach(c => afficherCarte(c, false));
          bloque = false;
          ctx.message('À vous de jouer !', 'info');
        };
        const bouton = JS.UI.boutonJauge('👍 J\'ai bien regardé', duree, finApercu);
        zoneApercu.append(bouton);
        ctx.root.append(zoneApercu);
        cartes.forEach(c => afficherCarte(c, true));
        ctx.message('Mémorisez les images…', 'info');
        bouton.focus();
        ctx.plusTard(finApercu, duree);
      }
    }
  });
})();
