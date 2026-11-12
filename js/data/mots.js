/* Données : mots français courants, regroupés par thèmes (mots mêlés, mot mélangé…). */
window.JS = window.JS || {};

(function () {
  'use strict';
  JS.Donnees = JS.Donnees || {};

  /**
   * Chaque thème : { nom, icone, mots }. Mots de 3 à 10 lettres, sans espace ni trait d'union,
   * écrits avec leurs accents (forme affichée au joueur).
   */
  JS.Donnees.mots = {
    cuisine: {
      nom: 'Cuisine',
      icone: '🍳',
      mots: ['casserole', 'poêle', 'fourchette', 'couteau', 'cuillère', 'assiette', 'saladier', 'louche',
        'fouet', 'passoire', 'râpe', 'tablier', 'recette', 'farine', 'beurre', 'sucre', 'poivre', 'four',
        'gâteau', 'tarte', 'soupe', 'omelette', 'crêpe', 'sauce', 'bouillon', 'marmite', 'moutarde',
        'vinaigre', 'huile', 'levure', 'sel', 'bol', 'verre', 'tasse', 'plat']
    },
    jardin: {
      nom: 'Jardin',
      icone: '🌳',
      mots: ['arrosoir', 'râteau', 'bêche', 'pelle', 'brouette', 'sécateur', 'tondeuse', 'potager',
        'graine', 'semis', 'pelouse', 'haie', 'gazon', 'serre', 'compost', 'tuyau', 'binette', 'fourche',
        'allée', 'bassin', 'arbre', 'buisson', 'racine', 'feuille', 'terreau', 'cabane', 'rosier',
        'verger', 'pommier', 'ver', 'banc', 'nichoir', 'treille', 'tonnelle']
    },
    animaux: {
      nom: 'Animaux',
      icone: '🐾',
      mots: ['chien', 'chat', 'cheval', 'vache', 'mouton', 'cochon', 'lapin', 'poule', 'canard', 'renard',
        'loup', 'ours', 'lion', 'tigre', 'girafe', 'zèbre', 'singe', 'éléphant', 'souris', 'hérisson',
        'écureuil', 'tortue', 'dauphin', 'baleine', 'abeille', 'papillon', 'hibou', 'chèvre', 'âne',
        'cerf', 'grenouille', 'escargot', 'pigeon', 'moineau', 'aigle', 'castor', 'chouette']
    },
    maison: {
      nom: 'Maison',
      icone: '🏠',
      mots: ['cuisine', 'salon', 'chambre', 'grenier', 'cave', 'escalier', 'fenêtre', 'porte', 'toit',
        'cheminée', 'couloir', 'garage', 'balcon', 'fauteuil', 'canapé', 'table', 'chaise', 'armoire',
        'buffet', 'lampe', 'tapis', 'rideau', 'miroir', 'horloge', 'placard', 'étagère', 'lit',
        'oreiller', 'couette', 'bougie', 'volet', 'plafond', 'parquet']
    },
    metiers: {
      nom: 'Métiers',
      icone: '🧰',
      mots: ['boulanger', 'boucher', 'facteur', 'médecin', 'infirmier', 'pompier', 'plombier', 'maçon',
        'menuisier', 'peintre', 'coiffeur', 'fermier', 'pêcheur', 'jardinier', 'cuisinier', 'serveur',
        'libraire', 'notaire', 'avocat', 'juge', 'dentiste', 'pharmacien', 'couturier', 'horloger',
        'épicier', 'fleuriste', 'pilote', 'marin', 'berger', 'potier', 'forgeron', 'cordonnier',
        'charcutier']
    },
    pays: {
      nom: 'Pays',
      icone: '🌍',
      mots: ['France', 'Italie', 'Espagne', 'Portugal', 'Belgique', 'Suisse', 'Allemagne', 'Autriche',
        'Grèce', 'Irlande', 'Pologne', 'Suède', 'Norvège', 'Danemark', 'Russie', 'Chine', 'Japon', 'Inde',
        'Brésil', 'Argentine', 'Mexique', 'Canada', 'Égypte', 'Maroc', 'Tunisie', 'Algérie', 'Sénégal',
        'Australie', 'Turquie', 'Pérou', 'Chili', 'Cuba', 'Islande', 'Finlande', 'Hongrie']
    },
    musique: {
      nom: 'Musique',
      icone: '🎵',
      mots: ['piano', 'violon', 'guitare', 'flûte', 'trompette', 'tambour', 'harpe', 'orgue', 'accordéon',
        'batterie', 'clarinette', 'saxophone', 'harmonica', 'chanson', 'refrain', 'mélodie', 'rythme',
        'note', 'partition', 'orchestre', 'chorale', 'opéra', 'valse', 'tango', 'concert', 'musicien',
        'disque', 'micro', 'chanteur', 'solfège', 'cymbale', 'triangle', 'xylophone', 'banjo']
    },
    couleurs: {
      nom: 'Couleurs',
      icone: '🎨',
      mots: ['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet', 'rose', 'blanc', 'noir', 'gris',
        'marron', 'beige', 'turquoise', 'pourpre', 'mauve', 'lilas', 'ocre', 'kaki', 'indigo', 'émeraude',
        'carmin', 'bordeaux', 'corail', 'ivoire', 'crème', 'doré', 'argenté', 'azur', 'safran',
        'vermillon', 'écarlate', 'magenta']
    },
    vetements: {
      nom: 'Vêtements',
      icone: '👗',
      mots: ['chemise', 'pantalon', 'jupe', 'robe', 'veste', 'manteau', 'pull', 'gilet', 'chapeau',
        'casquette', 'écharpe', 'gant', 'chaussette', 'chaussure', 'botte', 'sandale', 'pantoufle',
        'cravate', 'ceinture', 'blouse', 'short', 'maillot', 'pyjama', 'béret', 'bonnet', 'foulard',
        'costume', 'tailleur', 'collant', 'chemisier', 'sabot', 'espadrille', 'pardessus', 'châle']
    },
    fleurs: {
      nom: 'Fleurs',
      icone: '🌸',
      mots: ['rose', 'tulipe', 'marguerite', 'jonquille', 'lilas', 'muguet', 'violette', 'pivoine',
        'orchidée', 'lavande', 'coquelicot', 'bleuet', 'jasmin', 'iris', 'dahlia', 'géranium', 'glaïeul',
        'hortensia', 'mimosa', 'myosotis', 'pensée', 'primevère', 'tournesol', 'camélia', 'magnolia',
        'pâquerette', 'capucine', 'anémone', 'bégonia', 'azalée', 'glycine', 'jacinthe', 'renoncule', 'lys']
    },
    voyage: {
      nom: 'Voyage',
      icone: '🧳',
      mots: ['valise', 'avion', 'train', 'bateau', 'gare', 'aéroport', 'billet', 'passeport', 'carte',
        'hôtel', 'plage', 'montagne', 'croisière', 'bagage', 'touriste', 'guide', 'boussole', 'vacances',
        'séjour', 'frontière', 'douane', 'escale', 'camping', 'tente', 'autocar', 'caravane', 'excursion',
        'musée', 'souvenir', 'photo', 'route', 'randonnée', 'paquebot', 'sac']
    },
    fruits: {
      nom: 'Fruits et légumes',
      icone: '🍎',
      mots: ['pomme', 'poire', 'banane', 'cerise', 'fraise', 'framboise', 'abricot', 'pêche', 'prune',
        'raisin', 'melon', 'citron', 'ananas', 'kiwi', 'carotte', 'poireau', 'navet', 'tomate', 'salade',
        'radis', 'haricot', 'courgette', 'aubergine', 'poivron', 'chou', 'oignon', 'ail', 'épinard',
        'céleri', 'artichaut', 'potiron', 'concombre', 'asperge', 'myrtille', 'figue', 'mangue']
    }
  };

  /**
   * Forme « grille » d'un mot : majuscules sans accents, lettres A à Z uniquement.
   * motEnGrille('Poêle') → 'POELE' ; motEnGrille('glaïeul') → 'GLAIEUL'.
   */
  JS.Donnees.motEnGrille = function (mot) {
    return String(mot)
      .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/æ/g, 'ae').replace(/Æ/g, 'AE')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toUpperCase().replace(/[^A-Z]/g, '');
  };
})();
