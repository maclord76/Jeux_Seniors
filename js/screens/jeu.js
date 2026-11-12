/* Cadre commun à tous les jeux : consigne, choix du niveau, partie, écran de fin. */
(function () {
  'use strict';
  const { el } = JS.UI;
  // Pause après une bonne réponse avant l'enchaînement automatique (ms).
  const DELAI_ENCHAINEMENT = 2000;

  JS.UI.ecran('jeu', function (racine, params) {
    const jeu = JS.Jeux.get(params[0]);
    if (!jeu) {
      JS.UI.naviguer('accueil');
      return;
    }
    const profil = JS.Stockage.profilActif();
    const etat = JS.Progres.etatJeu(profil, jeu.id);
    let nettoyagePartie = null;

    // Le nom du jeu s'affiche dans l'en-tête, à côté du logo, pendant tout l'écran de jeu.
    JS.UI.titreEntete([el('span', { 'aria-hidden': 'true' }, jeu.icone + ' '), jeu.nom]);

    function arreterPartie() {
      if (nettoyagePartie) {
        const n = nettoyagePartie;
        nettoyagePartie = null;
        n();
      }
    }

    function texteConsigne() {
      return jeu.nom + '. ' + jeu.consigne;
    }

    /* ---------- Présentation et choix du niveau ---------- */

    function afficherIntro(niveauPropose) {
      arreterPartie();
      racine.innerHTML = '';
      let niveau = Math.min(niveauPropose || etat.niveauCourant || 1, etat.niveauDebloque, jeu.niveauxMax);

      const description = el('p', { class: 'texte-doux', 'aria-live': 'polite' });
      const boutonsNiveaux = [];
      const majNiveau = n => {
        niveau = n;
        boutonsNiveaux.forEach((b, i) => b.setAttribute('aria-pressed', String(i + 1 === n)));
        description.textContent = jeu.descriptionNiveau ? 'Niveau ' + n + ' : ' + jeu.descriptionNiveau(n) : '';
      };

      for (let n = 1; n <= jeu.niveauxMax; n++) {
        const verrouille = n > etat.niveauDebloque;
        const b = el('button', {
          class: 'btn',
          disabled: verrouille,
          'aria-pressed': 'false',
          'aria-label': 'Niveau ' + n + (verrouille ? ', pas encore débloqué' : ''),
          onclick: () => majNiveau(n)
        },
        el('span', null, verrouille ? '🔒' : String(n)),
        !verrouille && etat.etoiles[n] ? JS.UI.etoiles(etat.etoiles[n]) : null);
        boutonsNiveaux.push(b);
      }

      racine.append(
        el('section', { class: 'panneau consigne', 'aria-labelledby': 'titre-consigne' },
          el('h2', { id: 'titre-consigne' }, 'Comment jouer'),
          el('p', null, jeu.consigne),
          JS.Audio.voixDisponible()
            ? JS.UI.boutonLecture(texteConsigne(), 'Écouter la consigne')
            : null
        ),
        el('section', { class: 'panneau', 'aria-labelledby': 'titre-niveau' },
          el('h2', { id: 'titre-niveau' }, 'Choisissez un niveau'),
          el('div', { class: 'choix-niveaux' }, boutonsNiveaux),
          description,
          el('p', { class: 'texte-doux' },
            jeu.seuilDeblocage === 1
              ? 'Le niveau suivant se débloque lorsque vous avez atteint tout l’objectif de la partie.'
              : 'Les niveaux suivants se débloquent quand vous réussissez au moins 80 % d\'une partie.'),
          el('div', { class: 'ligne-boutons' },
            el('button', { class: 'btn btn-primaire btn-grand', onclick: () => lancer(niveau) }, '▶ Commencer')
          )
        )
      );
      majNiveau(niveau);
      JS.Audio.parler(texteConsigne());
    }

    /* ---------- Partie ---------- */

    function lancer(niveau) {
      arreterPartie();
      JS.Audio.taire();
      racine.innerHTML = '';
      const debut = Date.now();
      const minuteries = [];
      let actif = true;
      let finJeu = null;

      /* Pause : le chrono, les minuteries de la partie et le plateau sont suspendus. */
      let enPause = false;
      let debutPause = 0;
      let tempsEnPause = 0;
      const tempsEcoule = () => Date.now() - debut - tempsEnPause - (enPause ? Date.now() - debutPause : 0);
      const attentes = new Set(); // minuteries « plusTard » en cours, à suspendre pendant la pause

      const chronoTexte = el('span', null, '⏱ 0 s');
      const chrono = el('span', { class: 'compteur', 'aria-label': 'Temps écoulé' }, chronoTexte);
      const boutonPause = el('button', {
        type: 'button',
        class: 'btn btn-discret btn-icone btn-pause',
        'aria-label': 'Mettre la partie en pause',
        title: 'Mettre la partie en pause',
        onclick: () => basculerPause()
      }, '⏸');
      const message = el('div', { class: 'message', role: 'status', 'aria-live': 'polite' });
      const zone = el('div', { class: 'zone-jeu' });
      const boutonReprendre = el('button', {
        type: 'button',
        class: 'btn btn-primaire btn-grand',
        onclick: () => basculerPause(false)
      }, '▶ Reprendre la partie');
      const panneauPause = el('section', { class: 'panneau panneau-pause', hidden: true, 'aria-labelledby': 'titre-pause' },
        el('div', { class: 'grand-icone', 'aria-hidden': 'true' }, '⏸️'),
        el('h2', { id: 'titre-pause' }, 'Partie en pause'),
        el('p', { class: 'texte-doux' }, 'Prenez votre temps. Le chronomètre est arrêté.'),
        el('div', { class: 'ligne-boutons centre' }, boutonReprendre)
      );

      racine.append(
        el('div', { class: 'barre-jeu' },
          el('span', { class: 'compteur' }, 'Niveau ' + niveau),
          profil.reglages.chrono ? el('span', { class: 'groupe-chrono' }, chrono, boutonPause) : null,
          el('button', {
            class: 'btn btn-discret btn-icone',
            onclick: () => {
              JS.UI.modale('Comment jouer', [
                el('p', null, jeu.consigne),
                JS.Audio.voixDisponible() ? JS.UI.boutonLecture(jeu.consigne, 'Écouter la consigne') : null
              ]).then(() => JS.Audio.taire());
              JS.Audio.parler(jeu.consigne);
            }
          }, '❔ Consigne'),
          el('button', {
            class: 'btn btn-discret btn-icone',
            onclick: async () => {
              const ok = await JS.UI.confirmer('Arrêter la partie ?', 'Cette partie ne sera pas comptée.', 'Oui, arrêter', 'Continuer à jouer');
              if (ok && actif) afficherIntro(niveau);
            }
          }, '✖ Arrêter')
        ),
        panneauPause,
        message,
        zone
      );

      function basculerPause(valeur) {
        const pause = typeof valeur === 'boolean' ? valeur : !enPause;
        if (!actif || pause === enPause) return;
        enPause = pause;
        const maintenant = Date.now();
        if (enPause) {
          debutPause = maintenant;
          attentes.forEach(a => {
            clearTimeout(a.id);
            a.reste = Math.max(0, a.reste - (maintenant - a.lance));
          });
          JS.Audio.taire();
        } else {
          tempsEnPause += maintenant - debutPause;
          attentes.forEach(a => {
            a.lance = maintenant;
            a.id = setTimeout(a.declencher, a.reste);
          });
        }
        document.body.classList.toggle('partie-en-pause', enPause);
        panneauPause.hidden = !enPause;
        message.hidden = enPause;
        zone.hidden = enPause;
        boutonPause.textContent = enPause ? '▶' : '⏸';
        const libelle = enPause ? 'Reprendre la partie' : 'Mettre la partie en pause';
        boutonPause.setAttribute('aria-label', libelle);
        boutonPause.title = libelle;
        chrono.classList.toggle('compteur-pause', enPause);
        majChrono();
        if (enPause) boutonReprendre.focus();
        else boutonPause.focus();
      }

      function majChrono() {
        chronoTexte.textContent = '⏱ ' + JS.UI.formatDuree(tempsEcoule()) + (enPause ? ' (pause)' : '');
      }

      // Pendant la pause, le clavier ne doit pas agir sur le plateau (les jeux écoutent `document`).
      // Seuls les boutons de pause/reprise, la barre du jeu et les fenêtres modales restent utilisables.
      function filtreClavier(e) {
        if (!enPause) return;
        const cible = e.target;
        if (cible && cible.closest && cible.closest('dialog')) return;
        e.stopPropagation();
        if ((e.key === 'Enter' || e.key === ' ') && cible && cible.tagName === 'BUTTON') {
          e.preventDefault();
          cible.click();
        }
      }
      window.addEventListener('keydown', filtreClavier, true);

      const ctx = {
        root: zone,
        niveau,
        profil,
        reglages: profil.reglages,
        audio: JS.Audio,
        ui: JS.UI,
        /** Affiche un message (type : 'info' | 'succes' | 'erreur'). Texte vide pour effacer. */
        message(texte, type) {
          message.className = 'message' + (texte ? ' ' + (type || 'info') : '');
          message.textContent = texte || '';
        },
        /** setTimeout annulé automatiquement à la fin de la partie et suspendu pendant la pause. */
        plusTard(fn, ms) {
          const a = { reste: ms || 0, lance: Date.now(), id: null };
          a.declencher = () => {
            attentes.delete(a);
            if (actif) fn();
          };
          attentes.add(a);
          if (!enPause) a.id = setTimeout(a.declencher, a.reste);
          minuteries.push(() => { clearTimeout(a.id); attentes.delete(a); });
          return a;
        },
        /**
         * Après une bonne réponse : laisse le temps de lire le résultat, puis passe à la suite
         * (question, manche ou bilan). Délai commun à tous les jeux, ajustable au besoin.
         */
        enchainer(fn, ms) {
          return ctx.plusTard(fn, ms || DELAI_ENCHAINEMENT);
        },
        /** setInterval annulé automatiquement à la fin de la partie et ignoré pendant la pause. */
        repeter(fn, ms) {
          const id = setInterval(() => { if (actif && !enPause) fn(); }, ms);
          minuteries.push(() => clearInterval(id));
          return id;
        },
        actif: () => actif,
        /** Vrai tant que le joueur a mis la partie en pause. */
        enPause: () => enPause,
        terminer(resultat) {
          if (!actif) return;
          const duree = tempsEcoule();
          nettoyer();
          const bilan = JS.Progres.enregistrerPartie(jeu, niveau, resultat || {}, duree);
          afficherFin(niveau, resultat || {}, bilan, duree);
        }
      };

      function nettoyer() {
        if (!actif) return;
        actif = false;
        minuteries.forEach(f => f());
        window.removeEventListener('keydown', filtreClavier, true);
        document.body.classList.remove('partie-en-pause');
        if (typeof finJeu === 'function') {
          try { finJeu(); } catch (e) { console.error(e); }
        }
        JS.Audio.taire();
        nettoyagePartie = null;
      }
      nettoyagePartie = nettoyer;

      if (profil.reglages.chrono) {
        ctx.repeter(majChrono, 1000);
      }

      try {
        finJeu = jeu.start(ctx);
      } catch (e) {
        console.error(e);
        ctx.message('Un problème est survenu dans ce jeu. Vous pouvez revenir à l\'accueil.', 'erreur');
      }
    }

    /* ---------- Écran de fin ---------- */

    function afficherFin(niveau, resultat, bilan, duree) {
      racine.innerHTML = '';
      if (!bilan) {
        JS.UI.naviguer('profils');
        return;
      }
      if (bilan.etoiles >= 2) JS.Audio.victoire(); else JS.Audio.succes();

      const titres = {
        3: ['🎉', 'Bravo, c\'est excellent !'],
        2: ['👏', 'Très bien joué !'],
        1: ['🌱', 'Bien joué, chaque partie compte !']
      };
      const [icone, titre] = titres[bilan.etoiles];

      // Les indicateurs chiffrés tiennent sur une seule ligne, sous les détails de la partie.
      // Libellé et valeur passent à la ligne d'un bloc sur petit écran, sans couper les mots.
      const indicateur = (libelle, valeur, mention) => el('li', null,
        el('span', { class: 'indicateur-libelle' }, libelle + ' :'),
        ' ',
        el('span', { class: 'indicateur-valeur' }, valeur),
        mention ? el('span', { class: 'indicateur-record' }, mention) : null);
      const indicateurs = [indicateur('Réussite', Math.round(bilan.reussite * 100) + ' %')];
      if (bilan.score != null) {
        indicateurs.push(indicateur('Score', String(bilan.score), bilan.nouveauRecord ? 'Nouveau record ! 🏆'
          : (bilan.record > bilan.score ? '(record : ' + bilan.record + ')' : null)));
      }
      indicateurs.push(indicateur('Durée', JS.UI.formatDuree(duree).replace(/ /g, ' ')));

      const lignes = [];
      if (bilan.debloque) lignes.push('🔓 Le niveau ' + (niveau + 1) + ' est débloqué !');
      if (bilan.suggestion === 'descendre') {
        lignes.push('Ce niveau demande de l\'entraînement : vous pouvez revenir au niveau ' + (niveau - 1) + ' si vous le souhaitez.');
      }
      if (bilan.objectifAtteint) lignes.push('✅ Objectif du jour atteint, félicitations !');
      bilan.nouveauxBadges.forEach(b => lignes.push(b.icone + ' Nouveau badge : « ' + b.nom + ' »'));

      const peutMonter = niveau < jeu.niveauxMax && niveau + 1 <= bilan.niveauDebloque
        && (jeu.seuilDeblocage !== 1 || bilan.reussite >= 1);
      const boutonPrincipal = peutMonter && bilan.suggestion === 'monter'
        ? el('button', { class: 'btn btn-primaire btn-grand', onclick: () => lancer(niveau + 1) }, 'Niveau suivant ▶')
        : el('button', { class: 'btn btn-primaire btn-grand', onclick: () => lancer(niveau) }, '↻ Rejouer');

      racine.append(
        el('section', { class: 'panneau fin-partie anim-apparition', 'aria-labelledby': 'titre-fin' },
          el('div', { class: 'grand-icone', 'aria-hidden': 'true' }, icone),
          el('h2', { id: 'titre-fin' }, titre),
          JS.UI.etoiles(bilan.etoiles),
          resultat.details ? el('ul', { class: 'liste-bilan' }, el('li', null, resultat.details)) : null,
          el('ul', { class: 'liste-bilan indicateurs-bilan', 'aria-label': 'Résultats chiffrés' }, indicateurs),
          lignes.length ? el('ul', { class: 'liste-bilan' }, lignes.map(l => el('li', null, l))) : null,
          el('div', { class: 'ligne-boutons centre' },
            boutonPrincipal,
            peutMonter && bilan.suggestion === 'monter'
              ? el('button', { class: 'btn btn-grand', onclick: () => lancer(niveau) }, '↻ Rejouer ce niveau')
              : null,
            bilan.suggestion === 'descendre'
              ? el('button', { class: 'btn btn-grand', onclick: () => lancer(niveau - 1) }, '◀ Niveau ' + (niveau - 1))
              : null,
            el('button', { class: 'btn btn-grand', onclick: () => afficherIntro(niveau) }, 'Changer de niveau'),
            el('a', { class: 'btn btn-discret btn-grand', href: '#/accueil' }, 'Autres jeux')
          )
        )
      );
      racine.querySelector('.btn-primaire').focus();
    }

    afficherIntro(params[1] ? Number(params[1]) : null);
    return arreterPartie;
  });
})();
