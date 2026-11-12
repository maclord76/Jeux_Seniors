/* « Ça existait déjà ? » : quand vous aviez 20 ans, est-ce que la Carte Bleue existait déjà ?
   Personnalisé avec l'année de naissance du joueur si elle est connue, sinon on parle d'années. */
(function () {
  'use strict';
  const { el } = JS.UI;

  const PAR_PARTIE = 10;
  const MEMOIRE = 100;   // nombre de sujets récents évités d'une partie à l'autre
  const AGES = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70];

  // [écart minimal, écart maximal] en années entre l'objet et l'année de référence.
  // Jamais moins de 2 ans : certaines dates varient d'un an selon les sources.
  const NIVEAUX = [
    [12, 60],
    [9, 40],
    [7, 25],
    [5, 12],
    [3, 8],
    [2, 5]
  ];

  function injecterStyle() {
    if (document.getElementById('style-epoque')) return;
    document.head.append(el('style', { id: 'style-epoque' }, `
      .epoque-repere { font-size: 1.2rem; font-weight: 700; margin: 0; text-align: center; }
      .epoque-icone { font-size: 4rem; line-height: 1; margin: 0; }
      .epoque-question { font-size: 1.5rem; }
      .epoque-reponses { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
        gap: 0.8rem; width: 100%; max-width: 32rem; }
      .epoque-reponses .btn-choix { font-size: 1.3rem; min-height: 4.6rem; }
      .epoque-bilan { width: 100%; max-width: 44rem; margin: 0; }
      .epoque-bilan p:last-child { margin-bottom: 0; }
    `));
  }

  function pluralAns(n) {
    return n + ' an' + (n > 1 ? 's' : '');
  }

  /** Tire les questions : { item, reference (année), ageReference (ou null), existait (booléen) }. */
  function photoDe(item) {
    return (JS.Donnees.epoquePhotos || {})[item.sujet] || null;
  }

  /** Sujets montrés lors des dernières parties du joueur, pour éviter les répétitions. */
  function recents(profil) {
    if (!Array.isArray(profil.epoqueRecents)) profil.epoqueRecents = [];
    return profil.epoqueRecents;
  }

  function memoriser(profil, questions) {
    const liste = recents(profil).concat(questions.map(q => q.item.sujet));
    profil.epoqueRecents = liste.slice(-MEMOIRE);
    JS.Stockage.sauver();
  }

  /**
   * Ordre de préférence des réserves : repères pas vus récemment (avec photo d'abord en mode Photos),
   * puis tous les repères si cela ne suffit pas.
   */
  function choisirQuestions(niveau, modePhotos, profil) {
    const [ecartMin, ecartMax] = NIVEAUX[niveau - 1];
    const naissance = JS.Epoque.anneeNaissance();
    const anneeCourante = new Date().getFullYear();
    const items = JS.Donnees.epoque;
    const anneeMin = Math.min(...items.map(i => i.annee));
    const anneeMax = Math.max(...items.map(i => i.annee));
    const utilises = new Set();
    const questions = [];
    const dejaVus = new Set(recents(profil));
    const nouveaux = liste => liste.filter(i => !dejaVus.has(i.sujet));
    const avecPhoto = items.filter(photoDe);
    const reserves = modePhotos
      ? [nouveaux(avecPhoto), avecPhoto, nouveaux(items), items]
      : [nouveaux(items), items];

    // Avec l'année de naissance si possible ; on complète avec des années simples s'il le faut.
    for (let essai = 0; essai < 800 * reserves.length && questions.length < PAR_PARTIE; essai++) {
      const reserve = reserves[Math.floor(essai / 800)];
      const avecAge = naissance && essai % 800 < 400;
      let reference;
      let ageReference = null;
      if (avecAge) {
        ageReference = JS.UI.choisir(AGES);
        reference = naissance + ageReference;
        if (reference > anneeCourante || reference < anneeMin - 5 || reference > anneeMax + 5) continue;
      } else {
        reference = JS.UI.entier(anneeMin + 5, anneeMax - 3);
      }
      // Une fois sur deux, on cherche un objet déjà là ; sinon un objet arrivé après.
      const existait = Math.random() < 0.5;
      const candidats = reserve.filter(i => {
        if (utilises.has(i)) return false;
        const ecart = Math.abs(i.annee - reference);
        if (ecart < ecartMin || ecart > ecartMax) return false;
        if ((i.annee < reference) !== existait) return false;
        // Avec l'année de naissance, on évite les repères bien antérieurs à la naissance (trop évidents).
        return !avecAge || i.annee >= naissance - 3;
      });
      if (!candidats.length) continue;
      const item = JS.UI.choisir(candidats);
      utilises.add(item);
      questions.push({ item, reference, ageReference, existait });
    }
    return questions;
  }

  JS.Jeux.register({
    id: 'epoque',
    nom: 'Ça existait déjà ?',
    categorie: 'auditive',
    icone: '🕰️',
    description: 'Quand vous aviez 20 ans, la Carte Bleue existait-elle déjà ? Le TGV ? Le Minitel ?',
    consigne: 'Pour chaque question, on vous indique une époque, par exemple « quand vous aviez 20 ans », et un objet, un lieu, un film ou un événement. Répondez « Oui, déjà » s\'il existait déjà à ce moment-là, ou « Pas encore » s\'il est arrivé plus tard. La date exacte s\'affiche ensuite, avec votre âge à ce moment-là. Indiquez votre année de naissance dans les Réglages pour que les questions parlent de votre jeunesse.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [min] = NIVEAUX[n - 1];
      return PAR_PARTIE + ' questions, dates éloignées d\'au moins ' + pluralAns(min) + ' de l\'époque demandée'
        + (n >= 4 ? ' (et assez proches)' : '');
    },

    start(ctx) {
      injecterStyle();
      const naissance = JS.Epoque.anneeNaissance();
      const modePhotos = ctx.reglages.visuels === 'photos';
      const questions = choisirQuestions(ctx.niveau, modePhotos, ctx.profil);
      memoriser(ctx.profil, questions);
      let index = -1;
      let bonnes = 0;

      questionSuivante();
      if (!naissance) {
        ctx.message('Astuce : indiquez votre année de naissance dans les Réglages pour des questions sur votre jeunesse.', 'info');
      }

      function textesQuestion(q) {
        const repere = q.ageReference !== null
          ? 'Quand vous aviez ' + q.ageReference + ' ans, en ' + q.reference + ' :'
          : 'En ' + q.reference + ' :';
        return { repere, question: JS.Epoque.question(q.item) };
      }

      /** Photo créditée en mode Photos (si le repère en a une), emoji sinon. */
      function illustration(item) {
        const photo = modePhotos ? photoDe(item) : null;
        if (!photo) return el('p', { class: 'epoque-icone', 'aria-hidden': 'true' }, item.icone);
        // Pour un film, une chanson ou un événement, la photo montre souvent une personne : JS.Photos le précise.
        return JS.Photos.figure(photo, JS.Epoque.titre(item));
      }

      function questionSuivante() {
        index++;
        if (index >= questions.length) {
          finir();
          return;
        }
        const q = questions[index];
        const { repere, question } = textesQuestion(q);
        const texteLu = repere + ' ' + question;
        let repondu = false;

        ctx.root.innerHTML = '';
        if (index > 0) ctx.message('', 'info');

        const boutonOui = el('button', { class: 'btn btn-choix', onclick: () => repondre(true) }, '✓ Oui, déjà');
        const boutonNon = el('button', { class: 'btn btn-choix', onclick: () => repondre(false) }, '✗ Pas encore');
        const suite = el('div', { class: 'zone-jeu' });

        ctx.root.append(
          el('p', { class: 'compteur' }, 'Question ' + (index + 1) + ' sur ' + questions.length),
          el('p', { class: 'epoque-repere' }, repere),
          illustration(q.item),
          el('h2', { class: 'enonce epoque-question' }, question),
          el('div', { class: 'epoque-reponses', role: 'group', 'aria-label': 'Votre réponse' }, boutonOui, boutonNon),
          JS.Audio.voixDisponible() ? el('div', { class: 'ligne-boutons centre' }, JS.UI.boutonLecture(texteLu, 'Écouter la question')) : null,
          suite
        );
        JS.Audio.parler(texteLu);

        function repondre(reponse) {
          if (!ctx.actif() || repondu) return;
          repondu = true;
          JS.Audio.taire();
          const juste = reponse === q.existait;
          [boutonOui, boutonNon].forEach(b => { b.disabled = true; });
          const choisi = reponse ? boutonOui : boutonNon;
          choisi.classList.add(juste ? 'correct' : 'incorrect');
          if (!juste) (reponse ? boutonNon : boutonOui).classList.add('correct');

          if (juste) {
            bonnes++;
            ctx.audio.succes();
            ctx.message(JS.UI.choisir(['Bravo, c\'est exact !', 'Tout à fait !', 'Bonne réponse !']), 'succes');
          } else {
            ctx.audio.erreur();
            ctx.message('Eh non ! Voici la date exacte.', 'info');
          }

          const ecart = Math.abs(q.item.annee - q.reference);
          const age = JS.Epoque.texteAge(q.item.annee);
          const phrase = JS.Epoque.titre(q.item) + ' date de ' + q.item.annee + ', soit ' + pluralAns(ecart)
            + (q.item.annee > q.reference ? ' plus tard' : ' plus tôt') + (age ? ' : ' + age : '') + '.';
          const dernier = index + 1 >= questions.length;
          const bouton = el('button', { class: 'btn btn-primaire btn-grand', onclick: questionSuivante },
            dernier ? 'Voir le bilan ▶' : 'Question suivante ▶');
          suite.append(
            el('section', { class: 'panneau epoque-bilan', 'aria-live': 'polite' },
              el('p', null, el('strong', null, phrase)),
              el('p', null, el('span', { 'aria-hidden': 'true' }, '💬 '), q.item.detail)
            ),
            el('div', { class: 'ligne-boutons centre' }, bouton)
          );
          JS.Audio.parler(phrase + ' ' + q.item.detail);
          bouton.focus();
        }
      }

      function finir() {
        const reussite = questions.length ? bonnes / questions.length : 0;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: JS.UI.pluriel(bonnes, 'bonne réponse', 'bonnes réponses') + ' sur ' + questions.length + '.'
        });
      }
    }
  });
})();
