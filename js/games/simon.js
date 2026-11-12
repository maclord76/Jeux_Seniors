/* Simon mélodie : écouter et regarder une suite de notes, puis la reproduire dans le même ordre. */
(function () {
  'use strict';
  const { el } = JS.UI;

  // Chaque touche a une couleur, un symbole, un nom et une note (accord de do majeur).
  const TOUCHES = [
    { nom: 'Rouge', forme: 'rond', symbole: '●', couleur: 'var(--jeu-rouge)', texte: '#ffffff', frequence: 262 },
    { nom: 'Vert', forme: 'triangle', symbole: '▲', couleur: 'var(--jeu-vert)', texte: '#ffffff', frequence: 330 },
    { nom: 'Bleu', forme: 'carré', symbole: '■', couleur: 'var(--jeu-bleu)', texte: '#ffffff', frequence: 392 },
    { nom: 'Jaune', forme: 'étoile', symbole: '★', couleur: 'var(--jeu-jaune)', texte: '#1b1b1b', frequence: 523 }
  ];

  // [longueur visée, durée d'une note en ms, longueur de départ]
  const NIVEAUX = [
    [3, 1000, 1],
    [4, 950, 1],
    [5, 900, 1],
    [6, 850, 2],
    [7, 800, 2],
    [8, 750, 3],
    [9, 700, 3],
    [10, 650, 4]
  ];
  const ERREURS_MAX = 3;

  const CSS = `
    .sm-touches { --colonnes: 2; --largeur-max: 26rem; --ecart: 1rem; }
    .sm-touche {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.2rem;
      aspect-ratio: 1 / 1; min-height: 6rem; padding: 0.3rem;
      border: 4px solid var(--bord); border-radius: 1.4rem;
      background: var(--sm-couleur); color: var(--sm-texte);
      font: inherit; font-weight: 700; cursor: pointer; touch-action: manipulation; user-select: none;
      opacity: 0.82; transition: transform 0.12s, opacity 0.12s, filter 0.12s;
    }
    .sm-touche .sm-symbole { font-size: 3rem; line-height: 1; }
    .sm-touche .sm-nom { font-size: 1rem; }
    .sm-touche.sm-allume {
      opacity: 1; filter: brightness(1.3) saturate(1.2); transform: scale(1.07);
      outline: 6px solid var(--texte); outline-offset: 3px; box-shadow: 0 0 0 0.6rem var(--carte);
    }
    .sm-touche.sm-allume .sm-symbole { transform: scale(1.25); }
    .sm-attente .sm-touche { cursor: default; }
    .sm-progression { font-size: 1.6rem; letter-spacing: 0.3rem; min-height: 2.2rem; text-align: center; }
  `;

  function injecterStyle() {
    if (document.getElementById('style-simon')) return;
    document.head.append(el('style', { id: 'style-simon' }, CSS));
  }

  JS.Jeux.register({
    id: 'simon',
    nom: 'Simon mélodie',
    categorie: 'auditive',
    icone: '🎹',
    description: 'Écoutez une petite mélodie et rejouez-la dans le même ordre.',
    consigne: 'L\'ordinateur joue une petite mélodie : les touches s\'allument l\'une après l\'autre, chacune avec sa note. Touchez ensuite les mêmes touches, dans le même ordre. À chaque réussite, la mélodie s\'allonge d\'une note. Vous pouvez réécouter la mélodie quand vous le souhaitez.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [cible, tempo] = NIVEAUX[n - 1];
      const rythme = tempo >= 900 ? 'mélodie lente' : tempo >= 750 ? 'mélodie modérée' : 'mélodie plus vive';
      return 'objectif : ' + cible + ' notes, ' + rythme;
    },

    start(ctx) {
      injecterStyle();
      const [cible, tempo, depart] = NIVEAUX[ctx.niveau - 1];
      const allumage = Math.round(tempo * 0.6);
      const sons = !!ctx.reglages.sons;

      const sequence = [];
      let saisie = 0;               // nombre de notes déjà rejouées correctement
      let meilleure = depart - 1;   // plus longue mélodie reproduite
      let erreurs = 0;
      let reecoutes = 0;
      let phase = 'debut';          // 'debut' | 'ecoute' | 'saisie' | 'pause'
      let jeton = 0;

      const compteur = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const progression = el('p', { class: 'sm-progression', 'aria-live': 'polite' });
      const boutons = TOUCHES.map((t, i) => el('button', {
        class: 'sm-touche',
        style: { '--sm-couleur': t.couleur, '--sm-texte': t.texte },
        'aria-label': t.nom + ', ' + t.forme,
        onclick: () => toucher(i)
      }, el('span', { class: 'sm-symbole', 'aria-hidden': 'true' }, t.symbole), el('span', { class: 'sm-nom', 'aria-hidden': 'true' }, t.nom)));
      const clavier = el('div', { class: 'plateau sm-touches sm-attente' }, boutons);
      const boutonEcouter = el('button', { class: 'btn btn-primaire btn-grand', onclick: () => lancer() }, '▶ Écouter la mélodie');
      const boutonReecouter = el('button', { class: 'btn btn-secondaire', hidden: true, onclick: () => reecouter() }, '🔁 Réécouter');
      ctx.root.append(compteur, clavier, progression, el('div', { class: 'ligne-boutons centre' }, boutonEcouter, boutonReecouter));

      function nouvelleNote() {
        // Hasard, en évitant trois fois la même touche de suite.
        let t;
        do {
          t = JS.UI.entier(0, TOUCHES.length - 1);
        } while (sequence.length >= 2 && sequence[sequence.length - 1] === t && sequence[sequence.length - 2] === t);
        sequence.push(t);
      }

      function majCompteur() {
        compteur.textContent = 'Mélodie de ' + JS.UI.pluriel(sequence.length, 'note') + ' — objectif : ' + cible + ' notes';
      }

      function majProgression() {
        if (phase !== 'saisie') {
          progression.textContent = '';
          return;
        }
        progression.textContent = '●'.repeat(saisie) + '○'.repeat(sequence.length - saisie);
        progression.setAttribute('aria-label', 'Note ' + saisie + ' sur ' + sequence.length);
      }

      function majEtat() {
        clavier.classList.toggle('sm-attente', phase !== 'saisie');
        boutonReecouter.disabled = phase !== 'saisie';
        majProgression();
      }

      /** Allume une touche et joue sa note (si les sons sont activés). */
      function allumer(i, duree) {
        const b = boutons[i];
        b.classList.add('sm-allume');
        if (sons) JS.Audio.note(TOUCHES[i].frequence, duree / 1000, { type: 'triangle', volume: 0.25, force: true });
        ctx.plusTard(() => b.classList.remove('sm-allume'), duree);
      }

      function jouerSequence() {
        jeton++;
        const j = jeton;
        phase = 'ecoute';
        saisie = 0;
        majCompteur();
        majEtat();
        ctx.message(sons ? 'Écoutez et regardez bien…' : 'Regardez bien les touches qui s\'allument…', 'info');
        sequence.forEach((t, k) => ctx.plusTard(() => { if (j === jeton) allumer(t, allumage); }, 800 + k * tempo));
        ctx.plusTard(() => {
          if (j !== jeton) return;
          phase = 'saisie';
          majEtat();
          ctx.message('À vous ! Touchez les mêmes couleurs, dans le même ordre.', 'info');
        }, 800 + sequence.length * tempo);
      }

      function lancer() {
        boutonEcouter.hidden = true;
        boutonReecouter.hidden = false;
        for (let k = 0; k < depart; k++) nouvelleNote();
        jouerSequence();
      }

      function reecouter() {
        if (phase !== 'saisie') return;
        reecoutes++;
        jouerSequence();
      }

      function toucher(i) {
        if (phase !== 'saisie') return;
        allumer(i, 350);

        if (i !== sequence[saisie]) {
          erreur();
          return;
        }
        saisie++;
        majProgression();
        if (saisie < sequence.length) return;

        // Mélodie complète.
        phase = 'pause';
        meilleure = sequence.length;
        majEtat();
        if (meilleure >= cible) {
          ctx.plusTard(() => ctx.audio.succes(), 400);
          ctx.message('Bravo ! Vous avez rejoué la mélodie complète de ' + cible + ' notes !', 'succes');
          ctx.plusTard(finir, 2000);
          return;
        }
        ctx.plusTard(() => ctx.audio.succes(), 400);
        ctx.message('Bravo ! La mélodie s\'allonge d\'une note.', 'succes');
        ctx.plusTard(() => {
          nouvelleNote();
          jouerSequence();
        }, 1800);
      }

      function erreur() {
        phase = 'pause';
        erreurs++;
        majEtat();
        ctx.plusTard(() => ctx.audio.erreur(), 350);
        if (erreurs >= ERREURS_MAX) {
          ctx.message('Ce n\'était pas tout à fait ça. Merci pour cette belle partie !', 'info');
          ctx.plusTard(finir, 2200);
          return;
        }
        ctx.message('Ce n\'était pas tout à fait ça. Pas de souci : réécoutez la même mélodie.', 'info');
        ctx.plusTard(jouerSequence, 2000);
      }

      function finir() {
        const base = meilleure >= cible ? 1 : meilleure / cible;
        // Pénalités légères : une erreur ou une réécoute ne coûte presque rien.
        const penalite = 0.04 * erreurs + Math.min(0.1, 0.02 * reecoutes);
        const reussite = Math.max(0, Math.min(1, base - penalite));
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: meilleure >= cible
            ? 'Mélodie de ' + cible + ' notes rejouée en entier !'
            : 'Plus longue mélodie rejouée : ' + JS.UI.pluriel(meilleure, 'note') + ' sur ' + cible + '.'
        });
      }

      majCompteur();
      compteur.textContent = 'Objectif : rejouer une mélodie de ' + cible + ' notes';
      ctx.message(sons
        ? 'Quand vous êtes prêt, touchez « Écouter la mélodie ».'
        : 'Les sons sont coupés dans vos réglages : suivez simplement les touches qui s\'allument.', 'info');
      boutonEcouter.focus();
    }
  });
})();
