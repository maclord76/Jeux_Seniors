/* Puzzle : reconstituer une image en échangeant les pièces deux par deux. */
(function () {
  'use strict';
  const { el } = JS.UI;

  /* Deux séries : scènes simples (1–4), puis scènes détaillées (5–8). */
  const IMAGES = [
    { nom: 'La maison', src: 'img/puzzle/1-maison.png' },
    { nom: 'Le voilier', src: 'img/puzzle/2-voilier.png' },
    { nom: 'Les fleurs en pot', src: 'img/puzzle/3-fleurs.png' },
    { nom: 'Le lac de montagne', src: 'img/puzzle/4-montagne.png' },
    { nom: 'Le jardin du village', src: 'img/puzzle/5-jardin-village.png' },
    { nom: 'Le port de pêche', src: 'img/puzzle/6-port.png' },
    { nom: 'Le marché', src: 'img/puzzle/7-marche.png' },
    { nom: 'Le jardin botanique', src: 'img/puzzle/8-jardin-botanique.png' }
  ];

  function uriImage(image) {
    return image.src;
  }

  /* ---------- Niveaux ---------- */

  // [côté de la grille, nombre de puzzles, modèle toujours visible, pièces bien placées signalées]
  // 2 puzzles par niveau, tirés au hasard dans les images simples (niveaux 1–4) ou détaillées (5–8).
  const NIVEAUX = [
    [2, 2, true, true],    // 4 pièces
    [3, 2, true, true],    // 9 pièces
    [3, 2, false, true],   // 9 pièces
    [4, 2, true, true],    // 16 pièces
    [4, 2, false, false],  // 16 pièces
    [5, 2, true, false],   // 25 pièces
    [5, 2, false, false],  // 25 pièces
    [6, 2, true, false]    // 36 pièces
  ];

  const CSS = `
    .pz-zone { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 1.2rem; width: 100%; }
    .pz-zone .plateau { flex: 1 1 18rem; }
    .pz-zone-modele { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
    .pz-piece {
      position: relative; border-width: 2px; border-color: var(--bord-leger); border-radius: 4px;
      background-repeat: no-repeat; min-height: 0;
    }
    .pz-piece.selection { transform: scale(0.9); }
    .pz-piece.selection::before {
      content: '⇄'; position: absolute; top: 0.15rem; left: 0.15rem;
      width: 1.5rem; height: 1.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: var(--primaire); color: var(--sur-primaire); font-size: 0.9rem;
    }
    .pz-piece.pz-bien { border-color: var(--succes); border-width: 3px; }
    .pz-piece.pz-bien::after {
      content: '✓'; position: absolute; right: 0.15rem; bottom: 0.15rem;
      width: 1.3rem; height: 1.3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: var(--succes); color: #ffffff; font-size: 0.8rem;
    }
    .pz-modele { margin: 0; text-align: center; }
    .pz-modele img { display: block; width: 9rem; height: 9rem; border: 3px solid var(--bord); border-radius: var(--rayon); }
    .pz-modele figcaption { font-weight: 700; margin-top: 0.3rem; }
  `;

  function injecterStyle() {
    if (document.getElementById('style-puzzle')) return;
    document.head.append(el('style', { id: 'style-puzzle' }, CSS));
  }

  /** Mélange qui ne laisse aucune pièce à sa place. */
  function derangement(n) {
    const ordre = [...Array(n).keys()];
    let t;
    do { t = JS.UI.melanger(ordre); } while (t.some((v, i) => v === i));
    return t;
  }

  /** Nombre minimal d'échanges pour remettre en ordre : n − nombre de cycles. */
  function echangesMinimum(positions) {
    const vu = new Array(positions.length).fill(false);
    let cycles = 0;
    for (let i = 0; i < positions.length; i++) {
      if (vu[i]) continue;
      cycles++;
      for (let j = i; !vu[j]; j = positions[j]) vu[j] = true;
    }
    return positions.length - cycles;
  }

  JS.Jeux.register({
    id: 'puzzle',
    nom: 'Puzzle',
    categorie: 'visuelle',
    icone: '🧩',
    description: 'Remettez les pièces de l\'image à leur place.',
    consigne: 'L\'image a été découpée en pièces mélangées. Touchez une pièce, puis une autre : elles échangent leur place. Recommencez jusqu\'à retrouver l\'image du modèle. Pour annuler un choix, touchez de nouveau la même pièce. Prenez tout votre temps.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [cote, nb, modele, marques] = NIVEAUX[n - 1];
      return JS.UI.pluriel(nb, 'puzzle') + ' de ' + (cote * cote) + ' pièces' +
        (modele ? ', modèle toujours visible' : ', modèle à afficher sur demande') +
        (marques ? ', pièces bien placées signalées' : '');
    },

    start(ctx) {
      injecterStyle();
      const [cote, nbPuzzles, modeleVisible, marques] = NIVEAUX[ctx.niveau - 1];
      const nbPieces = cote * cote;
      const debutSerie = ctx.niveau <= 4 ? 0 : 4;
      const images = JS.UI.melanger(IMAGES.slice(debutSerie, debutSerie + 4)).slice(0, nbPuzzles);

      let numero = 0;
      let coups = 0;          // échanges du puzzle en cours
      let totalCoups = 0;
      let totalMinimum = 0;
      let positions = [];     // positions[case] = pièce actuellement dans cette case
      let selection = null;
      let fini = false;
      let cases = [];

      const compteur = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const plateau = el('div', {
        class: 'plateau',
        style: { '--colonnes': cote, '--largeur-max': (16 + cote * 2.5) + 'rem', '--ecart': '0.2rem' }
      });
      const image = el('img', { alt: '' });
      const legende = el('figcaption');
      const modele = el('figure', { class: 'pz-modele' }, image, legende);
      const boutonModele = el('button', { class: 'btn btn-secondaire', onclick: basculerModele }, '');
      const zoneModele = el('div', { class: 'pz-zone-modele' }, modele);
      const bas = el('div', { class: 'ligne-boutons centre' });
      if (!modeleVisible) zoneModele.prepend(boutonModele);
      ctx.root.append(compteur, el('div', { class: 'pz-zone' }, plateau, zoneModele), bas);

      function basculerModele() {
        modele.hidden = !modele.hidden;
        boutonModele.textContent = modele.hidden ? '👁 Voir le modèle' : '🙈 Cacher le modèle';
        boutonModele.setAttribute('aria-expanded', String(!modele.hidden));
      }

      function majCompteur() {
        const bien = positions.filter((p, i) => p === i).length;
        compteur.textContent = (nbPuzzles > 1 ? 'Puzzle ' + numero + ' sur ' + nbPuzzles + ' — ' : '') +
          'échanges : ' + coups + (marques ? ' — pièces bien placées : ' + bien + ' sur ' + nbPieces : '');
      }

      function dessinerPiece(caseIndex) {
        const b = cases[caseIndex];
        const piece = positions[caseIndex];
        const ligne = Math.floor(piece / cote);
        const colonne = piece % cote;
        b.style.backgroundPosition = (colonne * 100 / (cote - 1)) + '% ' + (ligne * 100 / (cote - 1)) + '%';
        const bien = piece === caseIndex;
        b.classList.toggle('pz-bien', marques && bien);
        b.classList.toggle('selection', selection === caseIndex);
        b.setAttribute('aria-label', 'Case ' + (caseIndex + 1) + ' : pièce numéro ' + (piece + 1) +
          (marques && bien ? ', bien placée' : '') + (selection === caseIndex ? ', choisie' : ''));
      }

      function nouveauPuzzle() {
        numero++;
        coups = 0;
        selection = null;
        fini = false;
        const img = images[numero - 1];
        const uri = uriImage(img);
        positions = derangement(nbPieces);
        totalMinimum += echangesMinimum(positions);

        image.src = uri;
        image.alt = 'Modèle : ' + img.nom.toLowerCase();
        legende.textContent = 'Modèle : ' + img.nom.toLowerCase();
        if (!modeleVisible) {
          modele.hidden = false;
          basculerModele();
        }

        plateau.innerHTML = '';
        cases = [];
        for (let i = 0; i < nbPieces; i++) {
          const b = el('button', {
            class: 'tuile pz-piece',
            style: { backgroundImage: 'url("' + uri + '")', backgroundSize: (cote * 100) + '% ' + (cote * 100) + '%' },
            onclick: () => toucher(i)
          });
          cases.push(b);
        }
        plateau.append(...cases);
        cases.forEach((b, i) => dessinerPiece(i));
        bas.innerHTML = '';
        majCompteur();
        ctx.message('Touchez une pièce, puis celle avec laquelle l\'échanger.', 'info');
      }

      function toucher(i) {
        if (fini) return;
        ctx.audio.clic();
        if (selection === null) {
          selection = i;
          dessinerPiece(i);
          return;
        }
        if (selection === i) {
          selection = null;
          dessinerPiece(i);
          return;
        }
        const a = selection;
        selection = null;
        [positions[a], positions[i]] = [positions[i], positions[a]];
        coups++;
        dessinerPiece(a);
        dessinerPiece(i);
        majCompteur();

        if (positions.every((p, k) => p === k)) {
          termine();
        } else if (marques && (positions[a] === a || positions[i] === i)) {
          ctx.message('Très bien, une pièce est à sa place !', 'succes');
        } else {
          ctx.message('Continuez, vous avancez.', 'info');
        }
      }

      function termine() {
        fini = true;
        totalCoups += coups;
        cases.forEach(b => { b.classList.add('pz-bien'); b.disabled = true; });
        ctx.audio.succes();
        ctx.message('Bravo, l\'image est reconstituée : ' + images[numero - 1].nom.toLowerCase() + ' !', 'succes');
        const dernier = numero >= nbPuzzles;
        // On enchaîne seul, en laissant un peu de temps pour admirer l'image reconstituée.
        ctx.enchainer(() => (dernier ? finir() : nouveauPuzzle()), 3000);
      }

      function finir() {
        // Une marge d'échanges en plus du minimum est accordée sans rien perdre.
        const marge = Math.ceil(totalMinimum * 0.3) + 1;
        const reussite = Math.min(1, (totalMinimum + marge) / Math.max(1, totalCoups));
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: (nbPuzzles > 1 ? nbPuzzles + ' puzzles reconstitués' : 'Puzzle reconstitué') +
            ' en ' + JS.UI.pluriel(totalCoups, 'échange') + ' (minimum possible : ' + totalMinimum + ').'
        });
      }

      nouveauPuzzle();
    }
  });
})();
