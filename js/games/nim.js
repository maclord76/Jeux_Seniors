/* Jeu de Nim contre l'ordinateur : retirer des allumettes, celui qui prend la dernière a perdu. */
(function () {
  'use strict';
  const { el, entier, choisir } = JS.UI;

  const NB_MANCHES = 5;

  // tailles : rangée unique possible (tirée au hasard) ; rangees : nombre de rangées pour le Nim de Marienbad.
  // max : retrait maximal par coup (null = autant qu'on veut dans une rangée) ; strategie : probabilité d'un coup réfléchi.
  const NIVEAUX = [
    { tailles: [12], max: 3, strategie: 0.1 },
    { tailles: [14, 15], max: 3, strategie: 0.35 },
    { tailles: [15, 16, 18], max: 3, strategie: 0.6 },
    { tailles: [18, 19, 20], max: 3, strategie: 0.85 },
    { tailles: [19, 20, 22, 23], max: 3, strategie: 1 },
    { rangees: 3, max: null, strategie: 0.5 },
    { rangees: 4, max: null, strategie: 0.8 },
    { rangees: 4, max: null, strategie: 0.95 }
  ];

  /* ---------- Logique pure ---------- */

  const total = rangees => rangees.reduce((a, b) => a + b, 0);

  function coupsPossibles(rangees, max) {
    const coups = [];
    rangees.forEach((n, r) => {
      const limite = max ? Math.min(n, max) : n;
      for (let k = 1; k <= limite; k++) coups.push({ rangee: r, nombre: k });
    });
    return coups;
  }

  function appliquer(rangees, coup) {
    const r = rangees.slice();
    r[coup.rangee] -= coup.nombre;
    return r;
  }

  /**
   * Vrai si le joueur qui doit jouer perd face à un jeu parfait (variante « la dernière perd »).
   * Une rangée avec retrait limité à max : perdante si total ≡ 1 (mod max + 1).
   * Marienbad : perdante si toutes les rangées ont au plus 1 allumette et que leur nombre est impair,
   * ou s'il existe une rangée d'au moins 2 allumettes et que le « ou exclusif » des rangées vaut 0.
   */
  function estPerdante(rangees, max) {
    if (max) return total(rangees) % (max + 1) === 1;
    if (rangees.every(n => n <= 1)) return rangees.filter(n => n === 1).length % 2 === 1;
    return rangees.reduce((a, b) => a ^ b, 0) === 0;
  }

  function coupsGagnants(rangees, max) {
    return coupsPossibles(rangees, max).filter(c => estPerdante(appliquer(rangees, c), max));
  }

  /** Coup de l'ordinateur : réfléchi avec la probabilité strategie, sinon au hasard (sans prendre la dernière s'il peut l'éviter). */
  function coupOrdinateur(rangees, max, strategie, hasard) {
    const tirage = hasard || Math.random;
    const gagnants = coupsGagnants(rangees, max);
    if (gagnants.length && tirage() < strategie) return gagnants[Math.floor(tirage() * gagnants.length)];
    const coups = coupsPossibles(rangees, max);
    const prudents = coups.filter(c => total(appliquer(rangees, c)) > 0);
    const liste = prudents.length ? prudents : coups;
    return liste[Math.floor(tirage() * liste.length)];
  }

  /** Position de départ, toujours gagnable par le joueur (qui commence) s'il joue parfaitement. */
  function positionDepart(niveau) {
    const config = NIVEAUX[niveau - 1];
    if (!config.rangees) return [choisir(config.tailles)];
    for (;;) {
      const r = [];
      for (let i = 0; i < config.rangees; i++) r.push(entier(1, 2 * i + 2 + (config.rangees === 3 ? 1 : 0)));
      r.sort((a, b) => a - b);
      const somme = total(r);
      if (somme >= (config.rangees === 3 ? 7 : 11) && !estPerdante(r, null)) return r;
    }
  }

  /* ---------- Styles propres au jeu ---------- */

  function injecterStyle() {
    if (document.getElementById('style-nim')) return;
    document.head.append(el('style', { id: 'style-nim' }, `
.nim-regle { max-width: 44rem; text-align: center; font-weight: 700; padding: 0.5rem 1rem; border: 3px solid var(--accent); border-radius: var(--rayon); background: var(--accent-clair); }
.nim-plateau { display: flex; flex-direction: column; gap: 0.7rem; width: 100%; max-width: 46rem; }
.nim-rangee { display: flex; align-items: center; gap: 1rem; width: 100%; min-height: 5.6rem; padding: 0.5rem 0.8rem; border: 3px solid var(--bord-leger); border-radius: var(--rayon); background: var(--carte); color: var(--texte); font: inherit; text-align: left; }
button.nim-rangee { cursor: pointer; touch-action: manipulation; }
button.nim-rangee:hover:not([disabled]) { border-color: var(--primaire); }
.nim-rangee.nim-choisie { border-color: var(--primaire); background: var(--primaire-clair); outline: 4px solid var(--primaire); outline-offset: -1px; }
.nim-rangee[disabled] { cursor: default; }
.nim-etiquette { flex: none; min-width: 7.5rem; font-weight: 700; }
.nim-allumettes { display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: flex-end; }
.nim-allumette { position: relative; display: inline-block; width: 0.75rem; height: 4rem; margin-top: 0.6rem; border-radius: 0.2rem; background: #d9a75f; border: 2px solid #7a5420; }
.nim-allumette::before { content: ''; position: absolute; left: 50%; top: -0.75rem; width: 1.05rem; height: 1.2rem; transform: translateX(-50%); border-radius: 50%; background: var(--jeu-rouge); border: 2px solid #6d1010; }
.nim-allumette.nim-fantome { opacity: 0.3; border-style: dashed; }
.nim-allumette.nim-fantome::before { border-style: dashed; }
.nim-reste { font-size: 1.4rem; font-weight: 700; text-align: center; }
.nim-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.7rem; width: 100%; max-width: 46rem; }
.nim-actions .btn { flex: 1 1 9rem; font-size: 1.2rem; min-height: 4.2rem; }
.nim-astuce { max-width: 44rem; text-align: center; }
`));
  }

  /* ---------- Jeu ---------- */

  JS.Jeux.register({
    id: 'nim',
    nom: 'Jeu de Nim',
    categorie: 'logique',
    icone: '🔥',
    description: 'Retirez des allumettes à tour de rôle : celui qui prend la dernière a perdu.',
    consigne: 'Vous jouez contre l\'ordinateur, chacun son tour, et vous commencez. À chaque tour, retirez des allumettes avec les grands boutons « Retirer ». Celui qui prend la dernière allumette a perdu. Dans les premiers niveaux, il y a une seule rangée et on retire 1, 2 ou 3 allumettes. Dans les niveaux avancés, il y a plusieurs rangées : touchez une rangée, puis retirez autant d\'allumettes que vous voulez, mais dans cette seule rangée. Le bouton « Conseil » vous souffle un bon coup. Cinq manches par partie.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => {
      const c = NIVEAUX[n - 1];
      const force = c.strategie < 0.3 ? 'ordinateur débutant' : c.strategie < 0.7 ? 'ordinateur attentif' : c.strategie < 0.9 ? 'ordinateur rusé' : 'ordinateur expert';
      if (c.rangees) return c.rangees + ' rangées, on retire autant d\'allumettes qu\'on veut dans une seule rangée, ' + force + ' ; la dernière allumette perd';
      return 'une rangée de ' + c.tailles.join(' ou ') + ' allumettes, on retire 1 à 3 allumettes, ' + force + ' ; la dernière allumette perd';
    },
    logique: { estPerdante, coupsPossibles, coupsGagnants, coupOrdinateur, positionDepart, appliquer, NIVEAUX, NB_MANCHES },

    start(ctx) {
      injecterStyle();
      const config = NIVEAUX[ctx.niveau - 1];
      const max = config.max;
      const multi = !!config.rangees;

      let manche = 0;
      let gagnees = 0;
      let points = 0;
      let rangees = [];
      let fantomes = [];
      let tour = 'joueur';
      let choisie = -1;
      let conseilUtilise = false;
      let mancheFinie = false;

      const enonce = el('p', { class: 'enonce', 'aria-live': 'polite' });
      const regle = el('p', { class: 'nim-regle' },
        multi
          ? 'Touchez une rangée, puis retirez autant d\'allumettes que vous voulez dans cette rangée. Celui qui prend la dernière allumette a perdu.'
          : 'Retirez 1, 2 ou 3 allumettes. Celui qui prend la dernière allumette a perdu.');
      const reste = el('p', { class: 'nim-reste', 'aria-live': 'polite' });
      const plateau = el('div', { class: 'nim-plateau' });
      const actions = el('div', { class: 'nim-actions', role: 'group', 'aria-label': 'Retirer des allumettes' });
      const astuce = el('p', { class: 'nim-astuce texte-doux', 'aria-live': 'polite' });
      const boutonConseil = el('button', { class: 'btn btn-secondaire', type: 'button', onclick: donnerConseil },
        el('span', { 'aria-hidden': 'true' }, '💡'), ' Conseil');
      const boutonAstuce = el('button', { class: 'btn btn-secondaire', type: 'button', hidden: true, onclick: montrerAstuce },
        el('span', { 'aria-hidden': 'true' }, '💡'), ' Une astuce ?');
      const boutonSuite = el('button', { class: 'btn btn-primaire btn-grand', type: 'button', hidden: true, onclick: mancheSuivante }, 'Manche suivante ▶');

      ctx.root.append(enonce, regle, reste, plateau, actions,
        el('div', { class: 'ligne-boutons centre' }, boutonConseil, boutonAstuce, boutonSuite), astuce);

      function nouvelleManche() {
        rangees = positionDepart(ctx.niveau);
        fantomes = rangees.map(() => 0);
        tour = 'joueur';
        choisie = multi ? -1 : 0;
        conseilUtilise = false;
        mancheFinie = false;
        astuce.textContent = '';
        boutonAstuce.hidden = true;
        boutonSuite.hidden = true;
        boutonConseil.hidden = false;
        ctx.message('Manche ' + (manche + 1) + ' : à vous de commencer !', 'info');
        afficher();
      }

      function texteAllumettes(n) {
        return n === 0 ? 'aucune allumette' : JS.UI.pluriel(n, 'allumette');
      }

      function afficher() {
        enonce.textContent = 'Manche ' + (manche + 1) + ' sur ' + NB_MANCHES + ' — Vous : ' + gagnees + ', ordinateur : ' + (manche - gagnees);
        const restant = total(rangees);
        reste.textContent = 'Il reste ' + texteAllumettes(restant) + '.';

        plateau.replaceChildren(...rangees.map((n, r) => {
          const allumettes = [];
          for (let i = 0; i < n; i++) allumettes.push(el('span', { class: 'nim-allumette', 'aria-hidden': 'true' }));
          for (let i = 0; i < fantomes[r]; i++) allumettes.push(el('span', { class: 'nim-allumette nim-fantome', 'aria-hidden': 'true' }));
          const description = (multi ? 'Rangée ' + (r + 1) + ' : ' : '') + texteAllumettes(n) +
            (fantomes[r] ? ' (l\'ordinateur vient d\'en retirer ' + fantomes[r] + ')' : '');
          const contenu = [
            multi ? el('span', { class: 'nim-etiquette', 'aria-hidden': 'true' }, 'Rangée ' + (r + 1) + ' : ' + n) : null,
            el('span', { class: 'nim-allumettes' }, allumettes)
          ];
          if (!multi) return el('div', { class: 'nim-rangee', role: 'img', 'aria-label': description }, contenu);
          return el('button', {
            class: 'nim-rangee' + (r === choisie ? ' nim-choisie' : ''),
            type: 'button',
            disabled: tour !== 'joueur' || mancheFinie || n === 0,
            'aria-pressed': String(r === choisie),
            'aria-label': description + (r === choisie ? ', choisie' : ''),
            onclick: () => choisirRangee(r)
          }, contenu);
        }));

        const boutons = [];
        if (!mancheFinie) {
          if (multi && choisie < 0) {
            boutons.push(el('p', { class: 'texte-doux' }, tour === 'joueur' ? 'Touchez d\'abord une rangée.' : ''));
          } else {
            const disponible = rangees[choisie];
            const limite = max || disponible;
            for (let k = 1; k <= limite; k++) {
              boutons.push(el('button', {
                class: 'btn btn-primaire',
                type: 'button',
                disabled: tour !== 'joueur' || k > disponible,
                onclick: () => jouer({ rangee: choisie, nombre: k })
              }, 'Retirer ' + k));
            }
          }
        }
        actions.replaceChildren(...boutons);
        boutonConseil.disabled = tour !== 'joueur' || mancheFinie;
      }

      function choisirRangee(r) {
        if (tour !== 'joueur' || mancheFinie || rangees[r] === 0) return;
        ctx.audio.clic();
        choisie = r;
        afficher();
      }

      function jouer(coup) {
        if (tour !== 'joueur' || mancheFinie) return;
        if (coup.rangee < 0 || coup.nombre < 1 || coup.nombre > rangees[coup.rangee]) return;
        ctx.audio.clic();
        fantomes = rangees.map(() => 0);
        rangees = appliquer(rangees, coup);
        if (total(rangees) === 0) {
          finManche(false, 'Vous avez pris la dernière allumette : l\'ordinateur gagne cette manche.');
          return;
        }
        tour = 'ordinateur';
        if (multi && rangees[choisie] === 0) choisie = -1;
        ctx.message('L\'ordinateur réfléchit…', 'info');
        afficher();
        ctx.plusTard(jouerOrdinateur, 1300);
      }

      function jouerOrdinateur() {
        const coup = coupOrdinateur(rangees, max, config.strategie);
        rangees = appliquer(rangees, coup);
        fantomes = rangees.map((_, r) => (r === coup.rangee ? coup.nombre : 0));
        const ou = multi ? ' dans la rangée ' + (coup.rangee + 1) : '';
        if (total(rangees) === 0) {
          finManche(true, 'L\'ordinateur a dû prendre la dernière allumette : vous gagnez cette manche !');
          return;
        }
        tour = 'joueur';
        if (multi) {
          const nonVides = rangees.map((n, r) => r).filter(r => rangees[r] > 0);
          choisie = nonVides.length === 1 ? nonVides[0] : (rangees[choisie] > 0 ? choisie : -1);
        }
        ctx.message('L\'ordinateur a retiré ' + texteAllumettes(coup.nombre) + ou + '. À vous !', 'info');
        afficher();
      }

      function finManche(victoire, texte) {
        mancheFinie = true;
        tour = 'fin';
        manche++;
        if (victoire) {
          gagnees++;
          points += conseilUtilise ? 0.75 : 1;
          ctx.audio.succes();
        } else {
          ctx.audio.erreur();
        }
        ctx.message(texte, victoire ? 'succes' : 'info');
        afficher();
        enonce.textContent = 'Fin de la manche ' + manche + ' sur ' + NB_MANCHES + ' — Vous : ' + gagnees + ', ordinateur : ' + (manche - gagnees);
        boutonConseil.hidden = true;
        boutonAstuce.hidden = victoire;
        // Manche gagnée : on enchaîne seul. Perdue : bouton, pour pouvoir lire l'astuce.
        if (victoire) {
          ctx.enchainer(mancheSuivante, 2500);
          return;
        }
        boutonSuite.textContent = manche < NB_MANCHES ? 'Manche suivante ▶' : 'Voir le résultat ▶';
        boutonSuite.hidden = false;
        boutonSuite.focus();
      }

      function montrerAstuce() {
        ctx.audio.clic();
        astuce.textContent = multi
          ? 'Astuce : laisser deux rangées identiques est souvent un bon coup, car vous pouvez ensuite imiter l\'ordinateur dans l\'autre rangée. Et à la fin, essayez de lui laisser un nombre impair de rangées d\'une seule allumette.'
          : 'Astuce : celui qui doit jouer quand il ne reste qu\'une allumette a perdu. Essayez donc de laisser à l\'ordinateur 1, 5, 9, 13, 17 ou 21 allumettes : quoi qu\'il retire, vous pourrez y revenir au tour suivant.';
        boutonAstuce.hidden = true;
      }

      function donnerConseil() {
        if (tour !== 'joueur' || mancheFinie) return;
        ctx.audio.clic();
        conseilUtilise = true;
        const gagnants = coupsGagnants(rangees, max);
        if (!gagnants.length) {
          ctx.message('Conseil : il n\'y a pas de coup sûr ici. Retirez une seule allumette et attendez une erreur de l\'ordinateur.', 'info');
          return;
        }
        const coup = gagnants[0];
        if (multi) choisie = coup.rangee;
        afficher();
        ctx.message('Conseil : retirez ' + texteAllumettes(coup.nombre) + (multi ? ' dans la rangée ' + (coup.rangee + 1) : '') + '.', 'info');
      }

      function mancheSuivante() {
        ctx.audio.clic();
        if (manche < NB_MANCHES) {
          nouvelleManche();
          return;
        }
        boutonSuite.disabled = true;
        const reussite = points / NB_MANCHES;
        ctx.terminer({
          reussite,
          score: Math.round(reussite * 100 * ctx.niveau),
          details: JS.UI.pluriel(gagnees, 'manche gagnée', 'manches gagnées') + ' sur ' + NB_MANCHES + '.'
        });
      }

      // Bonus clavier : les chiffres retirent ce nombre d'allumettes (dans la rangée choisie).
      function clavier(e) {
        if (e.ctrlKey || e.altKey || e.metaKey || document.querySelector('dialog[open]')) return;
        const k = Number(e.key);
        if (tour === 'joueur' && !mancheFinie && choisie >= 0 && k >= 1 && k <= (max || 9) && k <= rangees[choisie]) {
          e.preventDefault();
          jouer({ rangee: choisie, nombre: k });
        }
      }
      document.addEventListener('keydown', clavier);

      nouvelleManche();
      return () => document.removeEventListener('keydown', clavier);
    }
  });
})();
