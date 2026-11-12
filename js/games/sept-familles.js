/* Jeu des 7 familles contre l'ordinateur : demander des cartes pour réunir des familles complètes. */
(function () {
  'use strict';
  const { el } = JS.UI;

  // Membres : [emoji, nom, article]
  const FAMILLES = [
    { nom: 'Fruits', icone: '🍎', couleur: 'var(--jeu-rouge)', membres: [
      ['🍎', 'Pomme', 'la'], ['🍐', 'Poire', 'la'], ['🍌', 'Banane', 'la'],
      ['🍒', 'Cerise', 'la'], ['🍓', 'Fraise', 'la'], ['🍇', 'Raisin', 'le']] },
    { nom: 'Animaux de la ferme', icone: '🐄', couleur: 'var(--jeu-orange)', membres: [
      ['🐮', 'Vache', 'la'], ['🐷', 'Cochon', 'le'], ['🐔', 'Poule', 'la'],
      ['🐑', 'Mouton', 'le'], ['🐴', 'Cheval', 'le'], ['🦆', 'Canard', 'le']] },
    { nom: 'Métiers', icone: '💼', couleur: 'var(--jeu-bleu)', membres: [
      ['🥖', 'Boulanger', 'le'], ['✉️', 'Facteur', 'le'], ['🩺', 'Médecin', 'le'],
      ['🚒', 'Pompier', 'le'], ['🌱', 'Jardinier', 'le'], ['🍳', 'Cuisinier', 'le']] },
    { nom: 'Musique', icone: '🎵', couleur: 'var(--jeu-violet)', membres: [
      ['🎹', 'Piano', 'le'], ['🎸', 'Guitare', 'la'], ['🎻', 'Violon', 'le'],
      ['🎺', 'Trompette', 'la'], ['🥁', 'Tambour', 'le'], ['🎷', 'Saxophone', 'le']] },
    { nom: 'Transports', icone: '🚆', couleur: 'var(--jeu-cyan)', membres: [
      ['🚗', 'Voiture', 'la'], ['🚌', 'Autobus', 'l\''], ['🚆', 'Train', 'le'],
      ['🚲', 'Vélo', 'le'], ['⛵', 'Bateau', 'le'], ['✈️', 'Avion', 'l\'']] },
    { nom: 'Météo', icone: '🌦️', couleur: 'var(--jeu-jaune)', membres: [
      ['☀️', 'Soleil', 'le'], ['☁️', 'Nuage', 'le'], ['🌧️', 'Pluie', 'la'],
      ['❄️', 'Neige', 'la'], ['⛈️', 'Orage', 'l\''], ['🌈', 'Arc-en-ciel', 'l\'']] },
    { nom: 'Sports', icone: '🏅', couleur: 'var(--jeu-vert)', membres: [
      ['⚽', 'Football', 'le'], ['🎾', 'Tennis', 'le'], ['🏉', 'Rugby', 'le'],
      ['⛷️', 'Ski', 'le'], ['🏊', 'Natation', 'la'], ['⛳', 'Golf', 'le']] }
  ];
  const TAILLE = 6;

  // [nombre de familles, probabilité de retenir une information, probabilité de décider au hasard]
  const NIVEAUX = [
    [4, 0.15, 0.70],
    [4, 0.35, 0.60],
    [5, 0.45, 0.50],
    [5, 0.6, 0.40],
    [6, 0.7, 0.30],
    [6, 0.8, 0.20],
    [7, 0.9, 0.10],
    [7, 1, 0.05]
  ];
  const HISTORIQUE_MAX = 8;
  // Pendant combien de tours l'ordinateur considère qu'un « non » reste valable.
  const DUREE_ABSENCE = 6;

  const CSS = `
    .sf-table { width: 100%; max-width: 54rem; display: flex; flex-direction: column; gap: 1rem; }
    .sf-table .panneau { margin: 0; }
    .sf-table h2 { font-size: 1.15rem; }
    .sf-infos { display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center; align-items: center; }
    .sf-posees { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-top: 0.6rem; }
    .sf-posee { border-left: 0.5rem solid var(--sf-couleur); }
    .sf-cartes { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .sf-groupe { margin-bottom: 0.9rem; }
    .sf-groupe:last-child { margin-bottom: 0; }
    .sf-groupe-titre { font-weight: 700; margin-bottom: 0.3rem; }
    .sf-carte {
      position: relative; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem;
      width: 6.8rem; min-height: 7.2rem; padding: 0.9rem 0.3rem 0.4rem;
      border: 3px solid var(--sf-couleur); border-top-width: 0.6rem; border-radius: var(--rayon);
      background: var(--carte); color: var(--texte); text-align: center;
    }
    .sf-carte .sf-coin { position: absolute; top: 0.15rem; left: 0.3rem; font-size: 0.9rem; }
    .sf-carte .sf-emoji { font-size: 2.4rem; line-height: 1.1; }
    .sf-carte .sf-nom { font-size: 0.85rem; font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }
    .sf-carte.sf-nouvelle { outline: 4px dashed var(--primaire); outline-offset: 2px; }
    .sf-demande { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: center; }
    .sf-demande .sf-carte { flex: none; }
    .sf-bulle { font-size: 1.15rem; font-weight: 700; max-width: 30rem; }
    .sf-choix .btn-choix { flex-direction: column; gap: 0.1rem; border-left-width: 0.6rem; border-left-color: var(--sf-couleur); }
    .sf-choix .sf-emoji { font-size: 2rem; line-height: 1.1; }
    .sf-petit { font-size: 0.9rem; font-weight: 600; }
    .sf-historique { margin: 0; padding-left: 1.3rem; }
    .sf-historique li { margin-bottom: 0.3rem; }
  `;

  function injecterStyle() {
    if (document.getElementById('style-sept-familles')) return;
    document.head.append(el('style', { id: 'style-sept-familles' }, CSS));
  }

  JS.Jeux.register({
    id: 'sept-familles',
    nom: 'Jeu des 7 familles',
    categorie: 'auditive',
    icone: '👪',
    description: 'Réunissez des familles complètes en demandant des cartes à l\'ordinateur.',
    consigne: 'Le but est de réunir les 6 cartes d\'une même famille. À votre tour, choisissez une famille dont vous avez déjà une carte, puis la carte qui vous manque. Si l\'ordinateur l\'a, il vous la donne et vous rejouez. Sinon, il dit « Pioche ! » : vous piochez une carte et c\'est à lui de jouer. Quand l\'ordinateur vous demande une carte, regardez votre main et répondez. Retenez bien ce que demande l\'ordinateur : cela vous aide ! Les familles complètes sont posées automatiquement.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [nb, memoire] = NIVEAUX[n - 1];
      const adversaire = memoire < 0.3 ? 'ordinateur très distrait'
        : memoire < 0.5 ? 'ordinateur un peu distrait'
          : memoire < 0.75 ? 'ordinateur attentif'
            : memoire < 1 ? 'ordinateur très attentif' : 'ordinateur qui retient tout';
      return nb + ' familles de 6 cartes, ' + adversaire;
    },

    start(ctx) {
      injecterStyle();
      const [nbFamilles, memoireOrdi, hasardOrdi] = NIVEAUX[ctx.niveau - 1];
      const familles = JS.UI.melanger(FAMILLES).slice(0, nbFamilles);

      /* ---------- État de la partie ---------- */

      const cartes = [];
      familles.forEach((fam, f) => fam.membres.forEach((membre, m) => cartes.push({ f, m, id: f * TAILLE + m })));
      let pioche = JS.UI.melanger(cartes);
      const distribution = nbFamilles >= 6 ? 7 : 6;
      const mains = { joueur: pioche.slice(0, distribution), ordi: pioche.slice(distribution, distribution * 2) };
      pioche = pioche.slice(distribution * 2);
      const posees = [];        // { f, qui }
      const historique = [];    // phrases, la plus récente en premier
      let tour = 0;
      let nouvelle = null;      // carte arrivée récemment dans la main du joueur (mise en évidence)

      // Ce que l'ordinateur a retenu du jeu du joueur (il oublie selon le niveau).
      const memoire = {
        cartes: new Set(),       // cartes que le joueur possède
        familles: new Map(),     // familles dont le joueur possède au moins une carte → tour
        absentes: new Map()      // cartes que le joueur n'a pas → tour
      };

      function retenir() {
        return Math.random() < memoireOrdi;
      }

      /* ---------- Outils ---------- */

      const membre = c => familles[c.f].membres[c.m];
      const nomCarte = c => membre(c)[1];
      /** « la poire 🍐 » */
      function avecArticle(c) {
        const [emoji, nom, article] = membre(c);
        return (article === 'l\'' ? 'l\'' : article + ' ') + nom.toLowerCase() + ' ' + emoji;
      }
      const possede = (qui, f, m) => mains[qui].some(c => c.f === f && c.m === m);
      const estPosee = f => posees.some(p => p.f === f);
      const finie = () => posees.length === nbFamilles;

      function retirer(qui, f, m) {
        const i = mains[qui].findIndex(c => c.f === f && c.m === m);
        return i < 0 ? null : mains[qui].splice(i, 1)[0];
      }

      function piocher(qui) {
        const c = pioche.shift() || null;
        if (c) mains[qui].push(c);
        return c;
      }

      /** Pose les familles complètes de ce joueur ; renvoie une phrase d'annonce (ou ''). */
      function poserFamilles(qui) {
        const annonces = [];
        for (let f = 0; f < nbFamilles; f++) {
          if (estPosee(f) || mains[qui].filter(c => c.f === f).length < TAILLE) continue;
          mains[qui] = mains[qui].filter(c => c.f !== f);
          posees.push({ f, qui });
          memoire.familles.delete(f);
          for (let m = 0; m < TAILLE; m++) {
            memoire.cartes.delete(f * TAILLE + m);
            memoire.absentes.delete(f * TAILLE + m);
          }
          annonces.push(qui === 'joueur'
            ? '🎉 Famille « ' + familles[f].nom + ' » complète : vous la posez !'
            : 'L\'ordinateur a complété la famille « ' + familles[f].nom + ' » et la pose.');
          if (qui === 'joueur') ctx.plusTard(() => ctx.audio.succes(), 300);
        }
        return annonces.join(' ');
      }

      function noter(texte) {
        historique.unshift(texte);
        historique.length = Math.min(historique.length, HISTORIQUE_MAX);
      }

      /* ---------- Affichage ---------- */

      const panneauInfos = el('section', { class: 'panneau', 'aria-label': 'Situation de la partie' });
      const panneauAction = el('section', { class: 'panneau', 'aria-live': 'polite' });
      const panneauMain = el('section', { class: 'panneau', 'aria-labelledby': 'sf-titre-main' });
      const panneauHistorique = el('section', { class: 'panneau', 'aria-labelledby': 'sf-titre-historique' });
      ctx.root.append(el('div', { class: 'sf-table' }, panneauInfos, panneauAction, panneauMain, panneauHistorique));

      function carteEl(c, classe) {
        const fam = familles[c.f];
        const [emoji, nom] = fam.membres[c.m];
        return el('div', {
          class: 'sf-carte' + (classe ? ' ' + classe : ''),
          style: { '--sf-couleur': fam.couleur },
          role: 'img',
          'aria-label': nom + ', famille ' + fam.nom
        },
        el('span', { class: 'sf-coin', 'aria-hidden': 'true' }, fam.icone),
        el('span', { class: 'sf-emoji', 'aria-hidden': 'true' }, emoji),
        el('span', { class: 'sf-nom', 'aria-hidden': 'true' }, nom));
      }

      function majInfos() {
        const vous = posees.filter(p => p.qui === 'joueur').length;
        const lui = posees.length - vous;
        panneauInfos.innerHTML = '';
        panneauInfos.append(
          el('div', { class: 'sf-infos' },
            el('span', { class: 'compteur' }, '🤖 L\'ordinateur a ' + JS.UI.pluriel(mains.ordi.length, 'carte')),
            el('span', { class: 'compteur' }, '🂠 Pioche : ' + JS.UI.pluriel(pioche.length, 'carte')),
            el('span', { class: 'compteur' }, '🏆 Familles : vous ' + vous + ' — ordinateur ' + lui)
          ),
          posees.length
            ? el('div', { class: 'sf-posees' }, posees.map(p => el('span', {
              class: 'compteur sf-posee',
              style: { '--sf-couleur': familles[p.f].couleur }
            }, familles[p.f].icone + ' ' + familles[p.f].nom + ' : ' + (p.qui === 'joueur' ? 'vous ✓' : 'ordinateur'))))
            : ''
        );
      }

      function majMain() {
        panneauMain.innerHTML = '';
        panneauMain.append(el('h2', { id: 'sf-titre-main' }, 'Vos cartes (' + mains.joueur.length + ')'));
        if (!mains.joueur.length) {
          panneauMain.append(el('p', { class: 'texte-doux' }, 'Vous n\'avez plus de cartes en main.'));
          return;
        }
        for (let f = 0; f < nbFamilles; f++) {
          const siennes = mains.joueur.filter(c => c.f === f).sort((a, b) => a.m - b.m);
          if (!siennes.length) continue;
          panneauMain.append(el('div', { class: 'sf-groupe' },
            el('div', { class: 'sf-groupe-titre' },
              familles[f].icone + ' ' + familles[f].nom + ' : ' + siennes.length + ' sur ' + TAILLE),
            el('div', { class: 'sf-cartes' }, siennes.map(c => carteEl(c, c === nouvelle ? 'sf-nouvelle' : '')))
          ));
        }
      }

      function majHistorique() {
        panneauHistorique.innerHTML = '';
        panneauHistorique.append(el('h2', { id: 'sf-titre-historique' }, '📝 Dernières demandes'));
        panneauHistorique.append(historique.length
          ? el('ul', { class: 'sf-historique' }, historique.map(h => el('li', null, h)))
          : el('p', { class: 'texte-doux' }, 'Aucune demande pour l\'instant.'));
      }

      function majTout() {
        majInfos();
        majMain();
        majHistorique();
      }

      function action(...contenu) {
        panneauAction.innerHTML = '';
        panneauAction.append(...contenu.flat().filter(Boolean));
      }

      function boutonSuite(texte, suite) {
        const b = el('button', { class: 'btn btn-primaire btn-grand', onclick: suite }, texte);
        return el('div', { class: 'ligne-boutons centre' }, b);
      }

      /* ---------- Tour du joueur ---------- */

      function tourJoueur() {
        majTout();
        if (finie()) return fin();
        if (!mains.joueur.length) {
          const c = piocher('joueur');
          if (!c) {
            ctx.message('Vous n\'avez plus de cartes et la pioche est vide : l\'ordinateur continue.', 'info');
            action(el('h2', null, '🤖 Tour de l\'ordinateur'), el('p', null, 'L\'ordinateur joue…'));
            ctx.plusTard(tourOrdi, 1800);
            return;
          }
          nouvelle = c;
          const annonce = poserFamilles('joueur');
          majTout();
          ctx.message('Vous n\'aviez plus de cartes : vous piochez ' + avecArticle(c) + '. ' + annonce, annonce ? 'succes' : 'info');
          action(el('h2', null, 'À vous de jouer'), el('div', { class: 'sf-demande' }, carteEl(c)),
            boutonSuite('Continuer ▶', tourJoueur));
          return;
        }
        choixFamille();
      }

      function choixFamille() {
        const disponibles = [];
        for (let f = 0; f < nbFamilles; f++) if (mains.joueur.some(c => c.f === f)) disponibles.push(f);
        action(
          el('h2', null, '🙂 À vous de jouer'),
          el('p', null, 'Choisissez une famille dont vous avez au moins une carte :'),
          el('div', { class: 'choix sf-choix' }, disponibles.map(f => {
            const n = mains.joueur.filter(c => c.f === f).length;
            return el('button', {
              class: 'btn btn-choix',
              style: { '--sf-couleur': familles[f].couleur },
              onclick: () => choixMembre(f)
            },
            el('span', { class: 'sf-emoji', 'aria-hidden': 'true' }, familles[f].icone),
            el('span', null, familles[f].nom),
            el('span', { class: 'sf-petit' }, '(vous en avez ' + n + ')'));
          }))
        );
      }

      function choixMembre(f) {
        ctx.audio.clic();
        const fam = familles[f];
        action(
          el('h2', null, fam.icone + ' Famille « ' + fam.nom + ' »'),
          el('p', null, 'Quelle carte voulez-vous demander à l\'ordinateur ?'),
          el('div', { class: 'choix sf-choix' }, fam.membres.map(([emoji, nom], m) => {
            const aMoi = possede('joueur', f, m);
            return el('button', {
              class: 'btn btn-choix',
              style: { '--sf-couleur': fam.couleur },
              disabled: aMoi,
              'aria-label': nom + (aMoi ? ', vous l\'avez déjà' : ''),
              onclick: () => demanderJoueur(f, m)
            },
            el('span', { class: 'sf-emoji', 'aria-hidden': 'true' }, emoji),
            el('span', null, nom),
            aMoi ? el('span', { class: 'sf-petit' }, '✓ déjà à vous') : null);
          })),
          el('div', { class: 'ligne-boutons' },
            el('button', { class: 'btn btn-discret', onclick: choixFamille }, '← Changer de famille'))
        );
      }

      function demanderJoueur(f, m) {
        tour++;
        const demandee = cartes[f * TAILLE + m];
        // Ce que l'ordinateur peut déduire de la demande : vous avez cette famille, pas cette carte.
        if (retenir()) memoire.familles.set(f, tour);
        if (retenir()) memoire.absentes.set(demandee.id, tour);

        const demande = '« Dans la famille ' + familles[f].nom + ', je voudrais ' + avecArticle(demandee) + '. »';

        if (possede('ordi', f, m)) {
          const c = retirer('ordi', f, m);
          mains.joueur.push(c);
          nouvelle = c;
          memoire.absentes.delete(c.id);
          if (retenir()) memoire.cartes.add(c.id);
          ctx.audio.succes();
          noter('Vous : ' + familles[f].icone + ' ' + nomCarte(c) + ' → l\'ordinateur vous l\'a donnée');
          const annonce = poserFamilles('joueur');
          ctx.message('L\'ordinateur : « Oui, je l\'ai ! » Vous recevez ' + avecArticle(c) + '. Vous rejouez. ' + annonce, 'succes');
          tourJoueur();
          return;
        }

        const c = piocher('joueur');
        nouvelle = c;
        let texte;
        let rejoue = false;
        if (!c) {
          texte = 'L\'ordinateur : « Pioche ! » Mais la pioche est vide.';
          noter('Vous : ' + familles[f].icone + ' ' + nomCarte(demandee) + ' → Pioche ! (pioche vide)');
        } else if (c.id === demandee.id) {
          rejoue = true;
          texte = 'L\'ordinateur : « Pioche ! » … et c\'est une bonne pioche : vous tirez justement ' + avecArticle(c) + ' ! Vous rejouez.';
          noter('Vous : ' + familles[f].icone + ' ' + nomCarte(demandee) + ' → Pioche ! Bonne pioche !');
        } else {
          texte = 'L\'ordinateur : « Pioche ! » Vous tirez ' + avecArticle(c) + '.';
          noter('Vous : ' + familles[f].icone + ' ' + nomCarte(demandee) + ' → Pioche !');
        }
        const annonce = poserFamilles('joueur');
        ctx.message(texte + (annonce ? ' ' + annonce : ''), rejoue || annonce ? 'succes' : 'info');
        if (rejoue) {
          tourJoueur();
          return;
        }
        majTout();
        action(
          el('h2', null, 'Pioche !'),
          el('p', { class: 'sf-bulle' }, demande),
          c ? el('div', { class: 'sf-demande' }, el('p', null, 'Vous avez pioché :'), carteEl(c)) : null,
          finie() ? boutonSuite('Voir le résultat ▶', fin) : boutonSuite('Au tour de l\'ordinateur ▶', tourOrdi)
        );
      }

      /* ---------- Tour de l'ordinateur ---------- */

      /** Choix de la carte demandée par l'ordinateur, selon ce qu'il a retenu. */
      function choixOrdi() {
        const siennes = [...new Set(mains.ordi.map(c => c.f))];
        // Parfois, il demande au hasard sans utiliser sa mémoire, mais respecte les règles.
        if (Math.random() < hasardOrdi) {
          const possibles = cartes.filter(c => siennes.includes(c.f)
            && !possede('ordi', c.f, c.m) && !estPosee(c.f));
          return JS.UI.choisir(possibles);
        }
        // 1. Une carte qu'il sait être chez vous.
        const connues = [...memoire.cartes].map(id => cartes[id])
          .filter(c => siennes.includes(c.f) && !possede('ordi', c.f, c.m) && !estPosee(c.f));
        if (connues.length) return JS.UI.choisir(connues);

        // 2. Une famille dont il pense que vous avez des cartes, sinon celle où il en a le plus.
        let candidates = siennes.filter(f => memoire.familles.has(f));
        if (!candidates.length) candidates = siennes;
        let f;
        if (memoireOrdi < 0.3) {
          f = JS.UI.choisir(candidates);
        } else {
          const nb = x => mains.ordi.filter(c => c.f === x).length;
          const max = Math.max(...candidates.map(nb));
          f = JS.UI.choisir(candidates.filter(x => nb(x) === max));
        }

        // 3. Un membre qui lui manque, en évitant ceux que vous n'aviez pas récemment.
        let membres = [];
        for (let m = 0; m < TAILLE; m++) if (!possede('ordi', f, m)) membres.push(m);
        const plausibles = membres.filter(m => {
          const t = memoire.absentes.get(f * TAILLE + m);
          return t == null || tour - t > DUREE_ABSENCE;
        });
        if (plausibles.length) membres = plausibles;
        return cartes[f * TAILLE + JS.UI.choisir(membres)];
      }

      function tourOrdi() {
        nouvelle = null;
        majTout();
        if (finie()) return fin();
        if (!mains.ordi.length) {
          const c = piocher('ordi');
          if (!c) {
            ctx.message('L\'ordinateur n\'a plus de cartes et la pioche est vide : à vous de jouer.', 'info');
            tourJoueur();
            return;
          }
          const annonce = poserFamilles('ordi');
          ctx.message('L\'ordinateur n\'avait plus de cartes : il pioche. ' + annonce, 'info');
          action(el('h2', null, '🤖 Tour de l\'ordinateur'), el('p', null, 'L\'ordinateur pioche…'));
          majTout();
          ctx.plusTard(tourOrdi, 1800);
          return;
        }

        action(el('h2', null, '🤖 Tour de l\'ordinateur'), el('p', null, 'L\'ordinateur réfléchit…'));
        ctx.plusTard(() => {
          const demandee = choixOrdi();
          const aLaCarte = possede('joueur', demandee.f, demandee.m);
          tour++;
          action(
            el('h2', null, '🤖 Tour de l\'ordinateur'),
            el('div', { class: 'sf-demande' },
              carteEl(demandee),
              el('p', { class: 'sf-bulle' }, '« Dans la famille ' + familles[demandee.f].nom + ', je voudrais ' + avecArticle(demandee) + '. »')),
            el('p', null, 'Regardez votre main : avez-vous cette carte ?'),
            el('div', { class: 'ligne-boutons centre' },
              el('button', {
                class: 'btn btn-primaire btn-grand',
                onclick: () => repondre(demandee, aLaCarte)
              }, aLaCarte ? '✋ Oui, je la donne' : '🂠 Non : « Pioche ! »'))
          );
          ctx.message('L\'ordinateur vous demande une carte.', 'info');
        }, 1200);
      }

      function repondre(demandee, oui) {
        const { f, m } = demandee;
        const nom = avecArticle(demandee);
        ctx.audio.clic();

        if (possede('joueur', f, m)) {
          retirer('joueur', f, m);
          mains.ordi.push(demandee);
          memoire.cartes.delete(demandee.id);
          noter('Ordinateur : ' + familles[f].icone + ' ' + nomCarte(demandee) + ' → vous la lui avez donnée');
          const annonce = poserFamilles('ordi');
          ctx.message((oui
            ? 'Merci ! L\'ordinateur prend ' + nom + ' et rejoue.'
            : 'Regardez bien : vous aviez ' + nom + ' dans votre main. Elle part chez l\'ordinateur, qui rejoue.') +
            (annonce ? ' ' + annonce : ''), 'info');
          action(el('h2', null, '🤖 Tour de l\'ordinateur'), el('p', null, 'L\'ordinateur rejoue…'));
          majTout();
          ctx.plusTard(tourOrdi, 2200);
          return;
        }

        if (retenir()) memoire.absentes.set(demandee.id, tour);
        const c = piocher('ordi');
        const debut = oui ? 'Vous n\'avez pas cette carte : c\'est donc « Pioche ! ». ' : '« Pioche ! » ';
        let annonce = poserFamilles('ordi');
        if (c && c.id === demandee.id) {
          noter('Ordinateur : ' + familles[f].icone + ' ' + nomCarte(demandee) + ' → Pioche ! Bonne pioche !');
          ctx.message(debut + 'Bonne pioche pour l\'ordinateur : il tire justement cette carte et rejoue.' + (annonce ? ' ' + annonce : ''), 'info');
          action(el('h2', null, '🤖 Tour de l\'ordinateur'), el('p', null, 'L\'ordinateur rejoue…'));
          majTout();
          ctx.plusTard(tourOrdi, 2400);
          return;
        }
        noter('Ordinateur : ' + familles[f].icone + ' ' + nomCarte(demandee) + ' → Pioche !');
        annonce = annonce ? ' ' + annonce : '';
        ctx.message(debut + (c ? 'L\'ordinateur pioche une carte.' : 'La pioche est vide.') + annonce + ' À vous de jouer !', 'info');
        tourJoueur();
      }

      /* ---------- Fin ---------- */

      function fin() {
        const vous = posees.filter(p => p.qui === 'joueur').length;
        const lui = nbFamilles - vous;
        majTout();
        action(el('h2', null, 'Partie terminée'),
          el('p', { class: 'sf-bulle' }, 'Toutes les familles sont posées. Vous en avez réuni ' + vous + ', l\'ordinateur ' + lui + '.'));
        ctx.message(vous > lui ? 'Bravo, vous avez réuni le plus de familles !'
          : vous === lui ? 'Égalité, bien joué !' : 'Belle partie ! Chaque famille réunie est une réussite.', 'succes');
        const reussite = Math.min(1, vous / (nbFamilles / 2));
        ctx.plusTard(() => ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: 'Vous avez réuni ' + JS.UI.pluriel(vous, 'famille') + ' sur ' + nbFamilles + ' (l\'ordinateur : ' + lui + ').'
        }), 2500);
      }

      /* ---------- Début ---------- */

      // Une famille complète dès la distribution est posée tout de suite.
      const annonces = [poserFamilles('joueur'), poserFamilles('ordi')].filter(Boolean).join(' ');
      ctx.message('Les cartes sont distribuées. ' + (annonces ? annonces + ' ' : '') + 'Vous commencez !', 'info');
      tourJoueur();
    }
  });
})();
