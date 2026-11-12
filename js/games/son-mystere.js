/* Le son mystère : écouter un son familier et retrouver ce qui l'a produit. Trois manches, sans chronomètre. */
(function () {
  'use strict';
  const { el } = JS.UI;

  const DOSSIER = 'audio/sons-mysteres/';
  const MANCHES = 3;
  const MEMOIRE = 12;        // sons récents évités d'une partie à l'autre
  const ECHECS_MAX = 3;      // au-delà, on considère que les sons ne sont pas disponibles sur l'appareil
  const MALUS_REECOUTE = 0.2;  // part de la manche retirée à chaque réécoute avant de répondre
  const POINTS_MIN = 0.4;      // une bonne réponse rapporte toujours au moins cela
  const DELAI_SUITE = 5000;    // après une bonne réponse : le temps de lire la phrase, puis son suivant (ms)

  /** Points d'une bonne réponse selon le nombre de réécoutes avant de répondre. */
  const pointsPour = reecoutes => Math.max(POINTS_MIN, 1 - MALUS_REECOUTE * reecoutes);

  // Par niveau : nombre de choix et façon de choisir les mauvaises réponses.
  const NIVEAUX = [
    { choix: 2, mode: 'loin', texte: '2 choix, des sons très différents' },
    { choix: 3, mode: 'loin', texte: '3 choix, des sons familiers bien distincts' },
    { choix: 3, mode: 'univers', texte: '3 choix, des sons d\'une même famille' },
    { choix: 4, mode: 'univers', texte: '4 choix, des sons d\'un même univers' },
    { choix: 4, mode: 'proche', proches: 1, texte: '4 choix, des sons parfois proches' },
    { choix: 4, mode: 'proche', proches: 3, texte: '4 choix, des distinctions plus fines' }
  ];

  const sons = () => JS.Donnees.sonsMysteres || [];
  const parId = id => sons().find(s => s.id === id) || null;
  const majuscule = t => t.charAt(0).toUpperCase() + t.slice(1);

  /** Deux sons que l'on ne propose jamais ensemble : l'extrait pourrait correspondre aux deux. */
  function incompatibles(a, b) {
    return (a.exclus || []).includes(b.id) || (b.exclus || []).includes(a.id);
  }
  function proches(a, b) {
    return (a.proches || []).includes(b.id) || (b.proches || []).includes(a.id);
  }

  /* ---------- Tirage des questions ---------- */

  /**
   * Sons de la partie, puis réserve (pour remplacer un fichier illisible).
   * recents : identifiants des sons entendus récemment, du plus ancien au plus récent.
   */
  function tirer(niveau, recents) {
    const rang = new Map((recents || []).map((id, i) => [id, i + 1]));
    const eligibles = sons().filter(s => niveau > 2 || s.facile);
    // D'abord les sons pas entendus récemment, sinon les plus anciens.
    const file = JS.UI.melanger(eligibles).sort((a, b) => (rang.get(a.id) || 0) - (rang.get(b.id) || 0));
    const choisis = [];
    // Premier passage : un univers différent à chaque manche ; second passage : on complète.
    for (const strict of [true, false]) {
      for (const s of file) {
        if (choisis.length >= MANCHES) break;
        if (choisis.includes(s) || choisis.some(c => incompatibles(c, s))) continue;
        if (strict && choisis.some(c => c.univers === s.univers)) continue;
        choisis.push(s);
      }
    }
    return { questions: choisis, reserve: file.filter(s => !choisis.includes(s)) };
  }

  /** Réponses proposées pour un son : la bonne et des fausses adaptées au niveau, dans un ordre mélangé. */
  function choixPour(son, niveau) {
    const regle = NIVEAUX[niveau - 1];
    const univers = (JS.Donnees.sonsMysteresUnivers || {})[son.univers] || { leurres: [] };
    const autres = sons().filter(s => s !== son && !incompatibles(s, son));
    const leurre = ([emoji, nom]) => ({ emoji, nom });
    const melanger = JS.UI.melanger;

    const memeUnivers = melanger(autres.filter(s => s.univers === son.univers));
    const leurresUnivers = melanger(univers.leurres.map(leurre));
    let candidats;
    if (regle.mode === 'loin') {
      // Sons très reconnaissables, pris dans d'autres univers (un univers différent pour chacun si possible).
      const loin = melanger(autres.filter(s => s.facile && s.univers !== son.univers && !proches(s, son)));
      const vus = new Set();
      const varies = loin.filter(s => !vus.has(s.univers) && vus.add(s.univers));
      candidats = varies.concat(loin);
    } else if (regle.mode === 'univers') {
      candidats = memeUnivers.filter(s => !proches(s, son))
        .concat(leurresUnivers, memeUnivers);
    } else {
      // Réponses proches (sons voisins du catalogue et leurres propres à ce son), puis même univers.
      const voisins = melanger(autres.filter(s => proches(s, son)).concat((son.leurres || []).map(leurre)));
      candidats = voisins.slice(0, regle.proches).concat(memeUnivers.filter(s => !proches(s, son)), voisins, leurresUnivers);
    }

    const fausses = [];
    for (const c of candidats) {
      if (fausses.length >= regle.choix - 1) break;
      if (c.nom === son.nom || fausses.some(f => f.nom === c.nom)) continue;
      if (c.id && fausses.some(f => f.id && incompatibles(parId(f.id), c))) continue;
      fausses.push({ id: c.id || null, nom: c.nom, emoji: c.emoji, bonne: false });
    }
    return melanger(fausses.concat({ id: son.id, nom: son.nom, emoji: son.emoji, bonne: true }));
  }

  /* ---------- Formulations ---------- */

  /** « celui d'un chien », « celui de la pluie », « celui du vent », « celui des oies ». */
  function de(nom) {
    if (/^le /.test(nom)) return 'du ' + nom.slice(3);
    if (/^les /.test(nom)) return 'des ' + nom.slice(4);
    if (/^(des|de) /.test(nom) || /^de l'/.test(nom)) return nom;
    if (/^(un|une) /.test(nom)) return 'd\'' + nom;
    return 'de ' + nom;
  }
  const bravo = nom => 'Bravo, ' + (/^(des|les) /.test(nom) ? 'ce sont bien ' : 'c\'est bien ') + nom + ' !';
  const correction = nom => 'Ce son était celui ' + de(nom) + '.';

  /* ---------- Mémoire des sons entendus ---------- */

  function recents(profil) {
    return profil && Array.isArray(profil.sonsMysteresRecents) ? profil.sonsMysteresRecents : [];
  }
  function memoriser(profil, id) {
    if (!profil) return;
    profil.sonsMysteresRecents = recents(profil).filter(x => x !== id).concat(id).slice(-MEMOIRE);
    if (JS.Stockage && JS.Stockage.sauver) JS.Stockage.sauver();
  }

  function injecterStyle() {
    if (document.getElementById('style-son-mystere')) return;
    document.head.append(el('style', { id: 'style-son-mystere' }, `
      .sm-ecoute { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; width: 100%; }
      .sm-bouton { min-width: min(100%, 18rem); font-size: 1.35rem; min-height: 5rem; }
      .sm-etat { display: flex; align-items: center; justify-content: center; gap: 0.6rem; min-height: 2rem; margin: 0; font-weight: 700; }
      .sm-ondes { display: inline-flex; align-items: flex-end; gap: 0.2rem; height: 1.4rem; }
      .sm-ondes span { width: 0.35rem; height: 100%; border-radius: 0.2rem; background: var(--primaire);
        transform-origin: bottom; animation: sm-onde 0.9s ease-in-out infinite; }
      .sm-ondes span:nth-child(2) { animation-delay: 0.15s; }
      .sm-ondes span:nth-child(3) { animation-delay: 0.3s; }
      .sm-ondes span:nth-child(4) { animation-delay: 0.45s; }
      @keyframes sm-onde { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
      @media (prefers-reduced-motion: reduce) { .sm-ondes span { animation: none; transform: scaleY(0.7); } }
      .sm-choix .btn-choix { display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 0.2rem; min-height: 5.5rem; padding: 0.6rem 0.8rem; font-size: 1.15rem; line-height: 1.25; }
      .sm-choix.sm-deux { max-width: 32rem; }
      .sm-emoji { font-size: 2.2rem; line-height: 1.1; }
      .sm-bilan { width: 100%; max-width: 44rem; margin: 0; }
      .sm-bilan p:last-child { margin-bottom: 0; }
    `));
  }

  JS.Jeux.register({
    id: 'son-mystere',
    nom: 'Le son mystère',
    categorie: 'auditive',
    icone: '👂',
    description: 'Écoutez un son familier et retrouvez ce qui l\'a produit.',
    consigne: 'Vous allez entendre trois sons de la vie de tous les jours, l\'un après l\'autre. Appuyez sur « Écouter le son », puis choisissez votre réponse parmi les propositions. Prenez votre temps : rien n\'est chronométré. Vous pouvez réécouter le son, mais chaque réécoute avant de répondre retire quelques points. Après une bonne réponse, le jeu passe seul au son suivant ; sinon, il vous indique de quel son il s\'agissait. Pensez à régler le volume de votre appareil à votre convenance.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => MANCHES + ' sons à reconnaître, ' + NIVEAUX[n - 1].texte,
    logique: { tirer, choixPour, bravo, correction, pointsPour, NIVEAUX, MANCHES },

    start(ctx) {
      injecterStyle();
      const tirage = tirer(ctx.niveau, recents(ctx.profil));
      const questions = tirage.questions;
      const reserve = tirage.reserve;
      let index = 0;
      let bonnes = 0;
      let points = 0;
      let reecoutesTotal = 0;
      let comptees = 0;     // manches réellement jouées (un son illisible n'est pas compté)
      let echecs = 0;
      let lecteur = null;    // lecteur audio de la manche en cours

      function arreterSon() {
        if (!lecteur) return;
        try { lecteur.pause(); } catch (e) { /* lecteur déjà arrêté */ }
      }

      // Si le joueur met la partie en pause, le son s'arrête aussi.
      const veille = setInterval(() => {
        if (ctx.enPause && ctx.enPause()) arreterSon();
      }, 300);

      function abandonnerLecteur() {
        if (!lecteur) return;
        const ancien = lecteur;
        lecteur = null;
        try {
          ancien.pause();
          ancien.removeAttribute('src');
          ancien.load();
        } catch (e) { /* rien à libérer */ }
      }

      afficherManche();

      function afficherManche() {
        abandonnerLecteur();
        if (index >= questions.length) {
          finir();
          return;
        }
        const son = questions[index];
        const propositions = choixPour(son, ctx.niveau);
        const etat = { ecoute: false, fini: false, enLecture: false, echec: false, reecoutes: 0, suiteAnnulee: false };

        ctx.root.innerHTML = '';
        ctx.message('Appuyez sur « Écouter le son » pour commencer.', 'info');

        const libelleBouton = el('span');
        const boutonEcouter = el('button', { type: 'button', class: 'btn btn-primaire btn-grand sm-bouton', onclick: basculerLecture }, libelleBouton);
        const etatLecture = el('p', { class: 'sm-etat', role: 'status', 'aria-live': 'polite' });
        const boutons = propositions.map(p => el('button', {
          type: 'button',
          class: 'btn btn-choix',
          disabled: true,
          onclick: () => repondre(p)
        },
        el('span', { class: 'sm-emoji', 'aria-hidden': 'true' }, p.emoji),
        el('span', { class: 'sm-libelle' }, majuscule(p.nom))));
        const zoneEcoute = el('div', { class: 'sm-ecoute' }, boutonEcouter, etatLecture);
        const suite = el('div', { class: 'zone-jeu' });

        ctx.root.append(
          el('p', { class: 'compteur' }, 'Son ' + (index + 1) + ' sur ' + questions.length),
          el('h2', { class: 'enonce' }, 'Écoutez le son, puis choisissez votre réponse.'),
          zoneEcoute,
          el('div', {
            class: 'choix sm-choix' + (propositions.length === 2 ? ' sm-deux' : ''),
            role: 'group',
            'aria-label': 'Réponses possibles'
          }, boutons),
          suite
        );
        majBouton();
        boutonEcouter.focus();

        function majBouton() {
          libelleBouton.textContent = etat.enLecture ? '⏹ Arrêter le son'
            : (etat.ecoute ? '🔁 Réécouter le son' : '🔊 Écouter le son');
          etatLecture.innerHTML = '';
          if (etat.enLecture) {
            etatLecture.append(
              el('span', { class: 'sm-ondes', 'aria-hidden': 'true' }, el('span'), el('span'), el('span'), el('span')),
              'Lecture en cours…'
            );
          }
        }

        function creerLecteur() {
          if (typeof Audio !== 'function') return null;
          const a = new Audio();
          a.preload = 'auto';
          a.addEventListener('playing', () => {
            if (a !== lecteur) return;
            etat.enLecture = true;
            if (!etat.ecoute) {
              // Les réponses deviennent disponibles dès que le son a commencé.
              etat.ecoute = true;
              memoriser(ctx.profil, son.id);
              if (!etat.fini) {
                boutons.forEach(b => { b.disabled = false; });
                ctx.message('Quel est ce son ? Une réécoute est possible, mais retire quelques points.', 'info');
              }
            }
            majBouton();
          });
          const arret = () => {
            if (a !== lecteur) return;
            etat.enLecture = false;
            majBouton();
          };
          a.addEventListener('ended', arret);
          a.addEventListener('pause', arret);
          a.addEventListener('error', () => { if (a === lecteur) sonIllisible(); });
          a.src = DOSSIER + son.id + '.mp3';
          return a;
        }

        function basculerLecture() {
          if (!ctx.actif() || etat.echec || etat.fini) return;
          JS.Audio.taire();
          if (!lecteur) lecteur = creerLecteur();
          if (!lecteur) {
            sonIllisible();
            return;
          }
          if (etat.enLecture) {
            lecteur.pause();
            return;
          }
          const a = lecteur;
          if (etat.ecoute && !etat.fini) {
            // Réécoute avant de répondre : elle reste permise, mais coûte quelques points.
            // Comptée à l'appui sur le bouton, une seule fois : le lecteur peut signaler plusieurs
            // fois le début d'une même lecture (mise en mémoire tampon), ce qui ne doit rien coûter.
            etat.reecoutes++;
            reecoutesTotal++;
            ctx.message('Quel est ce son ? ' + JS.UI.pluriel(etat.reecoutes, 'réécoute comptée', 'réécoutes comptées') + '.', 'info');
          }
          try {
            a.currentTime = 0;
            const promesse = a.play();
            if (promesse && promesse.catch) {
              promesse.catch(e => {
                // Une lecture interrompue par un nouvel appui n'est pas une panne.
                if (a === lecteur && e && e.name !== 'AbortError') sonIllisible();
              });
            }
          } catch (e) {
            sonIllisible();
          }
        }

        /** Fichier absent ou illisible : on ne bloque pas la partie, on propose une autre question. */
        function sonIllisible() {
          if (etat.echec || !ctx.actif()) return;
          etat.echec = true;
          etat.enLecture = false;
          echecs++;
          abandonnerLecteur();
          majBouton();
          boutonEcouter.disabled = true;
          boutons.forEach(b => { b.disabled = true; });
          suite.innerHTML = '';

          if (echecs >= ECHECS_MAX) {
            ctx.message('Les sons ne peuvent pas être lus sur cet appareil pour le moment. Cette partie ne sera pas comptée.', 'erreur');
            const retour = el('a', { class: 'btn btn-primaire btn-grand', href: '#/accueil' }, 'Revenir à l\'accueil');
            suite.append(el('div', { class: 'ligne-boutons centre' }, retour));
            retour.focus();
            return;
          }
          const dejaEntendu = etat.ecoute;
          ctx.message(dejaEntendu
            ? 'Ce son ne peut plus être lu. Vous pouvez répondre quand même ou passer à une autre question.'
            : 'Ce son ne peut pas être lu. Ce n\'est pas grave : passons à une autre question.', 'erreur');
          const passer = el('button', { type: 'button', class: 'btn btn-primaire btn-grand', onclick: autreQuestion }, 'Passer à une autre question ▶');
          suite.append(el('div', { class: 'ligne-boutons centre' }, passer));
          if (dejaEntendu && !etat.fini) boutons.forEach(b => { b.disabled = false; });
          passer.focus();
        }

        function autreQuestion() {
          if (!ctx.actif()) return;
          if (etat.fini) {
            index++;
          } else {
            // On remplace ce son par un autre de la réserve ; s'il n'y en a plus, la manche n'est pas comptée.
            const i = reserve.findIndex(s => !questions.some(q => q === s || incompatibles(q, s)));
            if (i >= 0) questions[index] = reserve.splice(i, 1)[0];
            else questions.splice(index, 1);
          }
          afficherManche();
        }

        function repondre(proposition) {
          if (!ctx.actif() || etat.fini || !etat.ecoute) return;
          etat.fini = true;
          comptees++;
          arreterSon();
          boutons.forEach((b, i) => {
            const p = propositions[i];
            const libelle = b.querySelector('.sm-libelle');
            b.disabled = true;
            if (p.bonne) {
              b.classList.add('correct');
              libelle.textContent = '✓ ' + majuscule(p.nom);
            } else if (p === proposition) {
              b.classList.add('incorrect');
              libelle.textContent = '✗ ' + majuscule(p.nom);
            }
          });
          const texte = proposition.bonne ? bravo(son.nom) : correction(son.nom);
          if (proposition.bonne) {
            bonnes++;
            points += pointsPour(etat.reecoutes);
            ctx.audio.succes();
            ctx.message(texte, 'succes');
          } else {
            ctx.audio.erreur();
            ctx.message(texte, 'info');
          }

          const dernier = index + 1 >= questions.length;
          const mancheAffichee = index;
          const passer = () => {
            if (index !== mancheAffichee) return;   // déjà passé à la suite
            index++;
            afficherManche();
          };
          const zoneBouton = el('div', { class: 'ligne-boutons centre' });
          etat.afficherContinuer = () => {
            const continuer = el('button', { type: 'button', class: 'btn btn-primaire btn-grand', onclick: passer },
              dernier ? 'Voir le résultat ▶' : 'Continuer ▶');
            zoneBouton.innerHTML = '';
            zoneBouton.append(continuer);
            return continuer;
          };
          suite.innerHTML = '';
          zoneEcoute.innerHTML = '';
          zoneEcoute.append(
            el('section', { class: 'panneau sm-bilan', 'aria-live': 'polite' },
              el('p', null, el('strong', null, 'Bonne réponse : '),
                el('span', { 'aria-hidden': 'true' }, son.emoji + ' '), majuscule(son.nom) + '.'),
              son.phrase ? el('p', null, el('span', { 'aria-hidden': 'true' }, '💬 '), son.phrase) : null
            )
          );
          suite.append(zoneBouton);
          JS.Audio.parler(texte + ' ' + (son.phrase || ''));
          if (proposition.bonne) {
            // Comme dans les autres jeux : après une bonne réponse, on passe seul à la suite.
            etat.passageAuto = true;
            ctx.enchainer(() => { if (!etat.suiteAnnulee) passer(); }, DELAI_SUITE);
          } else {
            etat.afficherContinuer().focus();
          }
        }
      }

      function finir() {
        abandonnerLecteur();
        const reussite = comptees ? points / comptees : 0;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: JS.UI.pluriel(bonnes, 'son reconnu', 'sons reconnus') + ' sur ' + comptees
            + (reecoutesTotal ? ', avec ' + JS.UI.pluriel(reecoutesTotal, 'réécoute') : '') + '.'
        });
      }

      return () => {
        clearInterval(veille);
        abandonnerLecteur();
      };
    }
  });
})();
