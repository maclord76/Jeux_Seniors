/* Accueil : résumé du jour, jeu du jour et catalogue des jeux par famille. */
(function () {
  'use strict';
  const { el } = JS.UI;

  function salutation() {
    const h = new Date().getHours();
    return h < 18 ? 'Bonjour' : 'Bonsoir';
  }

  function carteJeu(jeu, profil) {
    const etat = profil.jeux[jeu.id];
    const etoiles = JS.Progres.meilleuresEtoiles(profil, jeu.id);
    return el('a', { class: 'carte-jeu', href: '#/jeu/' + jeu.id },
      el('span', { class: 'icone', 'aria-hidden': 'true' }, jeu.icone),
      el('span', { class: 'nom' }, jeu.nom),
      el('span', { class: 'description' }, jeu.description || ''),
      el('span', { class: 'infos' },
        etat
          ? el('span', null, 'Niveau ' + etat.niveauDebloque + ' / ' + jeu.niveauxMax)
          : el('span', { class: 'pastille' }, 'Nouveau'),
        etat ? JS.UI.etoiles(etoiles) : null
      )
    );
  }

  JS.UI.ecran('accueil', function (racine) {
    const profil = JS.Stockage.profilActif();
    const duJour = JS.Progres.partiesDuJour(profil).length;
    const objectif = profil.reglages.objectifJour;
    const serie = JS.Progres.serie(profil);
    const jeuDuJour = JS.Progres.jeuDuJour();

    // Sélecteur « Emojis / Photos », enregistré dans les réglages du joueur.
    const modes = [
      { valeur: 'emojis', texte: '😀 Emojis' },
      { valeur: 'photos', texte: '📷 Photos' }
    ];
    const boutonsModes = modes.map(m => el('button', {
      type: 'button',
      class: 'btn',
      'aria-pressed': String(profil.reglages.visuels === m.valeur),
      onclick: () => {
        JS.Stockage.modifierReglages({ visuels: m.valeur });
        boutonsModes.forEach((b, i) => b.setAttribute('aria-pressed', String(modes[i].valeur === m.valeur)));
        JS.UI.toast(m.valeur === 'photos'
          ? 'Mode Photos : les jeux qui en ont affichent de vraies photos.'
          : 'Mode Emojis : les jeux affichent des dessins.');
      }
    }, m.texte));

    racine.append(
      el('div', { class: 'titre-page' },
        el('h1', null, salutation() + ' ' + profil.prenom + ' ', el('span', { 'aria-hidden': 'true' }, profil.avatar)),
        el('div', { class: 'bascule-visuels' },
          el('span', { id: 'etiquette-visuels' }, 'Images :'),
          el('div', { class: 'groupe-choix', role: 'group', 'aria-labelledby': 'etiquette-visuels' }, boutonsModes))
      ),
      el('div', { class: 'resume-jour' },
        el('section', { class: 'panneau', 'aria-label': 'Objectif du jour' },
          el('h2', null, 'Objectif du jour'),
          el('p', { class: 'chiffre' }, Math.min(duJour, objectif) + ' / ' + objectif),
          el('div', { class: 'jauge', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(objectif), 'aria-valuenow': String(Math.min(duJour, objectif)), 'aria-label': 'Parties jouées aujourd\'hui' },
            el('span', { style: { width: Math.min(100, (duJour / objectif) * 100) + '%' } })),
          el('p', { class: 'texte-doux' }, duJour >= objectif
            ? 'Objectif atteint, bravo ! Vous pouvez continuer si le cœur vous en dit.'
            : 'Une quinzaine de minutes par jour suffit pour entretenir sa mémoire.')
        ),
        el('section', { class: 'panneau', 'aria-label': 'Régularité' },
          el('h2', null, 'Régularité'),
          el('p', { class: 'chiffre' }, '🔥 ' + JS.UI.pluriel(serie.actuelle, 'jour')),
          el('p', { class: 'texte-doux' }, serie.actuelle === 0
            ? 'Jouez aujourd\'hui pour commencer une série.'
            : serie.joueAujourdhui
              ? 'De suite ! Revenez demain pour continuer.'
              : 'Jouez aujourd\'hui pour prolonger votre série.')
        )
      ),
      jeuDuJour ? el('a', { class: 'panneau carte-jeu jeu-du-jour', href: '#/jeu/' + jeuDuJour.id },
        el('span', { class: 'icone', 'aria-hidden': 'true' }, jeuDuJour.icone),
        el('span', null,
          el('span', { class: 'pastille' }, 'Jeu du jour'),
          el('span', { class: 'nom', style: { display: 'block' } }, jeuDuJour.nom),
          el('span', { class: 'description' }, jeuDuJour.description || ''))
      ) : null
    );

    JS.Jeux.CATEGORIES.forEach(categorie => {
      const jeux = JS.Jeux.parCategorie(categorie.id);
      if (!jeux.length) return;
      racine.append(el('section', { class: 'categorie', 'aria-labelledby': 'cat-' + categorie.id },
        el('header', null,
          el('h2', { id: 'cat-' + categorie.id }, el('span', { 'aria-hidden': 'true' }, categorie.icone + ' '), categorie.nom),
          el('span', { class: 'texte-doux' }, categorie.description)),
        el('div', { class: 'grille-jeux' }, jeux.map(j => carteJeu(j, profil)))
      ));
    });
  });
})();
