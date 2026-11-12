/* Quiz souvenirs et culture : questions à 4 choix, façon Trivial Pursuit, avec une anecdote après chaque réponse. */
(function () {
  'use strict';
  const { el } = JS.UI;

  const PAR_PARTIE = 10;
  const MEMOIRE = 200;   // questions récentes évitées d'une partie à l'autre

  // Nombre de questions de difficulté [1, 2, 3] par niveau.
  const NIVEAUX = [
    [10, 0, 0],
    [7, 3, 0],
    [4, 6, 0],
    [2, 6, 2],
    [0, 5, 5],
    [0, 3, 7]
  ];
  const TEXTES_NIVEAUX = [
    'questions faciles',
    'surtout des questions faciles, quelques-unes moyennes',
    'questions faciles et moyennes',
    'surtout des questions moyennes, deux difficiles',
    'questions moyennes et difficiles',
    'surtout des questions difficiles'
  ];

  function injecterStyle() {
    if (document.getElementById('style-quiz')) return;
    document.head.append(el('style', { id: 'style-quiz' }, `
      .quiz-categorie { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.3rem 1rem; border-radius: 2rem;
        border: 2px solid var(--accent); background: var(--accent-clair); font-weight: 700; margin: 0; }
      .quiz-categorie .icone { font-size: 1.5rem; line-height: 1; }
      .quiz-question { font-size: 1.4rem; }
      .quiz-anecdote { width: 100%; max-width: 44rem; margin: 0; }
      .quiz-anecdote p:last-child { margin-bottom: 0; }
      .quiz-anecdote .photo-creditee { margin-bottom: 0.8rem; }
      .btn-choix.quiz-retire { text-decoration: line-through; }
    `));
  }

  function categorie(id) {
    const c = (JS.Donnees.quizCategories || {})[id];
    return c || { nom: id, icone: '❓' };
  }

  /* ---------- Mémoire des questions posées au joueur ---------- */

  const cle = q => (q.item ? 'j:' + q.item.sujet : 'q:' + q.question);

  function recents(profil) {
    if (!Array.isArray(profil.quizRecents)) profil.quizRecents = [];
    return profil.quizRecents;
  }

  function memoriser(profil, questions) {
    // L'année d'une question « En 1965, vous aviez… » est aussi retenue, pour ne pas reposer le même énoncé.
    const deja = new Set(questions.map(cle).concat(questions.filter(q => q.cleAnnee).map(q => q.cleAnnee)));
    profil.quizRecents = recents(profil).filter(c => !deja.has(c)).concat([...deja]).slice(-MEMOIRE);
    JS.Stockage.sauver();
  }

  /** 0 si jamais vue récemment ; sinon d'autant plus grand que la question est récente. */
  function fraicheur(profil) {
    const rang = new Map(recents(profil).map((c, i) => [c, i + 1]));
    return q => rang.get(cle(q)) || 0;
  }

  /** Choisit les questions : difficultés du niveau, pas vues récemment, catégories aussi variées que possible. */
  function choisirQuestions(niveau, profil) {
    const quotas = NIVEAUX[niveau - 1].slice();
    const toutes = JS.Donnees.quiz;
    const choisies = [];
    const parCategorie = {};
    const recence = fraicheur(profil);

    function prendre(difficulte, nombre) {
      const pool = JS.UI.melanger(toutes.filter(q => q.difficulte === difficulte && !choisies.includes(q)));
      let pris = 0;
      while (pris < nombre && pool.length) {
        // D'abord les questions pas vues récemment (sinon les plus anciennes),
        // puis celle dont la catégorie a été la moins utilisée jusqu'ici.
        pool.sort((a, b) => (recence(a) - recence(b))
          || ((parCategorie[a.categorie] || 0) - (parCategorie[b.categorie] || 0)));
        const q = pool.shift();
        choisies.push(q);
        parCategorie[q.categorie] = (parCategorie[q.categorie] || 0) + 1;
        pris++;
      }
      return nombre - pris;   // reste à trouver ailleurs
    }

    quotas.forEach((nombre, i) => {
      const manque = prendre(i + 1, nombre);
      // S'il manque des questions, on prend dans la difficulté voisine.
      if (manque > 0) {
        const voisine = i === 2 ? 2 : i + 2;
        const encore = prendre(voisine, manque);
        if (encore > 0) prendre(i === 0 ? 3 : 1, encore);
      }
    });
    // Difficulté croissante au fil de la partie ; on évite deux catégories identiques à la suite.
    const triees = choisies.sort((a, b) => a.difficulte - b.difficulte);
    for (let i = 1; i < triees.length; i++) {
      if (triees[i].categorie !== triees[i - 1].categorie) continue;
      const j = triees.findIndex((q, k) => k > i && q.difficulte === triees[i].difficulte
        && q.categorie !== triees[i - 1].categorie);
      if (j > 0) [triees[i], triees[j]] = [triees[j], triees[i]];
    }
    return triees.slice(0, PAR_PARTIE);
  }

  /**
   * Questions personnalisées selon l'année de naissance, tirées des repères datés (js/data/epoque.js).
   * On privilégie les années où le joueur avait entre 10 et 35 ans : ce sont souvent les souvenirs les plus vifs.
   * Deux formes : « En 1965, vous aviez 20 ans : qu'est-ce qui date de cette année-là ? »
   * et « Le TGV : quel âge aviez-vous l'année de son apparition ? ».
   */
  function questionsJeunesse(nombre, niveau, profil) {
    const naissance = JS.Epoque.anneeNaissance();
    if (!naissance || !JS.Donnees.epoque) return [];
    const ecart = Math.max(2, 8 - niveau);   // années minimales entre la bonne réponse et les leurres
    const items = JS.Donnees.epoque;
    const vus = new Set();
    const dejaPosees = new Set(recents(profil));
    const nouveau = i => !dejaPosees.has('j:' + i.sujet);
    const dansLaFleurDeLAge = i => i.annee - naissance >= 10 && i.annee - naissance <= 35;
    const plusTard = i => i.annee - naissance > 35;
    // Ordre : jeunesse jamais posée, plus tard jamais posé, puis le reste.
    const candidats = [
      items.filter(i => dansLaFleurDeLAge(i) && nouveau(i)),
      items.filter(i => plusTard(i) && nouveau(i)),
      items.filter(i => dansLaFleurDeLAge(i) && !nouveau(i)),
      items.filter(i => plusTard(i) && !nouveau(i))
    ].map(JS.UI.melanger).flat();
    const resultat = [];

    // Deux passages : le premier évite les années déjà proposées récemment sous la forme « En 1965… ».
    for (const passage of [1, 2]) for (const item of candidats) {
      if (resultat.length >= nombre) break;
      if (vus.has(item.annee) || resultat.some(r => r.item === item)) continue;
      const age = item.annee - naissance;
      const formeAnnee = resultat.length % 2 === 0;
      if (formeAnnee && passage === 1 && dejaPosees.has('a:' + item.annee)) continue;
      if (formeAnnee) {
        const leurres = [];
        JS.UI.melanger(items).forEach(i => {
          if (leurres.length < 3 && Math.abs(i.annee - item.annee) >= ecart
            && leurres.every(l => l.annee !== i.annee)) leurres.push(i);
        });
        if (leurres.length < 3) continue;
        resultat.push({
          item,
          cleAnnee: 'a:' + item.annee,
          categorie: 'jeunesse',
          difficulte: 1,
          question: 'En ' + item.annee + ', vous aviez ' + age + ' ans. Lequel de ces souvenirs date de cette année-là ?',
          choix: [item].concat(leurres).map(JS.Epoque.titre),
          bonne: 0,
          anecdote: item.detail + ' Les autres propositions datent de ' + leurres.map(l => l.annee).sort((a, b) => a - b).join(', ') + '.'
        });
      } else {
        const pas = Math.max(2, 6 - Math.floor(niveau / 2));
        const ages = JS.UI.melanger([-2, -1, 1, 2].map(k => age + k * pas).filter(a => a > 0)).slice(0, 3);
        if (ages.length < 3) continue;
        resultat.push({
          item,
          categorie: 'jeunesse',
          difficulte: 1,
          question: JS.Epoque.titre(item) + ' : quel âge aviez-vous l\'année de ' + JS.Epoque.moment(item) + ' ?',
          choix: [age].concat(ages).map(a => a + ' ans'),
          bonne: 0,
          anecdote: 'C\'était en ' + item.annee + '. ' + item.detail
        });
      }
      vus.add(item.annee);
    }
    return resultat;
  }

  /** Photo illustrant la bonne réponse, en mode Photos seulement (null sinon). */
  function photoReponse(q) {
    if (!JS.Photos.actif()) return null;
    if (q.item) {
      const photo = (JS.Donnees.epoquePhotos || {})[q.item.sujet];
      return photo ? JS.Photos.figure(photo, JS.Epoque.titre(q.item)) : null;
    }
    const photo = q.illustration && (JS.Donnees.quizPhotos || {})[q.illustration];
    if (!photo) return null;
    // « Camembert (fromage) » → « Camembert » ; un nom scientifique (« Mustela erminea ») → la réponse (« L'hermine »).
    const titre = q.illustration.replace(/\s*\(.*\)\s*$/, '');
    const legende = /^[A-Z][a-z]+ [a-z]+$/.test(titre) ? q.choix[q.bonne] : titre;
    return JS.Photos.figure(photo, legende, photo.montre || legende);
  }

  JS.Jeux.register({
    id: 'quiz',
    nom: 'Quiz souvenirs et culture',
    categorie: 'auditive',
    icone: '🎓',
    description: 'Chansons, cinéma, histoire, terroir… Des questions pour raviver les souvenirs.',
    consigne: 'Dix questions vous sont posées, sur des thèmes variés : chansons, cinéma, histoire, géographie, cuisine, vie d\'autrefois, nature et sport. Touchez la réponse de votre choix. Après chaque question, la bonne réponse s\'affiche avec une petite anecdote. En cas d\'hésitation, le bouton « Retirer deux réponses » vous aide. Si votre année de naissance est indiquée dans les Réglages, quelques questions portent sur les années de votre jeunesse.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => PAR_PARTIE + ' questions, ' + TEXTES_NIVEAUX[n - 1],

    start(ctx) {
      injecterStyle();
      const questions = choisirQuestions(ctx.niveau, ctx.profil);
      // Trois questions « Souvenirs de jeunesse » remplacent les questions 3, 6 et 9.
      questionsJeunesse(3, ctx.niveau, ctx.profil).forEach((q, i) => questions.splice(2 + i * 3, 1, q));
      memoriser(ctx.profil, questions);
      let index = -1;
      let points = 0;
      let bonnes = 0;
      let aides = 0;

      questionSuivante();

      function lire(q, propositions) {
        return q.question + ' ' + propositions.map((p, i) => 'Réponse ' + (i + 1) + ' : ' + p + '.').join(' ');
      }

      function questionSuivante() {
        index++;
        if (index >= questions.length) {
          finir();
          return;
        }
        const q = questions[index];
        const cat = categorie(q.categorie);
        const bonneReponse = q.choix[q.bonne];
        const propositions = JS.UI.melanger(q.choix);
        const etat = { fini: false, aide: false };

        ctx.root.innerHTML = '';
        ctx.message('', 'info');

        const boutons = propositions.map(texte => el('button', {
          class: 'btn btn-choix',
          onclick: () => repondre(texte)
        }, texte));
        const boutonAide = el('button', { class: 'btn', onclick: retirerDeux }, '💡 Retirer deux réponses');
        const boutonEcouter = JS.Audio.voixDisponible()
          ? JS.UI.boutonLecture(() => lire(q, propositions), 'Écouter la question')
          : null;
        const suite = el('div', { class: 'zone-jeu' });

        ctx.root.append(
          el('p', { class: 'compteur' }, 'Question ' + (index + 1) + ' sur ' + questions.length),
          el('p', { class: 'quiz-categorie' }, el('span', { class: 'icone', 'aria-hidden': 'true' }, cat.icone), cat.nom),
          el('h2', { class: 'enonce quiz-question' }, q.question),
          el('div', { class: 'choix', role: 'group', 'aria-label': 'Réponses possibles' }, boutons),
          el('div', { class: 'ligne-boutons centre' }, boutonAide, boutonEcouter),
          suite
        );
        JS.Audio.parler(lire(q, propositions));

        function retirerDeux() {
          if (!ctx.actif() || etat.fini || etat.aide) return;
          etat.aide = true;
          aides++;
          boutonAide.disabled = true;
          const fausses = JS.UI.melanger(boutons.filter(b => b.textContent !== bonneReponse)).slice(0, 2);
          fausses.forEach(b => {
            b.disabled = true;
            b.classList.add('quiz-retire');
            b.setAttribute('aria-label', b.textContent + ' (réponse retirée)');
          });
          ctx.message('Deux mauvaises réponses ont été retirées. Il en reste deux.', 'info');
        }

        function repondre(texte) {
          if (!ctx.actif() || etat.fini) return;
          etat.fini = true;
          JS.Audio.taire();
          boutonAide.disabled = true;
          const bon = texte === bonneReponse;
          boutons.forEach(b => {
            const t = b.textContent;
            b.disabled = true;
            b.removeAttribute('aria-label');
            if (t === bonneReponse) {
              b.classList.add('correct');
              b.textContent = '✓ ' + t;
            } else if (t === texte) {
              b.classList.add('incorrect');
              b.textContent = '✗ ' + t;
            }
          });
          if (bon) {
            points += etat.aide ? 0.5 : 1;
            bonnes++;
            ctx.audio.succes();
            ctx.message(JS.UI.choisir(['Bravo, bonne réponse !', 'Exactement !', 'Très bien, c\'est juste !']), 'succes');
          } else {
            ctx.audio.erreur();
            ctx.message('Ce n\'était pas cette réponse, mais vous allez l\'apprendre maintenant !', 'info');
          }
          const dernier = index + 1 >= questions.length;
          const bouton = el('button', { class: 'btn btn-primaire btn-grand', onclick: questionSuivante },
            dernier ? 'Voir le bilan ▶' : 'Question suivante ▶');
          suite.append(
            el('section', { class: 'panneau quiz-anecdote', 'aria-live': 'polite' },
              photoReponse(q),
              el('p', null, el('strong', null, 'Bonne réponse : '), bonneReponse),
              q.anecdote ? el('p', null, el('span', { 'aria-hidden': 'true' }, '💬 '), q.anecdote) : null
            ),
            el('div', { class: 'ligne-boutons centre' }, bouton)
          );
          JS.Audio.parler('Bonne réponse : ' + bonneReponse + '. ' + (q.anecdote || ''));
          bouton.focus();
        }
      }

      function finir() {
        const reussite = questions.length ? points / questions.length : 0;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: JS.UI.pluriel(bonnes, 'bonne réponse', 'bonnes réponses') + ' sur ' + questions.length
            + (aides ? ' (aide utilisée ' + aides + ' fois)' : '') + '.'
        });
      }
    }
  });
})();
