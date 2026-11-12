/*
 * Mots fléchés : les définitions sont écrites dans la grille, avec une flèche vers leur mot.
 * ▶ : le mot s'écrit vers la droite ; ▼ : le mot s'écrit vers le bas.
 * Utilise le moteur des mots croisés (js/games/mots-croises.js, à charger avant).
 */
(function () {
  'use strict';

  // [nombre de mots, longueur maximale d'un mot, taille maximale de la grille (cases définition comprises),
  //  lettres données, description]
  const NIVEAUX = [
    [4, 6, 8, 'initiale', '4 mots courts, la première lettre de chaque mot est donnée'],
    [5, 7, 9, 'initiale', '5 mots, la première lettre de chaque mot est donnée'],
    [6, 8, 10, 'une', '6 mots, une lettre est donnée dans chaque mot'],
    [7, 8, 10, 'aucune', '7 mots, sans lettre donnée'],
    [8, 9, 11, 'aucune', '8 mots, sans lettre donnée'],
    [9, 9, 12, 'aucune', '9 mots, grande grille, sans lettre donnée']
  ];

  JS.Jeux.register({
    id: 'mots-fleches',
    nom: 'Mots fléchés',
    categorie: 'mots',
    icone: '➡️',
    description: 'Les définitions sont dans la grille : suivez les flèches !',
    consigne: 'Chaque case bleue contient une définition et une flèche : ▶ le mot s\'écrit vers la droite, ▼ il s\'écrit vers le bas. Touchez une définition pour choisir son mot, puis écrivez les lettres avec le clavier affiché sous la grille ou avec celui de l\'ordinateur. Les accents ne comptent pas. Un mot juste devient vert. Si une définition vous semble trop courte, le bouton « Définition détaillée » l\'explique plus longuement, au-dessus de la grille. Le bouton « Une lettre » vous en donne une, et « Vérifier » signale les lettres à corriger. Les lettres données par l\'aide ne comptent pas dans la réussite du mot.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => NIVEAUX[n - 1][4],
    // Exposés pour les tests.
    genererGrille: (niveau, idTheme) => JS.MotsCroises.genererGrille(NIVEAUX, niveau, idTheme, true),
    NIVEAUX,

    start(ctx) {
      return JS.MotsCroises.demarrer(ctx, { niveaux: NIVEAUX, fleches: true });
    }
  });
})();
