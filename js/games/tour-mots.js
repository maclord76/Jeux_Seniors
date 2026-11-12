/* La tour des mots : mots français adjacents et chute des lettres. */
(function () {
  'use strict';
  const { el } = JS.UI;
  let dictionnaire;
  JS.Jeux.register({
    id: 'tour-mots', nom: 'La tour des mots', categorie: 'mots', icone: '🏗️',
    description: 'Formez des mots et faites descendre les lettres de la tour.',
    consigne: 'Touchez des lettres voisines à gauche, à droite, au-dessus ou en dessous, pour former un mot de la longueur demandée, puis validez. Les lettres utilisées disparaissent et celles du dessus descendent. Touchez une lettre sélectionnée pour revenir en arrière. Les accents sont retirés dans la grille. Atteignez l’objectif de mots affiché. Tous les mots à trouver sont présents dès le départ. Certains choix de lettres peuvent être refusés pour préserver une solution complète. En cas de blocage, « Trouver un mot » surligne les lettres d’un mot, sans en donner l’ordre : ce mot compte alors pour moitié. Prenez tout votre temps.',
    niveauxMax: 6,
    seuilDeblocage: 1,
    descriptionNiveau: n => (n + 2) + ' mots de ' + (n + 2) + ' lettres, sans limite de temps',
    start(ctx) {
      if (!dictionnaire) {
        dictionnaire = new Map();
        Object.values(JS.Donnees.mots).forEach(theme => theme.mots.forEach(mot => {
          dictionnaire.set(JS.Donnees.motEnGrille(mot), mot);
        }));
      }
      const longueurMot = ctx.niveau + 2;
      const objectif = longueurMot;
      const hauteur = 5;
      const largeur = Math.ceil(longueurMot * objectif / hauteur) + 2;
      const candidats = [...dictionnaire.keys()].filter(m => m.length === longueurMot);
      const cibles = JS.UI.melanger(candidats).slice(0, objectif);
      const motsDejaTrouves = new Set();
      // Construire à rebours : chaque insertion est l'inverse exact d'une
      // suppression suivie de la gravité. Les parcours comportent un virage.
      function construire() {
        for (let essai = 0; essai < 2000; essai++) {
          let board = Array.from({ length: hauteur }, () => Array(largeur).fill(null));
          const parcours = [];
          let possible = true;
          for (const mot of cibles) {
            const colonnes = Array.from({ length: largeur }, (_, c) => board.map(l => l[c]).filter(Boolean));
            let insertion = null;
            for (let tentative = 0; tentative < 500 && !insertion; tentative++) {
              const trajet = [];
              const comptes = Array(largeur).fill(0);
              let r = Math.floor(Math.random() * hauteur);
              let c = Math.floor(Math.random() * largeur);
              for (let i = 0; i < mot.length; i++) {
                if (colonnes[c].length + comptes[c] >= hauteur) break;
                trajet.push({ r, c });
                comptes[c]++;
                if (i === mot.length - 1) break;
                const voisins = JS.UI.melanger([[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
                  .filter(([nr, nc]) => nr >= 0 && nr < hauteur && nc >= 0 && nc < largeur &&
                    colonnes[nc].length + comptes[nc] < hauteur &&
                    !trajet.some(p => p.r === nr && p.c === nc));
                if (!voisins.length) break;
                [r, c] = voisins[0];
              }
              if (trajet.length !== mot.length ||
                  new Set(trajet.map(p => p.r)).size === 1 ||
                  new Set(trajet.map(p => p.c)).size === 1 ||
                  trajet.some(p => p.r < hauteur - colonnes[p.c].length - comptes[p.c])) continue;
              const nouveau = Array.from({ length: hauteur }, () => Array(largeur).fill(null));
              trajet.forEach((p, i) => { nouveau[p.r][p.c] = mot[i]; });
              for (let col = 0; col < largeur; col++) {
                let index = colonnes[col].length - 1;
                for (let row = hauteur - 1; row >= 0; row--) {
                  if (!nouveau[row][col] && index >= 0) nouveau[row][col] = colonnes[col][index--];
                }
              }
              insertion = { board: nouveau, trajet };
            }
            if (!insertion) { possible = false; break; }
            board = insertion.board;
            parcours.unshift(insertion.trajet);
          }
          if (possible && !motEnLigne(board)) return { board, parcours };
        }
        throw new Error('Impossible de construire une tour avec des parcours tournants.');
      }
      function motEnLigne(board) {
        for (const mot of cibles) {
          const inverse = [...mot].reverse().join('');
          const lignes = board.map(l => l.map(x => x || '.').join(''));
          const colonnes = Array.from({ length: largeur }, (_, c) => board.map(l => l[c] || '.').join(''));
          if ([...lignes, ...colonnes].some(l => l.includes(mot) || l.includes(inverse))) return true;
        }
        return false;
      }
      const construction = construire();
      let grille = construction.board;
      function retirer(board, parcours) {
        const copie = board.map(ligne => [...ligne]);
        parcours.forEach(p => { copie[p.r][p.c] = null; });
        for (let c = 0; c < largeur; c++) {
          const colonne = copie.map(ligne => ligne[c]).filter(Boolean);
          for (let r = 0; r < hauteur; r++) {
            copie[r][c] = r < hauteur - colonne.length ? null : colonne[r - hauteur + colonne.length];
          }
        }
        return copie;
      }
      // Recherche de la suite entière, et non simplement du prochain mot.
      function resoudre(board, restants, echecs = new Set()) {
        if (!restants.length) return [];
        const cle = board.map(l => l.map(x => x || '.').join('')).join('/') + ':' + restants.join(',');
        if (echecs.has(cle)) return null;
        function parcourir(mot, r, c, trajet) {
          if (r < 0 || r >= hauteur || c < 0 || c >= largeur ||
              board[r][c] !== mot[trajet.length] || trajet.some(p => p.r === r && p.c === c)) return null;
          const suite = [...trajet, { r, c }];
          if (suite.length === mot.length) {
            const solution = resoudre(retirer(board, suite), restants.filter(m => m !== mot), echecs);
            return solution ? [suite, ...solution] : null;
          }
          for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const solution = parcourir(mot, r + dr, c + dc, suite);
            if (solution) return solution;
          }
          return null;
        }
        for (const mot of restants) {
          for (let r = hauteur - 1; r >= 0; r--) {
            for (let c = 0; c < largeur; c++) {
              const solution = parcourir(mot, r, c, []);
              if (solution) return solution;
            }
          }
        }
        echecs.add(cle);
        return null;
      }
      let solution = construction.parcours;
      let chemin = [];
      let retirees = 0;
      let fini = false;
      const trouves = [];
      // Mots montrés par « Trouver un mot » : ils comptent pour moitié dans la réussite.
      const AIDE = 0.5;
      const motsAides = new Set();
      let avecAide = 0;
      // Cases mises en évidence par l'aide (sans ordre, le mot n'est pas écrit).
      let casesIndice = [];
      const zone = el('div', { class: 'zone-jeu' });
      const compteur = el('p', { class: 'compteur' });
      const selection = el('p', { 'aria-live': 'polite', class: 'compteur' });
      const plateau = el('div', { role: 'group', 'aria-label': 'Tour de lettres',
        style: 'display:grid;grid-template-columns:repeat(' + largeur + ',minmax(44px,1fr));gap:8px;width:100%;overflow-x:auto;margin:auto' });
      const historique = el('p');
      const etatTour = el('p', { class: 'compteur', 'aria-live': 'polite' });
      let objectifAtteint = false;
      const valider = el('button', { class: 'btn btn-primaire', onclick: verifier }, 'Valider le mot');
      zone.append(compteur, plateau, selection,
        el('div', { class: 'ligne-boutons centre' },
          valider,
          el('button', { class: 'btn', onclick: () => {
            if (fini || objectifAtteint || !ctx.actif()) return;
            chemin = [];
            actualiser();
            ctx.message('Sélection effacée. Choisissez une première lettre ou demandez une aide.', 'info');
          } }, 'Effacer la sélection'),
          el('button', { class: 'btn', onclick: indice }, '💡 Trouver un mot')),
        el('p', {}, 'Les numéros indiquent votre parcours. Les cases en pointillés sont accessibles ensuite. Chaque lettre doit toucher un côté de la précédente, même si plusieurs cases portent la même lettre. Pour changer de chemin, touchez une lettre déjà choisie ou effacez la sélection.'),
        etatTour, el('p', {}, 'Les mots reconnus sont ceux du lexique français de nos jeux.'), historique);
      ctx.root.append(zone);
      const boutons = grille.map((ligne, r) => ligne.map((lettre, c) => {
        const bouton = el('button', { class: 'btn', style: 'position:relative;min-width:0;padding:10px 0;font-size:1.5rem',
          onclick: () => choisir(r, c) }, lettre);
        plateau.append(bouton);
        return bouton;
      }));
      function actualiser() {
        const dernier = chemin[chemin.length - 1];
        grille.forEach((ligne, r) => ligne.forEach((lettre, c) => {
          const bouton = boutons[r][c];
          const ordre = chemin.findIndex(p => p.r === r && p.c === c);
          const accessible = !dernier || Math.abs(r - dernier.r) + Math.abs(c - dernier.c) === 1;
          const conseillee = casesIndice.some(p => p.r === r && p.c === c);
          bouton.textContent = lettre || '·';
          if (ordre >= 0) {
            bouton.append(el('span', { 'aria-hidden': 'true',
              style: 'position:absolute;top:2px;right:5px;font-size:0.8rem;font-weight:bold' }, String(ordre + 1)));
          }
          bouton.disabled = !lettre || fini || objectifAtteint;
          bouton.setAttribute('aria-pressed', String(ordre >= 0));
          bouton.setAttribute('aria-label', (lettre || 'Case vide') + ', ligne ' + (r + 1) + ', colonne ' + (c + 1) + (ordre >= 0 ? ', lettre numéro ' + (ordre + 1) : accessible ? ', accessible' : ', trop éloignée') +
            (conseillee ? ', lettre du mot conseillé' : ''));
          bouton.style.outline = ordre >= 0 ? '3px solid var(--primaire)' : conseillee ? '3px dashed var(--focus)' : '';
          bouton.style.outlineOffset = conseillee && ordre < 0 ? '-7px' : '';
          bouton.style.background = conseillee ? 'var(--accent-clair)' : '';
          bouton.style.borderStyle = lettre && dernier && ordre < 0 && accessible ? 'dashed' : 'solid';
          bouton.style.opacity = lettre && ordre < 0 && !accessible ? '0.5' : '1';
        }));
        selection.textContent = chemin.length ? chemin.map(p => grille[p.r][p.c]).join('') : 'Choisissez une première lettre.';
        compteur.textContent = 'Objectif : ' + trouves.length + ' / ' + objectif + ' mots de ' + longueurMot + ' lettres trouvés';
        const lettresRestantes = grille.flat().filter(Boolean).length;
        etatTour.textContent = lettresRestantes + ' lettres restantes dans cette grille.';
        historique.textContent = trouves.length ? 'Mots trouvés : ' + trouves.join(', ') : '';
        valider.disabled = chemin.length !== longueurMot || fini || objectifAtteint;
      }
      function choisir(r, c) {
        if (fini || objectifAtteint || !ctx.actif() || !grille[r][c]) return;
        const index = chemin.findIndex(p => p.r === r && p.c === c);
        if (index >= 0) chemin = chemin.slice(0, index + 1);
        else {
          const dernier = chemin[chemin.length - 1];
          if (dernier && Math.abs(r - dernier.r) + Math.abs(c - dernier.c) !== 1) {
            ctx.message('Cette case est trop éloignée. Choisissez une case en pointillés, ou revenez à une lettre numérotée pour changer de chemin.', 'info');
            return;
          }
          if (chemin.length >= longueurMot) {
            ctx.message('Le mot doit contenir exactement ' + longueurMot + ' lettres. Effacez une lettre pour modifier votre choix.', 'info');
            return;
          }
          chemin.push({ r, c });
        }
        actualiser();
        ctx.message('Choisissez ' + longueurMot + ' lettres voisines, puis validez le mot.', 'info');
      }
      function verifier() {
        if (fini || objectifAtteint || !ctx.actif() || chemin.length !== longueurMot) return;
        const mot = chemin.map(p => grille[p.r][p.c]).join('');
        if (motsDejaTrouves.has(mot)) {
          ctx.message('Vous avez déjà trouvé ce mot. Cherchez un mot différent ou demandez une aide.', 'info');
          return;
        }
        if (!dictionnaire.has(mot)) {
          ctx.message('Ce mot ne figure pas dans notre lexique. Essayez un autre mot ou demandez une aide.', 'info');
          return;
        }
        if (!cibles.includes(mot)) {
          ctx.message('Ce mot existe, mais ne fait pas partie des mots préparés pour cette grille. Essayez une autre combinaison.', 'info');
          return;
        }
        const suivante = retirer(grille, chemin);
        const parcoursPrevu = solution[0];
        const suitSolution = chemin.every((p, i) => p.r === parcoursPrevu[i].r && p.c === parcoursPrevu[i].c);
        const suite = suitSolution ? solution.slice(1)
          : resoudre(suivante, cibles.filter(m => m !== mot && !motsDejaTrouves.has(m)));
        if (!suite) {
          ctx.message('Ce choix de cases bloquerait les mots restants. Essayez les autres lettres identiques ou demandez une aide.', 'info');
          return;
        }
        solution = suite;
        grille = suivante;
        motsDejaTrouves.add(mot);
        trouves.push(dictionnaire.get(mot));
        if (motsAides.has(mot)) avecAide++;
        casesIndice = [];
        retirees += chemin.length;
        chemin = [];
        objectifAtteint = trouves.length >= objectif;
        actualiser();
        ctx.audio.succes();
        if (objectifAtteint) {
          terminer();
        } else {
          ctx.message('Bravo ! Cherchez le prochain mot.', 'succes');
        }
      }
      function indice() {
        if (fini || objectifAtteint || !ctx.actif()) return;
        casesIndice = solution[0].map(p => ({ ...p }));
        motsAides.add(casesIndice.map(p => grille[p.r][p.c]).join(''));
        chemin = [];
        actualiser();
        ctx.message('Les lettres d’un mot sont surlignées dans la grille. Touchez-les dans le bon ordre, puis validez. Un mot trouvé avec l’aide compte pour moitié.', 'info');
      }
      function terminer() {
        if (fini || !objectifAtteint || !ctx.actif()) return;
        fini = true;
        const points = trouves.length - AIDE * avecAide;
        ctx.terminer({ reussite: Math.min(1, points / objectif), score: Math.round(points * 100),
          details: trouves.length + ' mots trouvés sur ' + objectif +
            (avecAide ? ', dont ' + avecAide + ' avec l’aide « Trouver un mot »' : ', sans aide') +
            ', et ' + retirees + ' lettres retirées.' });
      }
      actualiser();
      return () => { fini = true; };
    }
  });
})();
