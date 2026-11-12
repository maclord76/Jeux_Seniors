/* Décors locaux : aucune requête réseau, choix indépendant pour chaque joueur. */
(function () {
  'use strict';
  const themes = [
    { id: 'classique', nom: 'Classique', titre: 'Un espace tout simple', description: 'Le fond clair habituel, sans décor.' },
    { id: '1950', nom: 'Années 1950', titre: 'Au coin du poste de radio', description: 'Bois chaleureux, fauteuils fleuris et rideaux de dentelle.' },
    { id: '1960', nom: 'Années 1960', titre: 'Un air de modernité', description: 'Teck, pieds compas et tourne-disque : place aux lignes légères.' },
    { id: '1970', nom: 'Années 1970', titre: 'La couleur entre au salon', description: 'Orange, motifs géométriques et tapis moelleux.' },
    { id: '1980', nom: 'Années 1980', titre: 'Une soirée au salon', description: 'Velours côtelé, meubles en chêne et premières cassettes vidéo.' },
    { id: '1990', nom: 'Années 1990', titre: 'Comme à la maison', description: 'Canapé bleu, pin clair et chaîne hi-fi pour les CD.' }
  ];
  function obtenir(id) { return themes.find(t => t.id === id) || themes[0]; }
  function appliquer(id) { document.documentElement.dataset.theme = obtenir(id).id; }

  function selecteur() {
    const { el } = JS.UI;
    const statut = el('p', { class: 'visuellement-cache', role: 'status' });
    const boutons = themes.map(t => el('button', {
      type: 'button', class: 'btn choix-theme',
      'aria-pressed': 'false',
      onclick: () => {
        JS.Stockage.modifierReglages({ theme: t.id });
        appliquer(t.id);
        afficher(t.id);
        statut.textContent = 'Thème ' + t.nom + ' sélectionné et enregistré pour ce joueur.';
      }
    }, t.nom));
    function afficher(id) {
      const t = obtenir(id);
      boutons.forEach((b, i) => b.setAttribute('aria-pressed', String(themes[i].id === t.id)));

    }
    afficher(JS.Stockage.reglages().theme);
    return el('section', { class: 'salon panneau', 'aria-label': 'Mon salon par décennie' },
      el('div', { class: 'groupe-choix themes-choix', role: 'group', 'aria-label': 'Choisir une décennie' }, boutons),
      statut);
  }
  JS.Themes = { obtenir, appliquer, selecteur };
})();
