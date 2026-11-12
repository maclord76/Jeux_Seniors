/* Mot mélangé (anagramme) : remettre dans l'ordre les lettres d'un mot, avec l'aide de son thème. */
(function () {
  'use strict';
  const { el } = JS.UI;

  const MOTS_PAR_PARTIE = 6;

  // [longueur minimale, longueur maximale, première lettre déjà placée]
  const NIVEAUX = [
    [4, 4, true],
    [4, 5, false],
    [5, 6, false],
    [6, 7, false],
    [7, 8, false],
    [8, 9, false]
  ];

  function injecterStyle() {
    if (document.getElementById('style-anagramme')) return;
    document.head.append(el('style', { id: 'style-anagramme' }, `
      .ana-theme { font-size: 1.15rem; font-weight: 700; text-align: center; margin: 0; }
      .ana-reponse .lettre { cursor: default; }
      .ana-reponse .lettre.ana-fixe { background: var(--primaire-clair); border-color: var(--primaire); }
      .ana-reponse.ana-correct .lettre { background: var(--succes-clair); border-color: var(--succes); border-style: solid; }
      .ana-reponse.ana-incorrect .lettre { background: var(--attention-clair); border-color: var(--attention); }
      .ana-pioche { margin-top: 0.5rem; }
      .ana-pioche .lettre { width: 3.8rem; height: 3.8rem; }
      .ana-solution { font-size: 1.15rem; text-align: center; }
    `));
  }

  /** Tous les mots utilisables, avec leur thème. */
  function tousLesMots() {
    const liste = [];
    Object.entries(JS.Donnees.mots).forEach(([id, theme]) => {
      theme.mots.forEach(mot => liste.push({ mot, grille: JS.Donnees.motEnGrille(mot), theme }));
    });
    return liste;
  }

  /** Choisit les mots de la partie : longueur du niveau, thèmes variés autant que possible. */
  function choisirMots(niveau) {
    const [min, max] = NIVEAUX[niveau - 1];
    const candidats = JS.UI.melanger(tousLesMots().filter(m => m.grille.length >= min && m.grille.length <= max
      && new Set(m.grille).size > 1));
    const choisis = [];
    const dejaVus = new Set();
    // Premier passage : un mot par thème ; second passage : on complète si besoin.
    for (const passe of [true, false]) {
      for (const c of candidats) {
        if (choisis.length >= MOTS_PAR_PARTIE) break;
        if (dejaVus.has(c.grille)) continue;
        if (passe && choisis.some(x => x.theme === c.theme)) continue;
        choisis.push(c);
        dejaVus.add(c.grille);
      }
    }
    return choisis;
  }

  /** Mélange les lettres en s'assurant que le résultat diffère du mot. */
  function melangerLettres(mot) {
    let lettres = mot.split('');
    for (let i = 0; i < 30; i++) {
      lettres = JS.UI.melanger(lettres);
      if (lettres.join('') !== mot) break;
    }
    return lettres;
  }

  JS.Jeux.register({
    id: 'anagramme',
    nom: 'Mot mélangé',
    categorie: 'mots',
    icone: '🔀',
    description: 'Remettez les lettres dans l\'ordre pour retrouver le mot caché.',
    consigne: 'Les lettres d\'un mot ont été mélangées. Le thème du mot vous aide. Touchez les lettres dans le bon ordre pour reformer le mot. Vous pouvez effacer la dernière lettre ou tout recommencer. Le bouton « Indice » place la lettre suivante pour vous, et vous pouvez passer un mot trop difficile.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const [min, max, aide] = NIVEAUX[n - 1];
      return MOTS_PAR_PARTIE + ' mots de ' + (min === max ? min : min + ' ou ' + max) + ' lettres'
        + (aide ? ', la première lettre est déjà placée' : '');
    },

    start(ctx) {
      injecterStyle();
      const [, , premiereDonnee] = NIVEAUX[ctx.niveau - 1];
      const mots = choisirMots(ctx.niveau);
      const dictionnaire = new Set(tousLesMots().map(m => m.grille));
      let index = -1;
      let points = 0;
      let trouves = 0;
      let avecIndice = 0;
      let courant = null;

      const zone = el('div', { class: 'zone-jeu' });
      ctx.root.append(zone);

      /* Clavier : taper une lettre la place, Retour arrière efface. */
      function clavier(e) {
        if (!courant || courant.fini || e.ctrlKey || e.altKey || e.metaKey) return;
        if (document.querySelector('dialog[open]')) return;
        const cible = e.target;
        if (cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA')) return;
        if (e.key === 'Backspace') {
          e.preventDefault();
          effacer();
          return;
        }
        if (e.key.length === 1) {
          const lettre = JS.Donnees.motEnGrille(e.key);
          if (!lettre) return;
          const tuile = courant.pioche.find(t => !t.utilisee && t.lettre === lettre);
          if (tuile) {
            e.preventDefault();
            poser(tuile);
          }
        }
      }
      document.addEventListener('keydown', clavier);

      motSuivant();

      function motSuivant() {
        index++;
        if (index >= mots.length) {
          finir();
          return;
        }
        const m = mots[index];
        courant = {
          m,
          cible: m.grille,
          pioche: melangerLettres(m.grille).map((lettre, i) => ({ lettre, i, utilisee: false })),
          places: [],     // tuiles posées, dans l'ordre
          fixes: 0,       // nombre de lettres verrouillées (placées par indice ou d'office)
          indices: 0,
          fini: false
        };
        afficher();
        if (premiereDonnee) {
          const t = courant.pioche.find(x => x.lettre === courant.cible[0]);
          poser(t, true);
        }
        ctx.message('Touchez les lettres dans le bon ordre.', 'info');
      }

      function afficher() {
        const c = courant;
        zone.innerHTML = '';
        c.cases = c.cible.split('').map(() => el('span', { class: 'lettre vide', 'aria-hidden': 'true' }, ''));
        c.reponse = el('div', { class: 'lettres ana-reponse', role: 'img', 'aria-label': 'Mot en cours, vide' }, c.cases);
        c.pioche.forEach(t => {
          t.bouton = el('button', {
            class: 'lettre',
            'aria-label': 'Lettre ' + t.lettre,
            onclick: () => poser(t)
          }, t.lettre);
        });
        c.boutonEffacer = el('button', { class: 'btn', onclick: effacer }, '⌫ Effacer la dernière lettre');
        c.boutonTout = el('button', { class: 'btn', onclick: toutEffacer }, 'Tout effacer');
        c.boutonIndice = el('button', { class: 'btn', onclick: indice }, '💡 Indice');
        c.boutonPasser = el('button', { class: 'btn btn-discret', onclick: passer }, 'Passer ce mot');
        c.suite = el('div', { class: 'ligne-boutons centre' });

        zone.append(
          el('p', { class: 'compteur' }, 'Mot ' + (index + 1) + ' sur ' + mots.length),
          el('p', { class: 'ana-theme' }, el('span', { 'aria-hidden': 'true' }, c.m.theme.icone + ' '),
            'Thème : ' + c.m.theme.nom + ' — ' + c.cible.length + ' lettres'),
          c.reponse,
          el('div', { class: 'lettres ana-pioche', role: 'group', 'aria-label': 'Lettres mélangées' }, c.pioche.map(t => t.bouton)),
          el('div', { class: 'ligne-boutons centre' }, c.boutonEffacer, c.boutonTout, c.boutonIndice, c.boutonPasser),
          c.suite
        );
      }

      function majReponse() {
        const c = courant;
        c.cases.forEach((caseLettre, i) => {
          const t = c.places[i];
          caseLettre.textContent = t ? t.lettre : '';
          caseLettre.classList.toggle('vide', !t);
          caseLettre.classList.toggle('ana-fixe', i < c.fixes);
        });
        const texte = c.places.map(t => t.lettre).join('');
        c.reponse.setAttribute('aria-label', texte ? 'Mot en cours : ' + texte.split('').join(' ') : 'Mot en cours, vide');
        c.reponse.classList.remove('ana-incorrect');
      }

      function poser(tuile, fixe) {
        const c = courant;
        if (!ctx.actif() || c.fini || !tuile || tuile.utilisee) return;
        if (!fixe) ctx.audio.clic();
        tuile.utilisee = true;
        tuile.bouton.disabled = true;
        c.places.push(tuile);
        if (fixe) c.fixes = c.places.length;
        majReponse();
        if (c.places.length === c.cible.length) verifier();
      }

      function retirer() {
        const c = courant;
        const t = c.places.pop();
        t.utilisee = false;
        t.bouton.disabled = false;
      }

      function effacer() {
        const c = courant;
        if (!ctx.actif() || c.fini) return;
        if (c.places.length <= c.fixes) return;
        retirer();
        majReponse();
      }

      function toutEffacer() {
        const c = courant;
        if (!ctx.actif() || c.fini) return;
        while (c.places.length > c.fixes) retirer();
        majReponse();
        ctx.message('C\'est reparti : touchez les lettres dans le bon ordre.', 'info');
      }

      function verifier() {
        const c = courant;
        const texte = c.places.map(t => t.lettre).join('');
        if (texte === c.cible) {
          reussir();
          return;
        }
        ctx.audio.erreur();
        c.reponse.classList.add('ana-incorrect');
        if (dictionnaire.has(texte)) {
          ctx.message('« ' + texte + ' » est bien un mot, mais ce n\'est pas celui du thème « ' + c.m.theme.nom + ' ». Essayez encore !', 'info');
        } else {
          ctx.message('Pas tout à fait… Effacez quelques lettres et réessayez, ou demandez un indice.', 'erreur');
        }
      }

      function indice() {
        const c = courant;
        if (!ctx.actif() || c.fini) return;
        // On garde le début correct, on retire le reste, puis on pose la bonne lettre suivante.
        let bon = 0;
        while (bon < c.places.length && c.places[bon].lettre === c.cible[bon]) bon++;
        while (c.places.length > bon) retirer();
        const suivante = c.pioche.find(t => !t.utilisee && t.lettre === c.cible[bon]);
        c.indices++;
        ctx.message('Voici une lettre de plus. Continuez !', 'info');
        poser(suivante, true);
      }

      /** Fin du mot : enchaînement automatique après une bonne réponse, bouton sinon. */
      function terminerMot(automatique) {
        const c = courant;
        c.fini = true;
        [c.boutonEffacer, c.boutonTout, c.boutonIndice, c.boutonPasser].forEach(b => { b.disabled = true; });
        c.pioche.forEach(t => { t.bouton.disabled = true; });
        if (automatique) {
          ctx.enchainer(motSuivant);
          return;
        }
        const bouton = el('button', { class: 'btn btn-primaire btn-grand', onclick: motSuivant },
          index + 1 < mots.length ? 'Mot suivant ▶' : 'Voir le bilan ▶');
        c.suite.append(bouton);
        bouton.focus();
      }

      function reussir() {
        const c = courant;
        trouves++;
        if (c.indices) avecIndice++;
        points += Math.max(0.3, 1 - 0.2 * c.indices);
        ctx.audio.succes();
        c.reponse.classList.add('ana-correct');
        c.reponse.setAttribute('aria-label', 'Mot trouvé : ' + c.m.mot);
        c.suite.append(el('p', { class: 'ana-solution' }, 'Le mot était : ', el('strong', null, c.m.mot)));
        ctx.message(c.indices ? 'Bravo, c\'est trouvé !' : 'Bravo, vous avez trouvé tout seul !', 'succes');
        terminerMot(true);
      }

      function passer() {
        const c = courant;
        if (!ctx.actif() || c.fini) return;
        // On montre la réponse dans les cases.
        c.places.forEach(t => { t.utilisee = false; });
        c.places = c.cible.split('').map(lettre => {
          const t = c.pioche.find(x => !x.utilisee && x.lettre === lettre);
          t.utilisee = true;
          return t;
        });
        c.fixes = 0;
        majReponse();
        c.cases.forEach(caseLettre => caseLettre.classList.add('ana-fixe'));
        c.reponse.setAttribute('aria-label', 'Réponse : ' + c.m.mot);
        c.suite.append(el('p', { class: 'ana-solution' }, 'Le mot était : ', el('strong', null, c.m.mot)));
        ctx.message('Ce n\'était pas facile ! Voici la réponse.', 'info');
        terminerMot();
      }

      function finir() {
        courant = null;
        const reussite = mots.length ? points / mots.length : 0;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: JS.UI.pluriel(trouves, 'mot trouvé', 'mots trouvés') + ' sur ' + mots.length
            + (avecIndice ? ' (dont ' + avecIndice + ' avec un indice)' : '') + '.'
        });
      }

      return () => document.removeEventListener('keydown', clavier);
    }
  });
})();
