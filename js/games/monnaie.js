/* Rendre la monnaie : composer avec des pièces et des billets la somme à rendre après un achat. */
(function () {
  'use strict';
  const { el, entier, choisir, pluriel } = JS.UI;

  const NB_QUESTIONS = 6;

  // Toutes les valeurs sont en centimes (aucun nombre à virgule dans les calculs).
  const ESPECES = [
    { valeur: 1, type: 'piece', metal: 'cuivre' },
    { valeur: 2, type: 'piece', metal: 'cuivre' },
    { valeur: 5, type: 'piece', metal: 'cuivre' },
    { valeur: 10, type: 'piece', metal: 'or' },
    { valeur: 20, type: 'piece', metal: 'or' },
    { valeur: 50, type: 'piece', metal: 'or' },
    { valeur: 100, type: 'piece', metal: 'euro1' },
    { valeur: 200, type: 'piece', metal: 'euro2' },
    { valeur: 500, type: 'billet', teinte: '#dfe3da', bord: '#6f7867' },
    { valeur: 1000, type: 'billet', teinte: '#f4cfc9', bord: '#a0443a' },
    { valeur: 2000, type: 'billet', teinte: '#cddcf3', bord: '#3b5f99' },
    { valeur: 5000, type: 'billet', teinte: '#f7d8b5', bord: '#a05a14' }
  ];

  // Articles par gamme de prix (en centimes) ; le prix exact est tiré au hasard dans la gamme du niveau.
  const ARTICLES = [
    { nom: 'la baguette', min: 90, max: 150 },
    { nom: 'le croissant', min: 100, max: 160 },
    { nom: 'le journal', min: 150, max: 350 },
    { nom: 'le litre de lait', min: 95, max: 180 },
    { nom: 'le carnet de timbres', min: 300, max: 1400 },
    { nom: 'la salade', min: 100, max: 250 },
    { nom: 'le kilo de pommes', min: 200, max: 450 },
    { nom: 'le pot de confiture', min: 250, max: 550 },
    { nom: 'le paquet de café', min: 300, max: 700 },
    { nom: 'le magazine', min: 200, max: 700 },
    { nom: 'le fromage', min: 300, max: 1200 },
    { nom: 'la boîte de chocolats', min: 500, max: 1800 },
    { nom: 'le bouquet de fleurs', min: 800, max: 3000 },
    { nom: 'le livre', min: 700, max: 2500 },
    { nom: 'le poulet rôti', min: 800, max: 1600 },
    { nom: 'la plante verte', min: 1200, max: 4500 },
    { nom: 'le parapluie', min: 1000, max: 3500 },
    { nom: 'la paire de chaussons', min: 1500, max: 4000 },
    { nom: 'le pull', min: 2500, max: 6500 },
    { nom: 'la cafetière', min: 2000, max: 7000 }
  ];

  /*
   * Niveaux : nombre d'articles, gamme de prix de chaque article, arrondi des prix (en centimes),
   * paiements possibles et espèces disponibles pour rendre la monnaie.
   */
  const NIVEAUX = [
    { articles: 1, min: 100, max: 900, pas: 100, paiements: [500, 1000], especes: [100, 200, 500] },
    { articles: 1, min: 100, max: 1900, pas: 100, paiements: [1000, 2000], especes: [100, 200, 500, 1000] },
    { articles: 1, min: 50, max: 450, pas: 10, paiements: [200, 500], especes: [10, 20, 50, 100, 200] },
    { articles: 1, min: 50, max: 950, pas: 5, paiements: [500, 1000], especes: [5, 10, 20, 50, 100, 200, 500] },
    { articles: 1, min: 50, max: 1950, pas: 1, paiements: [1000, 2000], especes: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000] },
    { articles: 1, min: 1200, max: 6500, pas: 5, paiements: [5000, 10000], especes: [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000] },
    { articles: 2, min: 90, max: 1800, pas: 5, paiements: [1000, 2000, 5000], especes: [5, 10, 20, 50, 100, 200, 500, 1000, 2000] },
    { articles: 3, min: 90, max: 2500, pas: 1, paiements: [2000, 5000, 10000], especes: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000] }
  ];

  const DESCRIPTIONS = [
    'un article en euros ronds, payé avec un billet de 5 ou 10 €',
    'un article en euros ronds, payé avec un billet de 10 ou 20 €',
    'des prix avec des dizaines de centimes (1,30 €)',
    'des prix au centime de 5 près, jusqu\'à 10 €',
    'des prix au centime près, jusqu\'à 20 €',
    'de plus grands montants, payés avec 50 ou 100 €',
    'deux articles à additionner',
    'trois articles à additionner, au centime près'
  ];

  /* ---------- Logique pure ---------- */

  /** Format français : 3 €, 1,30 €, 0,05 €. */
  function formatEuros(centimes) {
    const euros = Math.floor(centimes / 100);
    const reste = centimes % 100;
    return (reste ? euros + ',' + String(reste).padStart(2, '0') : String(euros)) + ' €';
  }

  /** Nom d'une pièce ou d'un billet : « une pièce de 50 centimes », « un billet de 10 € ». */
  function nomEspece(valeur) {
    const e = ESPECES.find(x => x.valeur === valeur);
    const montant = valeur < 100 ? JS.UI.pluriel(valeur, 'centime') : formatEuros(valeur);
    return (!e || e.type === 'billet' ? 'un billet de ' : 'une pièce de ') + montant;
  }

  function tirerPrix(config) {
    const premier = Math.ceil(config.min / config.pas);
    const dernier = Math.floor(config.max / config.pas);
    return entier(premier, dernier) * config.pas;
  }

  /** Une situation d'achat : { achats: [{ nom, prix }], total, paye, rendu }. */
  function genererQuestion(niveau) {
    const config = NIVEAUX[niveau - 1];
    for (let essai = 0; essai < 500; essai++) {
      const achats = [];
      const pris = new Set();
      for (let k = 0; k < config.articles; k++) {
        const prix = tirerPrix(config);
        const possibles = ARTICLES.filter(a => prix >= a.min && prix <= a.max && !pris.has(a.nom));
        if (!possibles.length) break;
        const article = choisir(possibles);
        pris.add(article.nom);
        achats.push({ nom: article.nom, prix });
      }
      if (achats.length !== config.articles) continue;
      const total = achats.reduce((s, a) => s + a.prix, 0);
      const paiements = config.paiements.filter(p => p > total);
      if (!paiements.length) continue;
      // On paie le plus souvent avec le plus petit billet suffisant.
      const paye = Math.random() < 0.7 ? paiements[0] : choisir(paiements);
      const rendu = paye - total;
      // Pas de monnaie dérisoire (ex. 0,01 € sur 50 €) : au moins un vingtième de la somme payée.
      if (rendu < Math.max(config.pas, paye / 20)) continue;
      return { achats, total, paye, rendu };
    }
    // Repli très improbable : une situation simple et sûre.
    return { achats: [{ nom: 'le journal', prix: 300 }], total: 300, paye: 500, rendu: 200 };
  }

  /** Décomposition gloutonne (avec les espèces du niveau) : sert d'exemple de solution. */
  function decomposer(montant, especes) {
    const resultat = [];
    let reste = montant;
    for (const v of especes.slice().sort((a, b) => b - a)) {
      while (reste >= v) { resultat.push(v); reste -= v; }
    }
    return reste === 0 ? resultat : null;
  }

  function genererPartie(niveau) {
    const questions = [];
    const vues = new Set();
    let garde = 0;
    while (questions.length < NB_QUESTIONS && garde++ < 100) {
      const q = genererQuestion(niveau);
      const cle = q.achats.map(a => a.nom + a.prix).join('|') + q.paye;
      if (vues.has(cle)) continue;
      vues.add(cle);
      questions.push(q);
    }
    return questions;
  }

  /* ---------- Styles propres au jeu ---------- */

  function injecterStyle() {
    if (document.getElementById('style-monnaie')) return;
    document.head.append(el('style', { id: 'style-monnaie' }, `
.mon-situation { max-width: 44rem; width: 100%; text-align: center; font-size: 1.2rem; }
.mon-situation .mon-question { font-weight: 700; margin-top: 0.4rem; }
.mon-achats { list-style: none; padding: 0; margin: 0 0 0.6rem; }
.mon-achats li { font-size: 1.15rem; }
.mon-total { font-size: 2rem; font-weight: 700; text-align: center; padding: 0.4rem 1.2rem; border: 3px solid var(--primaire); border-radius: var(--rayon); background: var(--primaire-clair); }
.mon-rendu { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.4rem; min-height: 4.6rem; width: 100%; max-width: 44rem; padding: 0.5rem; border: 3px dashed var(--bord-leger); border-radius: var(--rayon); background: var(--fond); }
.mon-rendu .mon-vide { color: var(--texte-doux); }
.mon-caisse { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.6rem; width: 100%; max-width: 50rem; }
 .mon-espece { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; flex: none; padding: 0.4rem; border: 2px solid transparent; border-radius: 0.6rem; background: var(--fond); color: var(--texte); font: inherit; font-weight: 800; line-height: 1.2; cursor: pointer; touch-action: manipulation; user-select: none; }
.mon-espece:active { transform: translateY(1px); }
button.mon-espece:hover { border-color: var(--primaire); }
button.mon-espece:focus-visible { outline: 3px solid var(--primaire); outline-offset: 3px; }
.mon-espece img { display: block; object-fit: contain; pointer-events: none; }
.mon-piece img { width: var(--d); height: var(--d); border-radius: 50%; }
.mon-billet img { width: 8rem; height: 4.5rem; }
.mon-valeur { font-size: 1rem; }
.mon-rendu .mon-espece { cursor: default; padding: 0.2rem; }
.mon-rendu .mon-piece img { width: calc(var(--d) * 0.8); height: calc(var(--d) * 0.8); }
.mon-rendu .mon-billet img { width: 6.4rem; height: 3.6rem; }
.mon-detail { text-align: center; max-width: 44rem; }
`));
  }

  /* ---------- Jeu ---------- */

  JS.Jeux.register({
    id: 'monnaie',
    nom: 'Rendre la monnaie',
    categorie: 'logique',
    icone: '💶',
    description: 'Calculez la monnaie à rendre et composez-la avec des pièces et des billets.',
    consigne: 'Lisez la situation : un article coûte un certain prix et le client paie avec un billet ou une pièce. Combien faut-il lui rendre ? Touchez les pièces et les billets de la caisse pour composer la monnaie : la somme s\'affiche en gros. Le bouton « Retirer la dernière » enlève la dernière pièce posée. Quand le compte est bon, touchez « Valider ». Toute façon de faire le bon montant est acceptée. Le bouton « Indice » vous aide à calculer.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => DESCRIPTIONS[n - 1] + ', ' + NB_QUESTIONS + ' situations',
    logique: { formatEuros, genererQuestion, genererPartie, decomposer, NIVEAUX, ESPECES, NB_QUESTIONS },

    start(ctx) {
      injecterStyle();
      const config = NIVEAUX[ctx.niveau - 1];
      const questions = genererPartie(ctx.niveau);
      let numero = 0;
      let question = null;
      let rendu = [];
      let erreurs = 0;
      let indices = 0;
      let resolue = false;
      let points = 0;
      let reussiesDuPremierCoup = 0;

      const enonce = el('p', { class: 'enonce' });
      const situation = el('div', { class: 'mon-situation panneau' });
      const total = el('p', { class: 'mon-total', 'aria-live': 'polite' });
      const zoneRendu = el('div', { class: 'mon-rendu', role: 'group', 'aria-label': 'Monnaie rendue' });
      const detail = el('p', { class: 'mon-detail texte-doux', 'aria-live': 'polite' });
      const caisse = el('div', { class: 'mon-caisse', role: 'group', 'aria-label': 'Caisse : pièces et billets' },
        config.especes.map(v => espece(v, 'button')));
      const boutonRetirer = el('button', { class: 'btn btn-secondaire', type: 'button', onclick: retirerDerniere },
        el('span', { 'aria-hidden': 'true' }, '↩'), ' Retirer la dernière');
      const boutonEffacer = el('button', { class: 'btn btn-secondaire', type: 'button', onclick: toutEffacer },
        el('span', { 'aria-hidden': 'true' }, '✖'), ' Tout effacer');
      const boutonIndice = el('button', { class: 'btn btn-secondaire', type: 'button', onclick: donnerIndice },
        el('span', { 'aria-hidden': 'true' }, '💡'), ' Indice');
      const boutonValider = el('button', { class: 'btn btn-primaire btn-grand', type: 'button', onclick: valider },
        el('span', { 'aria-hidden': 'true' }, '✔'), ' Valider');
      const actions = el('div', { class: 'ligne-boutons centre' }, boutonRetirer, boutonEffacer, boutonIndice, boutonValider);
      const boutonSuivant = el('button', { class: 'btn btn-primaire btn-grand', type: 'button', hidden: true, onclick: suivante }, 'Situation suivante ▶');

      ctx.root.append(enonce, situation, el('p', { class: 'texte-doux' }, 'Monnaie rendue :'), total, zoneRendu, detail,
        caisse, actions, el('div', { class: 'ligne-boutons centre' }, boutonSuivant));

      /** Image de la pièce ou du billet, avec sa valeur toujours écrite. */
      function espece(valeur, balise) {
        const e = ESPECES.find(x => x.valeur === valeur);
        const estBouton = balise === 'button';
        const attributs = {
          class: 'mon-espece ' + (e.type === 'billet' ? 'mon-billet' : 'mon-piece mon-' + e.metal),
          'aria-label': estBouton ? 'Ajouter ' + nomEspece(valeur) : null,
          'aria-hidden': estBouton ? null : 'true',
          type: estBouton ? 'button' : null,
          onclick: estBouton ? () => ajouter(valeur) : null
        };
        // Images locales : disponibles également sans connexion.
        const diametres = { 1: 3.4, 2: 3.6, 5: 3.8, 10: 3.7, 20: 3.95, 50: 4.2, 100: 4.1, 200: 4.5 };
        if (e.type === 'piece') attributs.style = '--d: ' + diametres[valeur] + 'rem';
        const extension = valeur === 10 ? 'png' : 'jpg';
        return el(balise, attributs,
          el('img', { src: 'img/monnaie/' + valeur + '.' + extension, alt: '', draggable: 'false' }),
          el('span', { class: 'mon-valeur' }, valeur < 100 ? valeur + ' cent' : formatEuros(valeur)));

      }

      function afficherQuestion() {
        question = questions[numero];
        rendu = [];
        erreurs = 0;
        indices = 0;
        resolue = false;
        enonce.textContent = 'Situation ' + (numero + 1) + ' sur ' + questions.length;
        const paiement = 'Le client paie avec ' + nomEspece(question.paye) + '.';
        if (question.achats.length === 1) {
          const a = question.achats[0];
          situation.replaceChildren(
            el('p', null, majuscule(a.nom) + ' coûte ' + formatEuros(a.prix) + '. ' + paiement),
            el('p', { class: 'mon-question' }, 'Combien faut-il lui rendre ?')
          );
        } else {
          situation.replaceChildren(
            el('p', null, 'Le client achète :'),
            el('ul', { class: 'mon-achats' }, question.achats.map(a => el('li', null, majuscule(a.nom) + ' : ' + formatEuros(a.prix)))),
            el('p', null, paiement),
            el('p', { class: 'mon-question' }, 'Combien faut-il lui rendre ?')
          );
        }
        detail.textContent = '';
        actions.hidden = false;
        caisse.hidden = false;
        boutonSuivant.hidden = true;
        ctx.message('', 'info');
        afficherRendu();
      }

      function majuscule(texte) {
        return texte.charAt(0).toUpperCase() + texte.slice(1);
      }

      function somme() {
        return rendu.reduce((s, v) => s + v, 0);
      }

      function afficherRendu() {
        total.textContent = formatEuros(somme());
        zoneRendu.replaceChildren(...(rendu.length
          ? rendu.map(v => espece(v, 'span'))
          : [el('span', { class: 'mon-vide' }, 'Touchez les pièces et les billets ci-dessous.')]));
        zoneRendu.setAttribute('aria-label', 'Monnaie rendue : ' + (rendu.length ? rendu.map(formatEuros).join(' + ') : 'rien pour l\'instant'));
        if (!resolue) detail.textContent = rendu.length > 1 ? rendu.map(formatEuros).join(' + ') + ' = ' + formatEuros(somme()) : '';
        boutonRetirer.disabled = !rendu.length;
        boutonEffacer.disabled = !rendu.length;
      }

      function ajouter(valeur) {
        if (resolue) return;
        if (rendu.length >= 40) {
          ctx.message('Cela fait beaucoup de pièces ! Essayez avec des pièces ou des billets plus gros.', 'info');
          return;
        }
        ctx.audio.clic();
        rendu.push(valeur);
        ctx.message('', 'info');
        afficherRendu();
      }

      function retirerDerniere() {
        if (resolue || !rendu.length) return;
        ctx.audio.clic();
        rendu.pop();
        afficherRendu();
      }

      function toutEffacer() {
        if (resolue || !rendu.length) return;
        ctx.audio.clic();
        rendu = [];
        afficherRendu();
      }

      function donnerIndice() {
        if (resolue) return;
        ctx.audio.clic();
        indices++;
        const { achats, total: prixTotal, paye, rendu: aRendre } = question;
        if (indices === 1 && achats.length > 1) {
          ctx.message('Indice : additionnez d\'abord les prix. ' + achats.map(a => formatEuros(a.prix)).join(' + ') + ' = ' + formatEuros(prixTotal) + '.', 'info');
        } else if (indices <= (achats.length > 1 ? 2 : 1)) {
          ctx.message('Indice : comptez de ' + formatEuros(prixTotal) + ' jusqu\'à ' + formatEuros(paye) + '. C\'est le calcul ' + formatEuros(paye) + ' − ' + formatEuros(prixTotal) + '.', 'info');
        } else {
          const exemple = decomposer(aRendre, config.especes);
          ctx.message('Indice : il faut rendre ' + formatEuros(aRendre) + (exemple ? ', par exemple ' + exemple.map(formatEuros).join(' + ') : '') + '.', 'info');
        }
      }

      function valider() {
        if (resolue) return;
        const s = somme();
        if (!rendu.length) {
          ctx.message('Touchez d\'abord des pièces ou des billets pour composer la monnaie.', 'info');
          return;
        }
        if (s === question.rendu) {
          resolue = true;
          const note = Math.max(0.3, 1 - 0.25 * erreurs - 0.2 * indices);
          points += note;
          if (!erreurs && !indices) reussiesDuPremierCoup++;
          ctx.audio.succes();
          ctx.message('Bravo, le compte est bon : ' + formatEuros(question.paye) + ' − ' + formatEuros(question.total) + ' = ' + formatEuros(question.rendu) + '.', 'succes');
          detail.textContent = 'Vous avez rendu ' + rendu.map(formatEuros).join(' + ') + ' = ' + formatEuros(s) + '.';
          actions.hidden = true;
          caisse.hidden = true;
          // Bonne réponse : on enchaîne seul, un peu plus tard pour laisser relire le calcul.
          ctx.enchainer(suivante, 3000);
          return;
        }
        erreurs++;
        ctx.audio.erreur();
        const ecart = Math.abs(s - question.rendu);
        ctx.message('Vous rendez ' + formatEuros(s) + ' : ' + (s < question.rendu ? 'il manque encore ' : 'c\'est ' + formatEuros(ecart) + ' de trop') +
          (s < question.rendu ? formatEuros(ecart) : '') + '. Vous pouvez corriger tranquillement.', 'erreur');
      }

      function suivante() {
        if (!resolue) return;
        ctx.audio.clic();
        numero++;
        if (numero < questions.length) {
          afficherQuestion();
          return;
        }
        boutonSuivant.disabled = true;
        const reussite = points / questions.length;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: pluriel(questions.length, 'situation') + ' réussie' + (questions.length > 1 ? 's' : '') +
            (reussiesDuPremierCoup ? ', dont ' + reussiesDuPremierCoup + ' du premier coup et sans aide.' : ', avec un peu d\'aide.')
        });
      }

      // Bonus clavier : Retour arrière retire la dernière pièce, Entrée valide.
      function clavier(e) {
        if (resolue || e.ctrlKey || e.altKey || e.metaKey || document.querySelector('dialog[open]')) return;
        if (e.key === 'Backspace') { e.preventDefault(); retirerDerniere(); }
        else if (e.key === 'Enter' && !(e.target.closest && e.target.closest('button, a, input, select, textarea'))) {
          e.preventDefault();
          valider();
        }
      }
      document.addEventListener('keydown', clavier);

      afficherQuestion();
      return () => document.removeEventListener('keydown', clavier);
    }
  });
})();
