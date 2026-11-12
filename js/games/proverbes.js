/* Proverbe à compléter : retrouver le ou les mots manquants d'un proverbe ou d'une expression. */
(function () {
  'use strict';
  const { el } = JS.UI;

  const PAR_PARTIE = 8;
  const TROU = '___';

  /**
   * diff : difficultés privilégiées ; mode : 'choix' (boutons) ou 'saisie' (écrire le mot) ;
   * choix : nombre de propositions (en saisie : celles montrées par « Je ne sais pas ») ;
   * mots : nombre de mots cachés ; aide : indice affiché d'emblée en saisie.
   */
  const NIVEAUX = [
    { diff: [1], mode: 'choix', choix: 2, mots: 1 },
    { diff: [1, 2], mode: 'choix', choix: 2, mots: 1 },
    { diff: [2], mode: 'choix', choix: 4, mots: 1 },
    { diff: [2, 3], mode: 'choix', choix: 4, mots: 1 },
    { diff: [1, 2], mode: 'saisie', choix: 4, mots: 1, aide: 'initiale' },  // première lettre et nombre de lettres
    { diff: [2, 3], mode: 'saisie', choix: 4, mots: 1, aide: 'longueur' },  // nombre de lettres seulement
    { diff: [1], mode: 'choix', choix: 4, mots: 2 },
    { diff: [1, 2], mode: 'choix', choix: 4, mots: 2 },
    { diff: [1, 2], mode: 'choix', choix: 6, mots: 2 },
    { diff: [2, 3], mode: 'choix', choix: 6, mots: 2 },
    { diff: [1, 2], mode: 'saisie', choix: 4, mots: 2, aide: 'longueur' },
    { diff: [2, 3], mode: 'saisie', choix: 4, mots: 2 }
  ];

  function injecterStyle() {
    if (document.getElementById('style-proverbes')) return;
    document.head.append(el('style', { id: 'style-proverbes' }, `
      .prov-texte { font-size: 1.6rem; font-weight: 700; text-align: center; line-height: 1.6; max-width: 44rem; margin: 0; }
      .prov-trou { display: inline-block; min-width: 4rem; border: 0; border-bottom: 0.2rem dashed var(--primaire);
        border-radius: 0; padding: 0 0.2rem; background: none; color: var(--primaire); font: inherit; }
      button.prov-trou:not([disabled]) { cursor: pointer; text-decoration: underline; text-decoration-style: dotted; }
      .prov-trou.prov-trou-actif { background: var(--primaire-clair); border-bottom-style: solid; border-radius: 0.3rem 0.3rem 0 0; }
      .prov-trou.prov-trou-faux { color: var(--attention); border-bottom-color: var(--attention); }
      .prov-trou[disabled] { opacity: 1; }
      .prov-complet { text-align: center; max-width: 44rem; width: 100%; }
      .prov-complet p { font-size: 1.3rem; font-weight: 700; margin: 0; }
      .prov-saisie { display: flex; flex-wrap: wrap; gap: 0.7rem; justify-content: center; align-items: center; width: 100%; }
      .prov-saisie .saisie { max-width: 18rem; font-size: 1.3rem; }
      .prov-saisie label { font-weight: 600; min-width: 4.5rem; text-align: right; }
      .prov-champs { display: flex; flex-direction: column; gap: 0.6rem; align-items: center; width: 100%; }
      .prov-aide { text-align: center; color: var(--texte-doux); margin: 0; }
      .btn-choix[aria-pressed="true"] { background: var(--primaire-clair); border-style: dashed; }
      @media (max-width: 640px) { .prov-texte { font-size: 1.3rem; } }
    `));
  }

  /** Normalisation tolérante : sans accents, sans ponctuation, « œ » → « oe ». */
  function simplifier(texte) {
    return JS.UI.normaliser(String(texte).replace(/œ/gi, 'oe').replace(/æ/gi, 'ae'))
      .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /** Distance d'édition (Levenshtein), pour accepter une petite faute de frappe. */
  function distance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[a.length][b.length];
  }

  function reponseAcceptee(saisie, attendu) {
    const s = simplifier(saisie), r = simplifier(attendu);
    if (!s) return false;
    if (s === r) return true;
    const tolerance = r.length >= 8 ? 2 : r.length >= 4 ? 1 : 0;
    return distance(s, r) <= tolerance;
  }

  /**
   * Découpe le proverbe en morceaux de texte et en trous, dans l'ordre de lecture.
   * Avec deux mots, le second mot caché est repéré dans le texte (mot entier).
   */
  function decouper(p, mots) {
    const [avant, apres] = p.texte.split(TROU);
    const morceaux = [avant, { reponse: p.reponse, leurres: p.leurres }, apres];
    if (mots < 2 || !p.second) return morceaux;
    const motif = new RegExp('(?<![\\p{L}])' + p.second.mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}])', 'u');
    for (const k of [0, 2]) {
      const m = morceaux[k].match(motif);
      if (!m) continue;
      morceaux.splice(k, 1, morceaux[k].slice(0, m.index), { reponse: p.second.mot, leurres: p.second.leurres },
        morceaux[k].slice(m.index + p.second.mot.length));
      break;
    }
    return morceaux;
  }

  function choisirProverbes(niveau) {
    const { diff: difficultes, mots } = NIVEAUX[niveau - 1];
    const tous = JS.UI.melanger(JS.Donnees.proverbes.filter(p => mots < 2 || p.second));
    const choisis = [];
    // On prend d'abord la difficulté principale, puis les suivantes, puis n'importe lesquels.
    const ordre = difficultes.concat([1, 2, 3].filter(d => !difficultes.includes(d)));
    const quotaPrincipal = difficultes.length > 1 ? Math.ceil(PAR_PARTIE / 2) : PAR_PARTIE;
    ordre.forEach((d, rang) => {
      const quota = rang === 0 ? quotaPrincipal : PAR_PARTIE;
      tous.filter(p => p.difficulte === d && !choisis.includes(p)).forEach(p => {
        if (choisis.length < PAR_PARTIE && choisis.filter(x => x.difficulte === d).length < quota) choisis.push(p);
      });
    });
    return JS.UI.melanger(choisis);
  }

  const ordinal = (i, n) => n < 2 ? 'le mot' : (i === 0 ? 'le premier mot' : 'le second mot');

  JS.Jeux.register({
    id: 'proverbes',
    nom: 'Proverbe à compléter',
    categorie: 'mots',
    icone: '💬',
    description: 'Retrouvez les mots qui manquent dans des proverbes et expressions bien connus.',
    consigne: 'Des mots manquent dans chaque proverbe. Aux premiers niveaux, touchez la bonne réponse parmi deux, puis quatre propositions ; ensuite, écrivez le mot vous-même. Aux niveaux suivants, deux mots sont cachés : touchez-les dans l\'ordre du proverbe (touchez un mot placé pour le retirer), puis écrivez-les vous-même. Les accents et les petites fautes de frappe sont acceptés. Si un mot ne vous revient pas, touchez « Je ne sais pas » pour voir des propositions.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const { diff, mode, aide, choix, mots } = NIVEAUX[n - 1];
      const facilite = { 1: 'très connus', 2: 'connus', 3: 'moins courants' };
      const texte = PAR_PARTIE + ' proverbes ' + diff.map(d => facilite[d]).join(' et ');
      const quoi = mots > 1 ? ', deux mots ' : ', un mot ';
      if (mode === 'choix') return texte + quoi + 'à retrouver parmi ' + choix + ' propositions';
      return texte + quoi + 'à écrire soi-même' + (aide === 'initiale' ? ' (première lettre donnée)' : aide === 'longueur' ? ' (nombre de lettres donné)' : '');
    },
    logique: { decouper, NIVEAUX },

    start(ctx) {
      injecterStyle();
      const config = NIVEAUX[ctx.niveau - 1];
      const { mode, aide } = config;
      const proverbes = choisirProverbes(ctx.niveau);
      let index = -1;
      let points = 0;
      let bonnes = 0;

      motSuivant();

      function texteComplet(p) {
        return p.texte.replace(TROU, p.reponse);
      }

      function motSuivant() {
        index++;
        if (index >= proverbes.length) {
          finir();
          return;
        }
        const p = proverbes[index];
        const etat = { p, fini: false, essais: 0, indice: false, voirChoix: false };
        ctx.root.innerHTML = '';
        ctx.message('', 'info');

        const morceaux = decouper(p, config.mots);
        etat.trous = morceaux.filter(m => typeof m === 'object').map((m, i, liste) => {
          const trou = { reponse: m.reponse, leurres: m.leurres, trouve: false, choisi: null, retirer: null };
          // Avec deux trous, chaque trou est un bouton : le toucher retire le mot qu'on y a placé.
          trou.el = liste.length > 1
            ? el('button', { type: 'button', class: 'prov-trou', disabled: true,
              'aria-label': (i === 0 ? 'premier' : 'second') + ' mot manquant', onclick: () => trou.retirer && trou.retirer() }, '…')
            : el('span', { class: 'prov-trou', 'aria-label': 'mot manquant' }, '…');
          return trou;
        });
        let n = 0;
        const phrase = morceaux.map(m => (typeof m === 'object' ? etat.trous[n++].el : m));
        etat.zoneReponse = el('div', { class: 'zone-jeu' });
        etat.suite = el('div', { class: 'ligne-boutons centre' });

        ctx.root.append(
          el('p', { class: 'compteur' }, 'Proverbe ' + (index + 1) + ' sur ' + proverbes.length),
          el('p', { class: 'prov-texte' }, phrase),
          etat.zoneReponse,
          etat.suite
        );

        if (mode === 'choix') afficherChoix(etat, 1);
        else afficherSaisie(etat);
      }

      /** Propositions : les bonnes réponses des trous restants, complétées de leurres répartis entre eux. */
      function propositionsPour(restants) {
        let reste = Math.max(config.choix, restants.length * 2) - restants.length;
        const leurres = [];
        restants.forEach((t, i) => {
          const nb = Math.ceil(reste / (restants.length - i));
          leurres.push(...JS.UI.melanger(t.leurres).slice(0, nb));
          reste -= nb;
        });
        return JS.UI.melanger([...new Set(restants.map(t => t.reponse).concat(leurres))]);
      }

      /** Grands boutons. valeur : points accordés pour une question entièrement juste. */
      function afficherChoix(etat, valeur) {
        const restants = etat.trous.filter(t => !t.trouve);
        const propositions = propositionsPour(restants);
        etat.zoneReponse.innerHTML = '';
        if (restants.length === 1) {
          const boutons = propositions.map(texte => el('button', {
            class: 'btn btn-choix',
            onclick: () => repondreChoix(etat, restants[0], texte, boutons, valeur)
          }, texte));
          etat.zoneReponse.append(
            el('p', { class: 'enonce' }, etat.trous.length > 1 ? 'Quel mot manque encore ?' : 'Quel mot complète ce proverbe ?'),
            el('div', { class: 'choix' }, boutons)
          );
          return;
        }
        afficherChoixPlusieurs(etat, restants, propositions, valeur);
      }

      function repondreChoix(etat, trou, texte, boutons, valeur) {
        if (!ctx.actif() || etat.fini) return;
        const bon = texte === trou.reponse;
        boutons.forEach(b => {
          b.disabled = true;
          if (b.textContent === trou.reponse) {
            b.classList.add('correct');
            b.textContent = '✓ ' + b.textContent;
          } else if (b.textContent === texte) {
            b.classList.add('incorrect');
            b.textContent = '✗ ' + b.textContent;
          }
        });
        trou.el.textContent = trou.reponse;
        if (bon) {
          trou.trouve = true;
          points += valeur / etat.trous.length;
          if (etat.trous.every(t => t.trouve)) bonnes++;
          ctx.audio.succes();
          ctx.message('Bravo, c\'est bien « ' + trou.reponse + ' » !', 'succes');
        } else {
          trou.el.classList.add('prov-trou-faux');
          ctx.audio.erreur();
          ctx.message('Ce n\'était pas celui-là. La bonne réponse est « ' + trou.reponse + ' ».', 'info');
        }
        terminerQuestion(etat, bon);
      }

      /** Plusieurs trous : chaque mot touché remplit le trou en surbrillance ; on valide une fois tout rempli. */
      function afficherChoixPlusieurs(etat, restants, propositions, valeur) {
        const valider = el('button', { class: 'btn btn-primaire btn-grand', disabled: true, onclick: () => verifier() }, 'Valider mes mots');
        const boutons = propositions.map(texte => {
          const b = el('button', { class: 'btn btn-choix', 'aria-pressed': 'false', onclick: () => placer(texte, b) }, texte);
          return b;
        });
        restants.forEach(t => {
          t.choisi = null;
          t.bouton = null;
          t.retirer = () => retirer(t);
        });
        etat.zoneReponse.append(
          el('p', { class: 'enonce' }, 'Touchez les mots dans l\'ordre du proverbe.'),
          el('p', { class: 'prov-aide' }, 'Pour changer un mot déjà placé, touchez-le dans le proverbe.'),
          el('div', { class: 'choix' }, boutons),
          el('div', { class: 'ligne-boutons centre' }, valider)
        );
        maj();

        function maj() {
          const actif = restants.find(t => !t.choisi);
          restants.forEach(t => t.el.classList.toggle('prov-trou-actif', t === actif));
          valider.disabled = !!actif;
        }
        function placer(texte, b) {
          if (!ctx.actif() || etat.fini) return;
          const t = restants.find(x => !x.choisi);
          if (!t) { ctx.message('Les mots sont placés : touchez un mot du proverbe pour le retirer, ou validez.', 'info'); return; }
          t.choisi = texte;
          t.bouton = b;
          t.el.textContent = texte;
          t.el.disabled = false;
          b.disabled = true;
          b.setAttribute('aria-pressed', 'true');
          maj();
          if (!restants.some(x => !x.choisi)) valider.focus();
        }
        function retirer(t) {
          if (!ctx.actif() || etat.fini || !t.choisi) return;
          t.bouton.disabled = false;
          t.bouton.setAttribute('aria-pressed', 'false');
          t.choisi = null;
          t.bouton = null;
          t.el.textContent = '…';
          t.el.disabled = true;
          maj();
        }
        function verifier() {
          if (!ctx.actif() || etat.fini || restants.some(t => !t.choisi)) return;
          const choisis = restants.map(t => t.choisi);
          restants.forEach(t => {
            t.trouve = t.choisi === t.reponse;
            if (t.trouve) points += valeur / etat.trous.length;
            else t.el.classList.add('prov-trou-faux');
            t.el.textContent = t.reponse;
            t.el.disabled = true;
          });
          boutons.forEach(b => {
            const texte = b.textContent;
            b.disabled = true;
            b.removeAttribute('aria-pressed');
            if (restants.some(t => t.reponse === texte)) {
              b.classList.add('correct');
              b.textContent = '✓ ' + texte;
            } else if (choisis.includes(texte)) {
              b.classList.add('incorrect');
              b.textContent = '✗ ' + texte;
            }
          });
          valider.disabled = true;
          valider.hidden = true;
          const justes = restants.filter(t => t.trouve).length;
          const liste = restants.map(t => '« ' + t.reponse + ' »').join(' et ');
          const toutJuste = etat.trous.every(t => t.trouve);
          if (toutJuste) {
            bonnes++;
            ctx.audio.succes();
            ctx.message('Bravo, c\'est bien ' + liste + ' !', 'succes');
          } else {
            ctx.audio.erreur();
            ctx.message((justes ? 'Presque ! ' : '') + 'Il fallait ' + liste + '.', 'info');
          }
          terminerQuestion(etat, toutJuste);
        }
      }

      function texteIndice(trous, avecInitiale) {
        const longueur = t => JS.UI.pluriel(simplifier(t.reponse).replace(/ /g, '').length, 'lettre');
        const partie = (t, i) => (trous.length > 1 ? ordinal(i, trous.length) + ' ' : '') +
          (avecInitiale ? 'commence par « ' + t.reponse[0].toUpperCase() + ' » et compte ' : 'compte ') + longueur(t);
        if (trous.length === 1) return 'Indice : le mot ' + partie(trous[0], 0) + '.';
        return 'Indice : ' + trous.map(partie).join(' ; ') + '.';
      }

      function afficherSaisie(etat) {
        const plusieurs = etat.trous.length > 1;
        etat.trous.forEach((t, i) => {
          t.champ = el('input', {
            type: 'text',
            class: 'saisie',
            id: 'prov-saisie-' + i,
            autocomplete: 'off',
            autocapitalize: 'off',
            spellcheck: 'false',
            'aria-label': plusieurs ? (i === 0 ? 'Premier mot' : 'Second mot') : 'Votre réponse',
            onkeydown: e => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              const suivant = etat.trous.slice(i + 1).find(x => !x.champ.disabled && !x.champ.value.trim());
              if (suivant) suivant.champ.focus();
              else valider(etat);
            }
          });
        });
        etat.aide = el('p', { class: 'prov-aide', 'aria-live': 'polite' });
        if (aide) etat.aide.textContent = texteIndice(etat.trous, aide === 'initiale');

        const boutonValider = el('button', { class: 'btn btn-primaire', onclick: () => valider(etat) }, 'Valider');
        etat.boutonIndice = aide === 'initiale' ? null : el('button', { class: 'btn', onclick: () => donnerIndice(etat) }, '💡 Indice');
        // append natif : pas de tableau imbriqué (il serait converti en texte « [object …] »).
        etat.zoneReponse.append(...[
          plusieurs
            ? el('div', { class: 'prov-champs' },
              el('p', { class: 'enonce' }, 'Écrivez les deux mots manquants :'),
              etat.trous.map((t, i) => el('div', { class: 'prov-saisie' },
                el('label', { for: 'prov-saisie-' + i }, i === 0 ? '1er mot' : '2e mot'), t.champ)),
              boutonValider)
            : [
              el('label', { for: 'prov-saisie-0', class: 'enonce' }, 'Écrivez le mot manquant :'),
              el('div', { class: 'prov-saisie' }, etat.trous[0].champ, boutonValider)
            ],
          etat.aide,
          el('div', { class: 'ligne-boutons centre' },
            etat.boutonIndice,
            el('button', { class: 'btn btn-discret', onclick: () => jeNeSaisPas(etat) }, '🤔 Je ne sais pas')
          )
        ].flat());
        etat.trous[0].champ.focus();
      }

      function donnerIndice(etat) {
        if (etat.fini || etat.indice) return;
        etat.indice = true;
        etat.boutonIndice.disabled = true;
        etat.aide.textContent = texteIndice(etat.trous, true);
        const vide = etat.trous.find(t => !t.trouve);
        if (vide) vide.champ.focus();
      }

      function valider(etat) {
        if (!ctx.actif() || etat.fini || etat.voirChoix) return;
        const restants = etat.trous.filter(t => !t.trouve);
        const vide = restants.find(t => !t.champ.value.trim());
        if (vide) {
          ctx.message(etat.trous.length > 1 ? 'Écrivez les deux mots, ou touchez « Je ne sais pas ».' : 'Écrivez un mot, ou touchez « Je ne sais pas ».', 'info');
          vide.champ.focus();
          return;
        }
        let exact = true;
        const trouves = restants.filter(t => {
          if (!reponseAcceptee(t.champ.value, t.reponse)) return false;
          t.trouve = true;
          exact = exact && simplifier(t.champ.value) === simplifier(t.reponse);
          points += ((etat.essais === 0 ? 1 : 0.75) - (etat.indice ? 0.2 : 0)) / etat.trous.length;
          t.champ.disabled = true;
          t.champ.value = t.reponse;
          t.el.textContent = t.reponse;
          return true;
        });
        if (etat.trous.every(t => t.trouve)) {
          bonnes++;
          ctx.audio.succes();
          const ecrits = etat.trous.map(t => '« ' + t.reponse + ' »').join(' et ');
          ctx.message(exact ? 'Bravo, c\'est exact !' : 'Bravo ! On l\'écrit ' + ecrits + '.', 'succes');
          terminerQuestion(etat, true);
          return;
        }
        etat.essais++;
        ctx.audio.erreur();
        const faux = etat.trous.filter(t => !t.trouve);
        if (etat.essais >= 2) {
          ctx.message('Ce n\'est pas tout à fait ça. Voici quelques propositions pour vous aider.', 'info');
          jeNeSaisPas(etat, true);
        } else {
          ctx.message(trouves.length
            ? 'Le mot « ' + trouves[0].reponse + ' » est juste ! L\'autre n\'est pas encore le bon : essayez encore.'
            : 'Pas tout à fait… Essayez encore, ou touchez « Je ne sais pas ».', trouves.length ? 'info' : 'erreur');
          faux[0].champ.focus();
          faux[0].champ.select();
        }
      }

      function jeNeSaisPas(etat, automatique) {
        if (!ctx.actif() || etat.fini || etat.voirChoix) return;
        etat.voirChoix = true;
        if (!automatique) ctx.message('Pas de souci ! Choisissez parmi ces propositions.', 'info');
        afficherChoix(etat, 0.5);
      }

      /** Affiche le proverbe complet ; enchaîne seul après une bonne réponse, sinon bouton. */
      function terminerQuestion(etat, reussi) {
        etat.fini = true;
        etat.trous.forEach(t => {
          t.el.textContent = t.reponse;
          t.el.removeAttribute('aria-label');
          if (etat.trous.length > 1) t.el.disabled = true;
        });
        etat.suite.append(
          el('div', { class: 'panneau prov-complet' }, el('p', null,
            etat.p.texte.includes('«') ? texteComplet(etat.p) : '« ' + texteComplet(etat.p) + ' »'))
        );
        if (reussi) {
          // Un peu plus long que le délai commun : le temps de relire le proverbe en entier.
          ctx.enchainer(motSuivant, 3000);
          return;
        }
        const bouton = el('button', { class: 'btn btn-primaire btn-grand', onclick: motSuivant },
          index + 1 < proverbes.length ? 'Proverbe suivant ▶' : 'Voir le bilan ▶');
        etat.suite.append(bouton);
        bouton.focus();
      }

      function finir() {
        const reussite = proverbes.length ? Math.max(0, points / proverbes.length) : 0;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: JS.UI.pluriel(bonnes, 'bonne réponse', 'bonnes réponses') + ' sur ' + proverbes.length + ' proverbes.'
        });
      }
    }
  });
})();
