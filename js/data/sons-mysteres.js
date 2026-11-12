/* Données : sons du jeu « Le son mystère ». Fichiers dans audio/sons-mysteres/, sources dans CREDITS-SONS.md. */
window.JS = window.JS || {};

(function () {
  'use strict';
  JS.Donnees = JS.Donnees || {};

  /**
   * Univers sonores. leurres : réponses fausses mais plausibles, sans fichier audio ([emoji, nom]),
   * utilisées quand l'univers ne compte pas assez d'autres sons.
   */
  JS.Donnees.sonsMysteresUnivers = {
    animaux: {
      nom: 'Animaux',
      leurres: [['🐄', 'une vache'], ['🐑', 'un mouton'], ['🐴', 'un cheval'], ['🦆', 'un canard'], ['🐸', 'une grenouille'], ['🐷', 'un cochon']]
    },
    maison: {
      nom: 'Maison',
      leurres: [['🧺', 'une machine à laver'], ['💨', 'un sèche-cheveux'], ['🫖', 'une bouilloire qui siffle'], ['☕', 'un moulin à café'], ['🚽', 'une chasse d\'eau']]
    },
    autrefois: {
      nom: 'Objets d\'autrefois',
      leurres: [['🧵', 'une machine à coudre'], ['📻', 'un poste de radio'], ['💿', 'un tourne-disque'], ['🧾', 'une caisse enregistreuse']]
    },
    nature: {
      nom: 'Nature',
      leurres: [['🔥', 'un feu de cheminée'], ['🧊', 'la grêle'], ['🍂', 'des feuilles mortes'], ['💦', 'une cascade']]
    },
    transports: {
      nom: 'Transports',
      leurres: [['✈️', 'un avion'], ['🚜', 'un tracteur'], ['🚚', 'un camion'], ['⛴️', 'un bateau'], ['🚋', 'un tramway'], ['🚌', 'un autobus']]
    },
    quotidien: {
      nom: 'Vie quotidienne',
      leurres: [['👣', 'des pas dans l\'escalier'], ['😄', 'des rires'], ['🪙', 'des pièces de monnaie'], ['🔨', 'un marteau'], ['📖', 'des pages que l\'on tourne']]
    }
  };

  /**
   * Chaque son : { id (= nom du fichier .mp3), nom (avec son article), emoji, univers, phrase,
   *   facile  : son immédiatement reconnaissable, proposé aux niveaux 1 et 2,
   *   proches : sons du catalogue qui lui ressemblent (niveaux 5 et 6),
   *   leurres : réponses fausses et proches, sans fichier audio ([emoji, nom]),
   *   exclus  : sons jamais proposés ensemble, car l'extrait pourrait correspondre aux deux }.
   */
  JS.Donnees.sonsMysteres = [
    /* ----- Animaux ----- */
    { id: 'chien', nom: 'un chien qui aboie', emoji: '🐶', univers: 'animaux', facile: true,
      leurres: [['🐺', 'un loup qui hurle'], ['🦊', 'un renard']],
      phrase: 'Le chien aboie pour prévenir, pour jouer ou pour accueillir ceux qu\'il connaît.' },
    { id: 'chat', nom: 'un chat qui miaule', emoji: '🐱', univers: 'animaux', facile: true,
      leurres: [['👶', 'un bébé qui pleure'], ['🐐', 'une chèvre']],
      phrase: 'Le chat miaule surtout pour s\'adresser aux humains : pour réclamer son repas, une porte ouverte ou une caresse.' },
    { id: 'coq', nom: 'un coq qui chante', emoji: '🐓', univers: 'animaux', facile: true, proches: ['oies'],
      leurres: [['🐔', 'une poule qui caquette'], ['🦃', 'un dindon']],
      phrase: 'Dans les villages, le chant du coq annonce le lever du jour. En français, on l\'imite par « cocorico ».' },
    { id: 'oiseaux', nom: 'des oiseaux qui chantent', emoji: '🐦', univers: 'animaux', facile: true, exclus: ['chouette', 'oies'],
      leurres: [['🦗', 'des grillons'], ['🐝', 'des abeilles']],
      phrase: 'C\'est au printemps, au petit matin, que les oiseaux chantent le plus.' },
    { id: 'oies', nom: 'des oies', emoji: '🦆', univers: 'animaux', proches: ['coq'], exclus: ['oiseaux'],
      leurres: [['🦆', 'des canards'], ['🐔', 'des poules'], ['🕊️', 'des mouettes']],
      phrase: 'Les oies cacardent. Très bruyantes à l\'approche d\'un inconnu, elles ont longtemps servi de gardiennes dans les fermes.' },
    { id: 'chouette', nom: 'une chouette', emoji: '🦉', univers: 'animaux', exclus: ['oiseaux'],
      leurres: [['🕊️', 'un pigeon qui roucoule'], ['🐺', 'un loup qui hurle'], ['🐦', 'un coucou']],
      phrase: 'La chouette hulule la nuit. On l\'entend bien plus souvent qu\'on ne la voit.' },

    /* ----- Maison ----- */
    { id: 'horloge', nom: 'le tic-tac d\'une horloge', emoji: '🕰️', univers: 'maison', facile: true, proches: ['reveil'],
      leurres: [['🎼', 'un métronome'], ['💧', 'un robinet qui goutte'], ['⏲️', 'un minuteur de cuisine']],
      phrase: 'Le tic-tac régulier de l\'horloge rythmait le silence de bien des salons et des cuisines.' },
    { id: 'pendule', nom: 'une pendule qui sonne l\'heure', emoji: '🕛', univers: 'maison', proches: ['cloche', 'sonnette'],
      leurres: [['🎵', 'une boîte à musique'], ['🎹', 'un piano']],
      phrase: 'Les pendules et les comtoises sonnent les heures : il suffit de compter les coups pour savoir l\'heure sans regarder le cadran.' },
    { id: 'sonnette', nom: 'une sonnette d\'entrée', emoji: '🔔', univers: 'maison', facile: true, proches: ['pendule', 'sonnette-velo'],
      leurres: [['🛗', 'un ascenseur qui arrive'], ['⏲️', 'la sonnerie du four']],
      phrase: '« Ding dong » : quelqu\'un est à la porte ! La sonnette électrique a remplacé le heurtoir et la clochette.' },
    { id: 'aspirateur', nom: 'un aspirateur', emoji: '🧹', univers: 'maison', facile: true,
      leurres: [['💨', 'un sèche-cheveux'], ['🧺', 'une machine à laver qui essore'], ['🌀', 'un ventilateur']],
      phrase: 'L\'aspirateur est entré dans la plupart des foyers français au cours des années 1950 et 1960.' },
    { id: 'robinet', nom: 'l\'eau qui coule du robinet', emoji: '🚰', univers: 'maison', proches: ['douche', 'riviere', 'verre-eau'],
      leurres: [['🚽', 'une chasse d\'eau'], ['🫖', 'une bouilloire'], ['🌧️', 'une gouttière sous la pluie']],
      phrase: 'L\'eau courante au robinet n\'est arrivée dans de nombreuses campagnes qu\'après la Seconde Guerre mondiale.' },
    { id: 'douche', nom: 'une douche', emoji: '🚿', univers: 'maison', proches: ['robinet', 'pluie'],
      leurres: [['🪴', 'un arrosoir'], ['🚽', 'une chasse d\'eau'], ['🧺', 'une machine à laver']],
      phrase: 'Le bruit de la douche ressemble à celui d\'une forte pluie : des milliers de gouttes qui tombent en même temps.' },
    { id: 'verre-eau', nom: 'de l\'eau versée dans un verre', emoji: '🥛', univers: 'maison', proches: ['robinet'],
      leurres: [['☕', 'une cafetière qui passe'], ['🍲', 'une soupe qui mijote'], ['🚽', 'une chasse d\'eau']],
      phrase: 'Tendez l\'oreille : le son devient plus aigu à mesure que le verre se remplit.' },
    { id: 'cle-serrure', nom: 'une clé dans la serrure', emoji: '🔑', univers: 'maison', proches: ['porte-grince'],
      leurres: [['🪙', 'des pièces de monnaie'], ['🗄️', 'un tiroir que l\'on ferme'], ['💡', 'un interrupteur']],
      phrase: 'Le cliquetis de la clé dans la serrure : quelqu\'un rentre à la maison.' },
    { id: 'porte-grince', nom: 'une porte qui grince', emoji: '🚪', univers: 'maison', proches: ['cle-serrure'],
      leurres: [['🪑', 'un fauteuil à bascule'], ['🪜', 'un plancher qui craque'], ['🪟', 'un volet qui claque']],
      phrase: 'Une goutte d\'huile sur les gonds suffit en général à faire taire une porte qui grince.' },
    { id: 'toc-toc', nom: 'quelqu\'un qui frappe à la porte', emoji: '✊', univers: 'maison', facile: true,
      leurres: [['🔨', 'un marteau'], ['👣', 'des pas dans l\'escalier'], ['🥁', 'un tambour']],
      phrase: '« Toc, toc, toc ! — Qui est là ? » Avant les sonnettes, on frappait à la porte ou on utilisait un heurtoir.' },

    /* ----- Objets d'autrefois ----- */
    { id: 'telephone', nom: 'un téléphone ancien qui sonne', emoji: '☎️', univers: 'autrefois', facile: true, proches: ['reveil'],
      leurres: [['🚲', 'une sonnette de vélo'], ['🏫', 'la sonnerie de l\'école'], ['🚒', 'une alarme']],
      phrase: 'Dans les téléphones à cadran, la sonnerie venait d\'un petit marteau qui frappait deux timbres métalliques.' },
    { id: 'tonalite', nom: 'la tonalité du téléphone', emoji: '📞', univers: 'autrefois',
      leurres: [['📻', 'une radio mal réglée'], ['📺', 'la mire de la télévision'], ['🎻', 'un diapason']],
      phrase: 'On entendait cette tonalité en décrochant le combiné : elle indiquait que l\'on pouvait composer le numéro.' },
    { id: 'machine-a-ecrire', nom: 'une machine à écrire', emoji: '⌨️', univers: 'autrefois', facile: true, proches: ['clavier'],
      leurres: [['🧵', 'une machine à coudre'], ['🧾', 'une caisse enregistreuse'], ['📠', 'un télégraphe']],
      phrase: 'La machine à écrire servait à taper des lettres et des documents avant la généralisation des ordinateurs.' },
    { id: 'reveil', nom: 'un réveil qui sonne', emoji: '⏰', univers: 'autrefois', facile: true, proches: ['telephone', 'horloge'],
      leurres: [['⏲️', 'un minuteur de cuisine'], ['🏫', 'la sonnerie de l\'école'], ['🚒', 'une alarme incendie']],
      phrase: 'Il fallait remonter le réveil mécanique chaque soir avant de se coucher… et sa sonnerie ne laissait personne dormir.' },

    /* ----- Nature ----- */
    { id: 'pluie', nom: 'la pluie', emoji: '🌧️', univers: 'nature', facile: true, proches: ['riviere', 'vagues', 'vent', 'douche'], exclus: ['tonnerre'],
      leurres: [['🧊', 'la grêle'], ['🔥', 'un feu qui crépite'], ['🍳', 'une poêle qui grésille']],
      phrase: 'Le bruit de la pluie sur le toit ou contre les vitres est, pour beaucoup, l\'un des plus apaisants qui soient.' },
    { id: 'tonnerre', nom: 'le tonnerre', emoji: '⛈️', univers: 'nature', facile: true, exclus: ['pluie'],
      leurres: [['✈️', 'un avion qui passe'], ['🎆', 'un feu d\'artifice'], ['🪨', 'un éboulement']],
      phrase: 'Le tonnerre est le bruit de l\'éclair. Comme le son voyage moins vite que la lumière, on voit l\'éclair avant de l\'entendre.' },
    { id: 'vent', nom: 'le vent', emoji: '🌬️', univers: 'nature', proches: ['vagues', 'pluie'],
      leurres: [['🌀', 'un ventilateur'], ['🔥', 'un feu de cheminée'], ['✈️', 'un avion au loin']],
      phrase: 'Mistral, tramontane, bise ou autan : en France, bien des vents portent un nom.' },
    { id: 'vagues', nom: 'les vagues de la mer', emoji: '🌊', univers: 'nature', facile: true, proches: ['vent', 'pluie', 'riviere'],
      leurres: [['💦', 'une cascade'], ['⛲', 'une fontaine'], ['🚗', 'des voitures sur l\'autoroute']],
      phrase: 'Le va-et-vient des vagues sur le rivage évoque aussitôt les vacances au bord de la mer.' },
    { id: 'riviere', nom: 'une rivière', emoji: '🏞️', univers: 'nature', proches: ['pluie', 'vagues', 'robinet'],
      leurres: [['⛲', 'une fontaine'], ['💦', 'une cascade'], ['🚿', 'une douche']],
      phrase: 'Le murmure de l\'eau sur les cailloux accompagne les promenades au bord des rivières et des ruisseaux.' },

    /* ----- Transports ----- */
    { id: 'train', nom: 'un train qui passe', emoji: '🚆', univers: 'transports', facile: true, exclus: ['train-vapeur'],
      leurres: [['🚇', 'un métro'], ['🚋', 'un tramway'], ['🚚', 'un camion']],
      phrase: 'Longtemps, le passage des trains a été rythmé par le « tac-tac » des roues sur les joints des rails.' },
    { id: 'train-vapeur', nom: 'une locomotive à vapeur', emoji: '🚂', univers: 'transports', exclus: ['train'],
      leurres: [['🫖', 'une cocotte-minute'], ['⛴️', 'un bateau à vapeur'], ['🚜', 'un tracteur']],
      phrase: 'Les locomotives à vapeur ont circulé sur les lignes françaises jusque dans les années 1970.' },
    { id: 'sonnette-velo', nom: 'une sonnette de vélo', emoji: '🚲', univers: 'transports', facile: true, proches: ['sonnette'],
      leurres: [['🛎️', 'une sonnette de comptoir'], ['🐄', 'une clochette de vache'], ['🚋', 'un tramway']],
      phrase: '« Dring, dring ! » D\'un coup de pouce, la sonnette du vélo prévient les passants.' },
    { id: 'voiture', nom: 'une voiture qui démarre', emoji: '🚗', univers: 'transports', proches: ['moto'],
      leurres: [['🚜', 'un tracteur'], ['🌿', 'une tondeuse à gazon'], ['🚚', 'un camion']],
      phrase: 'Un tour de clé, le démarreur se lance et le moteur se met à tourner. Les premières automobiles, elles, se démarraient à la manivelle.' },
    { id: 'klaxon', nom: 'un klaxon', emoji: '📯', univers: 'transports', facile: true,
      leurres: [['🚂', 'un sifflet de train'], ['⛴️', 'une corne de bateau'], ['🎺', 'une trompette']],
      phrase: 'Le mot « klaxon » est à l\'origine une marque d\'avertisseurs sonores, passée dans le langage courant.' },
    { id: 'moto', nom: 'une moto', emoji: '🏍️', univers: 'transports', proches: ['voiture'],
      leurres: [['🛵', 'une mobylette'], ['🌿', 'une tondeuse à gazon'], ['🪚', 'une tronçonneuse']],
      phrase: 'Le bruit d\'une moto se reconnaît de loin, surtout lorsqu\'elle accélère.' },

    /* ----- Vie quotidienne ----- */
    { id: 'applaudissements', nom: 'des applaudissements', emoji: '👏', univers: 'quotidien', facile: true, proches: ['pluie'],
      leurres: [['🌧️', 'une averse'], ['🐎', 'des chevaux au galop'], ['🎆', 'un feu d\'artifice']],
      phrase: 'Au théâtre comme au concert, le public applaudit pour remercier les artistes.' },
    { id: 'cloche', nom: 'une cloche d\'église', emoji: '⛪', univers: 'quotidien', facile: true, proches: ['pendule'],
      leurres: [['🥁', 'un gong'], ['🏫', 'la cloche de l\'école'], ['🐄', 'une cloche de vache']],
      phrase: 'Les cloches de l\'église ont longtemps rythmé la vie des villages : les heures, les fêtes, les mariages.' },
    { id: 'couverts', nom: 'des couverts dans une assiette', emoji: '🍽️', univers: 'quotidien', proches: ['verres'],
      leurres: [['🪙', 'des pièces de monnaie'], ['🔑', 'un trousseau de clés'], ['🥄', 'une cuillère dans une tasse']],
      phrase: 'Le tintement des couverts contre l\'assiette : le bruit familier des repas partagés.' },
    { id: 'verres', nom: 'des verres qui trinquent', emoji: '🥂', univers: 'quotidien', proches: ['couverts'],
      leurres: [['🔔', 'une clochette'], ['🍾', 'un bouchon qui saute'], ['🪟', 'une vitre qui se brise']],
      phrase: '« À votre santé ! » On fait tinter les verres pour fêter un bon moment.' },
    { id: 'clavier', nom: 'un clavier d\'ordinateur', emoji: '💻', univers: 'quotidien', proches: ['machine-a-ecrire'],
      leurres: [['🧮', 'une calculatrice'], ['🌧️', 'des gouttes de pluie'], ['🎹', 'un piano']],
      phrase: 'Le clavier de l\'ordinateur a hérité de la disposition des touches de la machine à écrire : AZERTY en France.' }
  ];
})();
