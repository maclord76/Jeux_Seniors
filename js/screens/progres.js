/* Écran « Mes progrès » : chiffres clés, graphiques SVG, tableau par jeu, badges. */
(function () {
  'use strict';
  const { el } = JS.UI;
  const NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attributs, texte) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attributs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (texte != null) n.textContent = texte;
    return n;
  }

  const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

  /** Barres : nombre de parties par jour sur les 14 derniers jours. */
  function graphiqueActivite(profil) {
    const aujourdhui = JS.Progres.jourLocal();
    const jours = [];
    for (let i = 13; i >= 0; i--) jours.push(JS.Progres.decalerJour(aujourdhui, -i));
    const valeurs = jours.map(j => profil.parties.filter(p => p.jour === j).length);
    const max = Math.max(profil.reglages.objectifJour, ...valeurs);

    const L = 640, H = 280, G = 36, B = 56, Hh = 24;
    const larg = (L - G) / jours.length;
    const hauteurUtile = H - B - Hh;
    const s = svg('svg', { viewBox: '0 0 ' + L + ' ' + H, class: 'graphique', role: 'img',
      'aria-label': 'Parties jouées par jour sur deux semaines : ' + valeurs.reduce((a, b) => a + b, 0) + ' au total.' });

    const yObjectif = Hh + hauteurUtile * (1 - profil.reglages.objectifJour / max);
    s.append(svg('line', { x1: G, x2: L, y1: yObjectif, y2: yObjectif, class: 'grille' }));
    s.append(svg('text', { x: L - 4, y: yObjectif - 6, 'text-anchor': 'end', 'font-size': 15 }, 'objectif'));
    s.append(svg('line', { x1: G, x2: L, y1: H - B, y2: H - B, class: 'axe' }));

    jours.forEach((jour, i) => {
      const [a, m, d] = jour.split('-').map(Number);
      const date = new Date(a, m - 1, d);
      const h = hauteurUtile * (valeurs[i] / max);
      const x = G + i * larg + larg * 0.15;
      if (valeurs[i]) {
        s.append(svg('rect', { x, y: H - B - h, width: larg * 0.7, height: h, rx: 4, class: 'barre' }));
        s.append(svg('text', { x: x + larg * 0.35, y: H - B - h - 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700 }, valeurs[i]));
      }
      s.append(svg('text', { x: x + larg * 0.35, y: H - B + 22, 'text-anchor': 'middle', 'font-size': 15 }, JOURS[date.getDay()]));
      s.append(svg('text', { x: x + larg * 0.35, y: H - B + 42, 'text-anchor': 'middle', 'font-size': 15 }, d));
    });
    return s;
  }

  /** Courbe : réussite (%) des 20 dernières parties d'un jeu. */
  function graphiqueReussite(profil, jeuId) {
    const parties = profil.parties.filter(p => p.jeu === jeuId).slice(-20);
    if (parties.length < 2) {
      return el('p', { class: 'texte-doux' }, parties.length
        ? 'Jouez encore une partie pour voir votre évolution.'
        : 'Aucune partie jouée à ce jeu pour le moment.');
    }
    const L = 640, H = 280, G = 64, B = 40, Hh = 20, D = 20;
    const pas = (L - G - D) / (parties.length - 1);
    const y = r => Hh + (H - B - Hh) * (1 - r);
    const s = svg('svg', { viewBox: '0 0 ' + L + ' ' + H, class: 'graphique', role: 'img',
      'aria-label': 'Réussite des ' + parties.length + ' dernières parties, de ' +
        Math.round(parties[0].reussite * 100) + ' % à ' + Math.round(parties[parties.length - 1].reussite * 100) + ' %.' });

    [0, 0.5, 1].forEach(r => {
      s.append(svg('line', { x1: G, x2: L - D, y1: y(r), y2: y(r), class: r === 0 ? 'axe' : 'grille' }));
      s.append(svg('text', { x: G - 10, y: y(r) + 6, 'text-anchor': 'end', 'font-size': 16 }, Math.round(r * 100) + ' %'));
    });
    const points = parties.map((p, i) => [G + i * pas, y(p.reussite)]);
    s.append(svg('polyline', { points: points.map(p => p.join(',')).join(' '), class: 'courbe' }));
    points.forEach(([px, py], i) => {
      const c = svg('circle', { cx: px, cy: py, r: 7, class: 'point' });
      c.append(svg('title', null, 'Niveau ' + parties[i].niveau + ' : ' + Math.round(parties[i].reussite * 100) + ' %'));
      s.append(c);
    });
    s.append(svg('text', { x: G, y: H - 10, 'font-size': 15 }, 'plus ancienne'));
    s.append(svg('text', { x: L - D, y: H - 10, 'text-anchor': 'end', 'font-size': 15 }, 'plus récente'));
    return s;
  }

  JS.UI.ecran('progres', function (racine) {
    const profil = JS.Stockage.profilActif();
    const jeux = JS.Jeux.liste();
    const tempsTotal = Object.values(profil.jeux).reduce((t, e) => t + (e.tempsTotal || 0), 0);
    const serie = JS.Progres.serie(profil);
    const obtenus = new Map(profil.badges.map(b => [b.id, b.date]));
    const joues = jeux.filter(j => profil.jeux[j.id]);

    racine.append(
      el('div', { class: 'titre-page' }, el('h1', null, 'Mes progrès')),
      el('div', { class: 'grille-stats' },
        el('div', { class: 'panneau' }, el('p', { class: 'chiffre' }, profil.totalParties || 0), el('p', null, 'parties jouées')),
        el('div', { class: 'panneau' }, el('p', { class: 'chiffre' }, JS.UI.formatDuree(tempsTotal)), el('p', null, 'de jeu au total')),
        el('div', { class: 'panneau' }, el('p', { class: 'chiffre' }, '🔥 ' + serie.actuelle), el('p', null, (serie.actuelle > 1 ? 'jours' : 'jour') + ' de suite (record : ' + serie.meilleure + ')')),
        el('div', { class: 'panneau' }, el('p', { class: 'chiffre' }, obtenus.size + ' / ' + JS.Progres.BADGES.length), el('p', null, 'badges obtenus'))
      ),
      el('section', { class: 'panneau', 'aria-labelledby': 'titre-activite' },
        el('h2', { id: 'titre-activite' }, 'Mes deux dernières semaines'),
        graphiqueActivite(profil))
    );

    if (joues.length) {
      const zoneCourbe = el('div');
      const selecteur = el('select', {
        id: 'choix-jeu-courbe',
        onchange: e => { zoneCourbe.innerHTML = ''; zoneCourbe.append(graphiqueReussite(profil, e.target.value)); }
      }, joues.map(j => el('option', { value: j.id }, j.nom)));
      const dernier = profil.parties.length ? profil.parties[profil.parties.length - 1].jeu : joues[0].id;
      selecteur.value = joues.some(j => j.id === dernier) ? dernier : joues[0].id;
      zoneCourbe.append(graphiqueReussite(profil, selecteur.value));

      racine.append(
        el('section', { class: 'panneau', 'aria-labelledby': 'titre-courbe' },
          el('h2', { id: 'titre-courbe' }, 'Évolution de ma réussite'),
          el('label', { for: 'choix-jeu-courbe' }, 'Jeu'),
          selecteur,
          zoneCourbe),
        el('section', { class: 'panneau', 'aria-labelledby': 'titre-tableau' },
          el('h2', { id: 'titre-tableau' }, 'Jeu par jeu'),
          el('div', { class: 'defilement-horizontal' },
            el('table', { class: 'tableau-jeux' },
              el('thead', null, el('tr', null,
                el('th', { scope: 'col' }, 'Jeu'), el('th', { scope: 'col' }, 'Niveau'),
                el('th', { scope: 'col' }, 'Parties'), el('th', { scope: 'col' }, 'Étoiles'), el('th', { scope: 'col' }, 'Temps'))),
              el('tbody', null, joues.map(j => {
                const e = profil.jeux[j.id];
                return el('tr', null,
                  el('th', { scope: 'row' }, el('a', { href: '#/jeu/' + j.id }, j.icone + ' ' + j.nom)),
                  el('td', null, e.niveauDebloque + ' / ' + j.niveauxMax),
                  el('td', null, e.parties),
                  el('td', null, JS.UI.etoiles(JS.Progres.meilleuresEtoiles(profil, j.id))),
                  el('td', null, JS.UI.formatDuree(e.tempsTotal)));
              }))
            ))
        )
      );
    } else {
      racine.append(el('section', { class: 'panneau' },
        el('p', null, 'Vous n\'avez pas encore joué. Vos résultats apparaîtront ici après votre première partie.'),
        el('a', { class: 'btn btn-primaire', href: '#/accueil' }, 'Choisir un jeu')));
    }

    racine.append(el('section', { class: 'panneau', 'aria-labelledby': 'titre-badges' },
      el('h2', { id: 'titre-badges' }, 'Mes badges'),
      el('div', { class: 'grille-badges' }, JS.Progres.BADGES.map(b => {
        const date = obtenus.get(b.id);
        return el('div', { class: 'badge' + (date ? '' : ' verrouille') },
          el('span', { class: 'icone', 'aria-hidden': 'true' }, b.icone),
          el('div', null,
            el('div', { class: 'nom' }, b.nom, date ? '' : el('span', { class: 'visuellement-cache' }, ' (pas encore obtenu)')),
            el('div', { class: 'desc' }, date ? 'Obtenu le ' + new Date(date).toLocaleDateString('fr-FR') : b.description)));
      }))
    ));
  });
})();
