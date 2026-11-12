/* Données : questions de culture générale et de souvenirs (quiz à 4 choix). */
window.JS = window.JS || {};

(function () {
  'use strict';
  JS.Donnees = JS.Donnees || {};

  JS.Donnees.quizCategories = {
    chansons: { nom: 'Chansons et artistes', icone: '🎤' },
    cinema: { nom: 'Cinéma et télévision', icone: '🎬' },
    histoire: { nom: 'Histoire de France', icone: '📜' },
    geographie: { nom: 'Géographie de France', icone: '🗺️' },
    cuisine: { nom: 'Cuisine et terroir', icone: '🧀' },
    autrefois: { nom: "Vie d'autrefois", icone: '🕰️' },
    nature: { nom: 'Nature', icone: '🌿' },
    sport: { nom: 'Sport', icone: '🚴' }
  };

  /*
   * Dans la liste ci-dessous, la bonne réponse est toujours écrite EN PREMIER (plus simple à relire).
   * Sa position est ensuite décalée d'une question à l'autre : le résultat respecte le format
   * { categorie, question, choix: [4], bonne: index, difficulte: 1-3, anecdote, illustration? }.
   *
   * Le 6e paramètre, facultatif, est le titre exact d'un article de Wikipédia en français dont
   * l'image principale illustre la BONNE réponse (personne, lieu, plat, animal, objet…).
   * Il est omis quand une image n'aurait pas de sens (nombre, date, idée abstraite…).
   */
  const brut = [];
  const Q = (categorie, difficulte, question, choix, anecdote, illustration) =>
    brut.push({ categorie, difficulte, question, choix, anecdote, illustration });

  /* ---------- Chansons et artistes ---------- */
  Q('chansons', 1, "Qui chantait « La Vie en rose » ?", ["Édith Piaf", "Dalida", "Juliette Gréco", "Barbara"],
    "Édith Piaf en a elle-même écrit les paroles ; la chanson a fait le tour du monde.", "Édith Piaf");
  Q('chansons', 1, "Quel chanteur belge a écrit et interprété « Ne me quitte pas » ?", ["Jacques Brel", "Georges Brassens", "Charles Aznavour", "Léo Ferré"],
    "Jacques Brel l'a enregistrée en 1959. Elle a été reprise dans le monde entier.", "Jacques Brel");
  Q('chansons', 1, "Qui chantait « Les Champs-Élysées » en 1969 ?", ["Joe Dassin", "Claude François", "Michel Sardou", "Hugues Aufray"],
    "Joe Dassin, né à New York, a adapté une chanson anglaise intitulée « Waterloo Road ».", "Joe Dassin");
  Q('chansons', 1, "Quel chanteur a créé « Comme d'habitude » ?", ["Claude François", "Johnny Hallyday", "Eddy Mitchell", "Sacha Distel"],
    "Adaptée en anglais, elle est devenue « My Way », rendue célèbre par Frank Sinatra.", "Claude François");
  Q('chansons', 2, "Quel chanteur à la moustache et à la pipe a écrit « Les Copains d'abord » ?", ["Georges Brassens", "Jacques Brel", "Serge Gainsbourg", "Boby Lapointe"],
    "Georges Brassens l'a écrite pour le film « Les Copains » d'Yves Robert, sorti en 1964.", "Georges Brassens");
  Q('chansons', 2, "Sous quel nom de scène connaît-on Jean-Philippe Smet ?", ["Johnny Hallyday", "Eddy Mitchell", "Dick Rivers", "Claude François"],
    "Né à Paris en 1943, Johnny Hallyday a fait découvrir le rock'n'roll à des millions de Français.", "Johnny Hallyday");
  Q('chansons', 2, "Quel chanteur a présenté à la télévision l'émission de cinéma « La Dernière Séance » ?", ["Eddy Mitchell", "Johnny Hallyday", "Jacques Dutronc", "Gilbert Bécaud"],
    "De 1982 à 1998, Eddy Mitchell y présentait de vieux films américains, avec dessin animé et entracte.", "Eddy Mitchell");
  Q('chansons', 1, "Qui chantait « La Bohème » en 1965 ?", ["Charles Aznavour", "Gilbert Bécaud", "Jean Ferrat", "Serge Reggiani"],
    "La chanson évoque la jeunesse insouciante d'un peintre à Montmartre.", "Charles Aznavour");
  Q('chansons', 2, "Quel chanteur était surnommé « Monsieur 100 000 volts » ?", ["Gilbert Bécaud", "Claude François", "Johnny Hallyday", "Yves Montand"],
    "On le surnommait ainsi pour son énergie sur scène. On lui doit « Et maintenant » et « Nathalie ».", "Gilbert Bécaud");
  Q('chansons', 2, "Dans quel pays est née la chanteuse Dalida ?", ["L'Égypte", "L'Italie", "La Grèce", "Le Liban"],
    "Née au Caire en 1933 de parents italiens, elle a été élue Miss Égypte en 1954.");
  Q('chansons', 2, "Qui chantait « Le Poinçonneur des Lilas » ?", ["Serge Gainsbourg", "Boris Vian", "Jacques Dutronc", "Serge Lama"],
    "Dans cette chanson de 1958, Gainsbourg raconte la vie d'un employé du métro parisien qui « fait des trous ».", "Serge Gainsbourg");
  Q('chansons', 2, "Quel chanteur a chanté « La Montagne » en 1964 ?", ["Jean Ferrat", "Hugues Aufray", "Mouloudji", "Pierre Perret"],
    "Jean Ferrat y évoque les jeunes qui quittent leur village pour la ville.", "Jean Ferrat");
  Q('chansons', 2, "Quelle chanteuse a connu son premier grand succès avec « L'école est finie » ?", ["Sheila", "Sylvie Vartan", "France Gall", "Françoise Hardy"],
    "Sheila est devenue l'une des idoles de la génération « yé-yé » au début des années 1960.", "Sheila");
  Q('chansons', 3, "Avec quelle chanson France Gall a-t-elle gagné le concours Eurovision en 1965 ?", ["« Poupée de cire, poupée de son »", "« Laisse tomber les filles »", "« Sacré Charlemagne »", "« Ella, elle l'a »"],
    "La chanson, écrite par Serge Gainsbourg, représentait le Luxembourg.", "France Gall");
  Q('chansons', 1, "Qui chantait « Tous les garçons et les filles » en 1962 ?", ["Françoise Hardy", "Sylvie Vartan", "Sheila", "Marie Laforêt"],
    "Ce premier succès de Françoise Hardy s'est vendu à des centaines de milliers d'exemplaires.", "Françoise Hardy");
  Q('chansons', 3, "Qui a écrit les paroles de la chanson « Les Feuilles mortes » ?", ["Jacques Prévert", "Boris Vian", "Louis Aragon", "Jean Cocteau"],
    "La musique est de Joseph Kosma. Yves Montand l'a chantée, puis elle a fait le tour du monde.", "Jacques Prévert");
  Q('chansons', 2, "Quel chanteur et acteur a rendu célèbre « Salade de fruits » ?", ["Bourvil", "Fernandel", "Luis Mariano", "Annie Cordy"],
    "Bourvil l'a enregistrée en 1959 : « Salade de fruits, jolie, jolie, jolie… »", "Bourvil");
  Q('chansons', 2, "Quel ténor a popularisé la chanson « Mexico » ?", ["Luis Mariano", "Tino Rossi", "André Claveau", "Georges Guétary"],
    "Elle vient de l'opérette « Le Chanteur de Mexico », créée en 1951.", "Luis Mariano");
  Q('chansons', 1, "Qui a rendu célèbre la chanson « Petit Papa Noël » ?", ["Tino Rossi", "Luis Mariano", "Charles Trenet", "Yves Montand"],
    "Créée en 1946, c'est l'un des disques les plus vendus en France. Tino Rossi était né à Ajaccio.", "Tino Rossi");
  Q('chansons', 2, "Quel chanteur était surnommé « le Fou chantant » ?", ["Charles Trenet", "Bourvil", "Maurice Chevalier", "Henri Salvador"],
    "Charles Trenet est l'auteur de « La Mer » et de « Douce France ».", "Charles Trenet");
  Q('chansons', 2, "Dans quel pays se trouvent les lacs du Connemara chantés par Michel Sardou ?", ["L'Irlande", "L'Écosse", "Le Canada", "La Norvège"],
    "« Les Lacs du Connemara », sortie en 1981, est l'un des plus grands succès de Michel Sardou.");
  Q('chansons', 2, "Comment s'appelaient les danseuses de Claude François ?", ["Les Clodettes", "Les Claudines", "Les Françoises", "Les Cloclottes"],
    "Elles l'accompagnaient sur scène et à la télévision dans des chorégraphies très rythmées.");
  Q('chansons', 2, "Quel chanteur a popularisé la chanson de marins « Santiano » ?", ["Hugues Aufray", "Michel Delpech", "Gérard Lenorman", "Alain Souchon"],
    "Hugues Aufray l'a enregistrée en 1961 ; elle est toujours chantée en chœur aujourd'hui.", "Hugues Aufray");
  Q('chansons', 1, "Quelle chanteuse grecque aux grandes lunettes a mené une carrière internationale ?", ["Nana Mouskouri", "Dalida", "Mireille Mathieu", "Rika Zaraï"],
    "Nana Mouskouri a chanté en de nombreuses langues et vendu des millions de disques.", "Nana Mouskouri");
  Q('chansons', 2, "De quelle ville est originaire la chanteuse Mireille Mathieu ?", ["Avignon", "Marseille", "Nîmes", "Arles"],
    "Révélée en 1965 à la télévision, elle est surnommée « la demoiselle d'Avignon ».", "Palais des papes d'Avignon");
  Q('chansons', 2, "Quelle chanteuse a écrit et interprété « L'Aigle noir » ?", ["Barbara", "Juliette Gréco", "Anne Sylvestre", "Nicole Croisille"],
    "Barbara l'a enregistrée en 1970 ; ce fut l'un de ses plus grands succès.", "Barbara");
  Q('chansons', 3, "Quel chanteur a sorti la chanson « Le France » en 1975, en hommage au paquebot ?", ["Michel Sardou", "Julien Clerc", "Serge Lama", "Michel Fugain"],
    "Le paquebot France venait d'être désarmé et immobilisé au Havre.", "Michel Sardou");

  Q('chansons', 1, "Quelle chanteuse surnommait-on « la Môme » à ses débuts ?", ["Édith Piaf", "Barbara", "Mistinguett", "Fréhel"],
    "On l'appelait « la Môme Piaf » : en argot, un « piaf » est un moineau.", "Édith Piaf");
  Q('chansons', 1, "Qui chantait « Il venait d'avoir 18 ans » en 1973 ?", ["Dalida", "Mireille Mathieu", "Sheila", "Nicole Croisille"],
    "Dalida a été l'une des chanteuses préférées des Français pendant plus de trente ans.", "Dalida");
  Q('chansons', 1, "Qui chantait « Allumer le feu » en 1998 ?", ["Johnny Hallyday", "Eddy Mitchell", "Michel Sardou", "Florent Pagny"],
    "Cette chanson est devenue l'un des grands moments de ses concerts au Stade de France.", "Johnny Hallyday");
  Q('chansons', 1, "Quelle chanteuse québécoise a chanté « Pour que tu m'aimes encore » en 1995 ?", ["Céline Dion", "Isabelle Boulay", "Lynda Lemay", "Ginette Reno"],
    "La chanson a été écrite pour elle par Jean-Jacques Goldman.", "Céline Dion");
  Q('chansons', 1, "Qui chantait « Aline » en 1965 ?", ["Christophe", "Hervé Vilard", "Antoine", "Richard Anthony"],
    "On lui doit aussi « Les Mots bleus », sortie en 1974.", "Christophe (chanteur)");
  Q('chansons', 2, "Quel chanteur, toujours coiffé d'un canotier, a fait carrière jusqu'à Hollywood ?", ["Maurice Chevalier", "Charles Trenet", "Yves Montand", "Fernandel"],
    "On lui doit notamment « Prosper » et « Ma pomme ».", "Maurice Chevalier");
  Q('chansons', 2, "Dans quelle ville est né Georges Brassens ?", ["Sète", "Montpellier", "Marseille", "Toulouse"],
    "Sa ville natale lui a consacré un musée, l'Espace Georges-Brassens.", "Sète");
  Q('chansons', 2, "Qui chantait « Le Métèque » en 1969 ?", ["Georges Moustaki", "Serge Reggiani", "Mouloudji", "Graeme Allwright"],
    "Né à Alexandrie, en Égypte, il avait choisi le prénom de Georges en hommage à Brassens.", "Georges Moustaki");
  Q('chansons', 2, "Quelle chanteuse surnommait-on « la Dame en noir » ?", ["Barbara", "Dalida", "Sheila", "Mireille Mathieu"],
    "Elle chantait vêtue de noir, souvent au piano. On lui doit « Göttingen » et « Nantes ».", "Barbara");
  Q('chansons', 3, "Quelle chanteuse surnommait-on « la Muse de Saint-Germain-des-Prés » ?", ["Juliette Gréco", "Barbara", "Françoise Hardy", "Catherine Sauvage"],
    "Après la guerre, elle fréquentait les caves de jazz du quartier avec Boris Vian et Jean-Paul Sartre.", "Juliette Gréco");
  Q('chansons', 2, "Quel chanteur, né à Cayenne, chantait « Syracuse » et « Zorro est arrivé » ?", ["Henri Salvador", "Sacha Distel", "Bourvil", "Harry Belafonte"],
    "En 2000, à plus de 80 ans, il a connu un nouveau grand succès avec l'album « Chambre avec vue ».", "Henri Salvador");
  Q('chansons', 2, "Qui chantait « La Plus Belle pour aller danser » en 1964 ?", ["Sylvie Vartan", "Sheila", "Françoise Hardy", "France Gall"],
    "Signée Charles Aznavour et Georges Garvarentz, la chanson a été écrite pour le film « Cherchez l'idole ».", "Sylvie Vartan");
  Q('chansons', 2, "Qui chantait « Ma cabane au Canada » ?", ["Line Renaud", "Annie Cordy", "Patachou", "Lucienne Boyer"],
    "La musique avait été composée par son mari, Loulou Gasté.", "Line Renaud");
  Q('chansons', 2, "Quelle accordéoniste a suivi le Tour de France pendant des années, en jouant sur le toit d'une voiture ?", ["Yvette Horner", "Annie Cordy", "Line Renaud", "Mireille Mathieu"],
    "Elle accompagnait la caravane du Tour dans les années 1950 et 1960, et le public l'adorait.", "Yvette Horner");
  Q('chansons', 2, "Qui chantait « Pour un flirt » en 1971 ?", ["Michel Delpech", "Gérard Lenorman", "Michel Fugain", "C. Jérôme"],
    "On lui doit aussi « Le Loir-et-Cher » et « Quand j'étais chanteur ».", "Michel Delpech");
  Q('chansons', 2, "Qui chantait « On ira tous au paradis » en 1972 ?", ["Michel Polnareff", "Julien Clerc", "Michel Fugain", "Christophe"],
    "Il était reconnaissable à ses grosses lunettes blanches et à ses cheveux bouclés.", "Michel Polnareff");
  Q('chansons', 3, "Quelle chanteuse a remporté le concours Eurovision 1977 pour la France avec « L'oiseau et l'enfant » ?", ["Marie Myriam", "Nicole Croisille", "Isabelle Aubret", "Marie Laforêt"],
    "Le concours se déroulait cette année-là à Londres.", "Marie Myriam");
  Q('chansons', 3, "« Il n'y a pas d'amour heureux », mis en musique par Georges Brassens, est un poème de :", ["Louis Aragon", "Paul Éluard", "Jacques Prévert", "Victor Hugo"],
    "Jean Ferrat a lui aussi chanté de nombreux poèmes d'Aragon, comme « Aimer à perdre la raison ».", "Louis Aragon");
  Q('chansons', 3, "Quel chanteur et poète a écrit « Avec le temps » en 1970 ?", ["Léo Ferré", "Jean Ferrat", "Jacques Brel", "Serge Reggiani"],
    "Né à Monaco, il a aussi mis en musique des poèmes de Baudelaire, Verlaine et Rimbaud.", "Léo Ferré");
  Q('chansons', 3, "Quel chanteur québécois a fait découvrir la chanson du Québec aux Français au début des années 1950 ?", ["Félix Leclerc", "Gilles Vigneault", "Robert Charlebois", "Fabienne Thibeault"],
    "On lui doit « Le P'tit Bonheur » et « Moi, mes souliers ».", "Félix Leclerc");
  Q('chansons', 3, "Qui a écrit les paroles de « Milord », chanté par Édith Piaf en 1959 ?", ["Georges Moustaki", "Charles Aznavour", "Gilbert Bécaud", "Michel Emer"],
    "La musique est de Marguerite Monnot, qui avait déjà composé « Hymne à l'amour » pour Piaf.", "Georges Moustaki");
  Q('chansons', 3, "Quelle chanteuse a créé « Mon amant de Saint-Jean » en 1942 ?", ["Lucienne Delyle", "Lucienne Boyer", "Damia", "Fréhel"],
    "Cette valse musette est restée l'un des grands classiques des bals populaires.", "Lucienne Delyle");
  Q('chansons', 3, "Quelle chanteuse a créé « J'attendrai » en 1938 ?", ["Rina Ketty", "Lucienne Boyer", "Lys Gauty", "Fréhel"],
    "La chanson est l'adaptation d'un air italien, « Tornerai ».", "Rina Ketty");
  Q('chansons', 3, "Qui chantait « Les Neiges du Kilimandjaro » en 1966 ?", ["Pascal Danel", "Hervé Vilard", "Christophe", "Richard Anthony"],
    "La chanson porte le titre d'une nouvelle de l'écrivain américain Ernest Hemingway.", "Pascal Danel");
  Q('chansons', 3, "Avec quel groupe Édith Piaf a-t-elle chanté « Les Trois Cloches » en 1946 ?", ["Les Compagnons de la chanson", "Les Frères Jacques", "Les Quatre Barbus", "Les Chaussettes noires"],
    "La chanson suit la vie d'un villageois au son des cloches de son clocher.", "Les Compagnons de la chanson");
  Q('chansons', 3, "Qui chantait « Le Sud » en 1975 ?", ["Nino Ferrer", "Gérard Manset", "Alain Barrière", "Christophe"],
    "Né à Gênes, en Italie, il est aussi l'auteur de « Mirza » et des « Cornichons ».", "Nino Ferrer");

  /* ---------- Cinéma et télévision ---------- */
  Q('cinema', 1, "Quels acteurs forment le duo vedette de « La Grande Vadrouille » (1966) ?", ["Bourvil et Louis de Funès", "Fernandel et Bourvil", "Jean Gabin et Lino Ventura", "Louis de Funès et Jean Marais"],
    "Avec plus de 17 millions d'entrées, ce film de Gérard Oury est resté plus de quarante ans le plus grand succès d'un film français.", "Louis de Funès");
  Q('cinema', 1, "Quel acteur joue le gendarme Cruchot dans « Le Gendarme de Saint-Tropez » ?", ["Louis de Funès", "Bourvil", "Michel Galabru", "Fernandel"],
    "Le premier film date de 1964 ; il y en aura six au total. Michel Galabru jouait l'adjudant Gerber.", "Louis de Funès");
  Q('cinema', 1, "Quel acteur incarne le curé Don Camillo au cinéma ?", ["Fernandel", "Bourvil", "Raimu", "Jean Gabin"],
    "Son adversaire de toujours, le maire communiste Peppone, était joué par l'Italien Gino Cervi.", "Fernandel");
  Q('cinema', 2, "Qui a réalisé et interprété « Les Vacances de M. Hulot » (1953) ?", ["Jacques Tati", "Jean Renoir", "Marcel Carné", "François Truffaut"],
    "Jacques Tati a tourné une grande partie du film à Saint-Marc-sur-Mer, en Loire-Atlantique.", "Jacques Tati");
  Q('cinema', 1, "Dans quelle ville se déroule le grand festival de cinéma où l'on décerne la Palme d'or ?", ["Cannes", "Nice", "Deauville", "Venise"],
    "Le premier festival a eu lieu en 1946 ; la Palme d'or est décernée depuis 1955.", "Cannes");
  Q('cinema', 2, "Qui a réalisé « Les Parapluies de Cherbourg » (1964), film entièrement chanté ?", ["Jacques Demy", "Claude Lelouch", "Jean-Luc Godard", "Louis Malle"],
    "Avec Catherine Deneuve et une musique de Michel Legrand, le film a reçu la Palme d'or.", "Jacques Demy");
  Q('cinema', 1, "Quelle actrice joue dans « Et Dieu… créa la femme » (1956) de Roger Vadim ?", ["Brigitte Bardot", "Catherine Deneuve", "Jeanne Moreau", "Michèle Morgan"],
    "Ce film tourné à Saint-Tropez a fait de Brigitte Bardot une vedette internationale.", "Brigitte Bardot");
  Q('cinema', 1, "Quelle émission pour enfants mettait en scène Nounours, Nicolas et Pimprenelle ?", ["« Bonne nuit les petits »", "« L'Île aux enfants »", "« Le Manège enchanté »", "« Récré A2 »"],
    "Diffusée à partir de 1962, elle se terminait quand le marchand de sable passait.");
  Q('cinema', 2, "Dans « Le Manège enchanté », comment s'appelle le chien ?", ["Pollux", "Zébulon", "Azor", "Pilou"],
    "Zébulon, lui, est le personnage monté sur un ressort qui surgit en disant « Boing ! ».");
  Q('cinema', 1, "Comment s'appelle le gentil dinosaure orange de « L'Île aux enfants » ?", ["Casimir", "Gédéon", "Nounours", "Bubulle"],
    "L'émission a commencé en 1974 ; Casimir y vivait avec ses amis, dont M. du Snob.");
  Q('cinema', 1, "Dans quel jeu télévisé entend-on « Le compte est bon » ?", ["« Des chiffres et des lettres »", "« La Tête et les Jambes »", "« Questions pour un champion »", "« Le Juste Prix »"],
    "Née en 1965, c'est l'une des plus anciennes émissions de la télévision française.");
  Q('cinema', 2, "Quel animateur a créé l'émission « Intervilles » en 1962 ?", ["Guy Lux", "Jacques Martin", "Pierre Tchernia", "Michel Drucker"],
    "Il la présentait avec Léon Zitrone et Simone Garnier ; les épreuves avec des vachettes sont restées célèbres.", "Guy Lux");
  Q('cinema', 3, "Quel acteur a joué le commissaire Maigret à la télévision de 1967 à 1990 ?", ["Jean Richard", "Bruno Cremer", "Jean Gabin", "Lino Ventura"],
    "Bruno Cremer a ensuite repris le rôle à partir de 1991.", "Jean Richard (acteur)");
  Q('cinema', 2, "Qui a écrit les célèbres dialogues des « Tontons flingueurs » (1963) ?", ["Michel Audiard", "Jacques Prévert", "Marcel Pagnol", "Sacha Guitry"],
    "Le film de Georges Lautner, avec Lino Ventura, est devenu culte grâce à ses répliques.", "Michel Audiard");
  Q('cinema', 1, "Quel auteur provençal a écrit la trilogie « Marius », « Fanny » et « César » ?", ["Marcel Pagnol", "Jean Giono", "Alphonse Daudet", "Frédéric Mistral"],
    "Raimu y incarne César, le patron du bar de la Marine, sur le Vieux-Port de Marseille.", "Marcel Pagnol");
  Q('cinema', 3, "Dans quel pays se déroule le film « Les Bronzés » (1978) ?", ["La Côte d'Ivoire", "Le Sénégal", "Le Maroc", "La Tunisie"],
    "La troupe du Splendid y joue des vacanciers dans un village de vacances au bord de la mer.");
  Q('cinema', 3, "« La Guerre des boutons » (1962) d'Yves Robert est adaptée du roman de :", ["Louis Pergaud", "Marcel Pagnol", "Alphonse Daudet", "Jules Renard"],
    "On y entend la réplique du Petit Gibus : « Si j'aurais su, j'aurais pas v'nu ! »", "Louis Pergaud");
  Q('cinema', 2, "Que font sans cesse les Shadoks, ces drôles d'oiseaux de dessin animé ?", ["Ils pompent", "Ils chantent", "Ils dorment", "Ils dansent"],
    "Créés par Jacques Rouxel, ils sont apparus à la télévision en 1968. Leur devise : « Je pompe donc je suis ».");
  Q('cinema', 3, "Qui présentait l'émission de cirque « La Piste aux étoiles » ?", ["Roger Lanzac", "Guy Lux", "Jacques Martin", "Pierre Tchernia"],
    "L'émission a été diffusée de 1956 à 1978, et réunissait toute la famille devant le poste.", "Roger Lanzac");
  Q('cinema', 2, "Quel acteur joue Fantômas face à Louis de Funès dans le film de 1964 ?", ["Jean Marais", "Alain Delon", "Jean-Paul Belmondo", "Lino Ventura"],
    "Jean Marais jouait aussi le journaliste Fandor, et faisait lui-même ses cascades.", "Jean Marais");
  Q('cinema', 3, "Quel acteur partage l'affiche de « Un singe en hiver » (1962) avec Jean Gabin ?", ["Jean-Paul Belmondo", "Alain Delon", "Lino Ventura", "Bourvil"],
    "Le film d'Henri Verneuil, dialogué par Michel Audiard, se déroule dans une station balnéaire normande.", "Jean-Paul Belmondo");
  Q('cinema', 2, "Quel conte Jean Cocteau a-t-il porté à l'écran en 1946 avec Jean Marais ?", ["La Belle et la Bête", "Cendrillon", "Blanche-Neige", "Le Petit Chaperon rouge"],
    "Le maquillage de la Bête demandait plusieurs heures de préparation à Jean Marais.");
  Q('cinema', 1, "Quel acteur était surnommé « Bébel » ?", ["Jean-Paul Belmondo", "Alain Delon", "Jean Gabin", "Lino Ventura"],
    "Il a joué dans « À bout de souffle », « L'Homme de Rio » ou encore « Le Magnifique ».", "Jean-Paul Belmondo");
  Q('cinema', 2, "Quel animateur présentait « L'École des fans », où de jeunes enfants chantaient ?", ["Jacques Martin", "Michel Drucker", "Pascal Sevran", "Guy Lux"],
    "À la fin de l'émission, tous les enfants recevaient une bonne note.", "Jacques Martin (animateur)");
  Q('cinema', 2, "Quel héros de feuilleton des années 1960 combattait les Anglais avec sa fronde ?", ["Thierry la Fronde", "Ivanhoé", "Zorro", "Robin des Bois"],
    "Joué par Jean-Claude Drouot, il vivait pendant la guerre de Cent Ans.", "Jean-Claude Drouot");

  Q('cinema', 1, "Quel acteur a incarné le commissaire Navarro à la télévision ?", ["Roger Hanin", "Jean Richard", "Bruno Cremer", "Pierre Mondy"],
    "La série « Navarro » a été diffusée sur TF1 pendant plus de quinze ans, à partir de 1989.", "Roger Hanin");
  Q('cinema', 1, "Quel acteur joue Obélix dans « Astérix et Obélix contre César » (1999) ?", ["Gérard Depardieu", "Christian Clavier", "Jean Reno", "Gérard Jugnot"],
    "Christian Clavier y incarnait Astérix.", "Gérard Depardieu");
  Q('cinema', 1, "Dans « Les Visiteurs » (1993), quel acteur joue Jacquouille la Fripouille ?", ["Christian Clavier", "Jean Reno", "Gérard Jugnot", "Thierry Lhermitte"],
    "Jean Reno y joue le chevalier Godefroy de Montmirail. « Okayyy ! »", "Christian Clavier");
  Q('cinema', 1, "Quel acteur jouait l'inspecteur Columbo, à l'éternel imperméable ?", ["Peter Falk", "Telly Savalas", "Raymond Burr", "Karl Malden"],
    "Il revenait toujours avec « juste une dernière question », un cigare à la main.", "Peter Falk");
  Q('cinema', 1, "Quelle actrice a été révélée par le film « La Boum » (1980) ?", ["Sophie Marceau", "Isabelle Adjani", "Charlotte Gainsbourg", "Sandrine Bonnaire"],
    "Elle avait 13 ans ; Claude Brasseur jouait son père.", "Sophie Marceau");
  Q('cinema', 1, "Quel animateur a présenté « Vivement dimanche » à partir de 1998 ?", ["Michel Drucker", "Jacques Martin", "Patrick Sabatier", "Philippe Bouvard"],
    "Il avait débuté à la télévision au milieu des années 1960, comme journaliste sportif.", "Michel Drucker");
  Q('cinema', 2, "Dans « La Traversée de Paris » (1956), quel acteur partage l'affiche avec Bourvil ?", ["Jean Gabin", "Fernandel", "Lino Ventura", "Raimu"],
    "On y voit aussi Louis de Funès dans le rôle de l'épicier Jambier.", "Jean Gabin");
  Q('cinema', 2, "Quelle actrice joue l'héroïne d'« Angélique, marquise des anges » (1964) ?", ["Michèle Mercier", "Brigitte Bardot", "Mylène Demongeot", "Marina Vlady"],
    "Robert Hossein y incarne Joffrey de Peyrac. Cinq films ont été tournés entre 1964 et 1968.", "Michèle Mercier");
  Q('cinema', 2, "Quel dessin animé japonais, diffusé dans « Récré A2 » à partir de 1978, mettait en scène un robot géant ?", ["« Goldorak »", "« Candy »", "« Heidi »", "« Albator »"],
    "Son pilote, Actarus, lançait ses attaques en criant leur nom, au grand plaisir des enfants.");
  Q('cinema', 2, "Dans le feuilleton « Belle et Sébastien » (1965), de quelle race est la chienne Belle ?", ["Un montagne des Pyrénées", "Un saint-bernard", "Un berger allemand", "Un colley"],
    "Le feuilleton est de Cécile Aubry ; Sébastien était joué par son propre fils, Mehdi.", "Chien de montagne des Pyrénées");
  Q('cinema', 2, "Quel cinéaste a réalisé « Un homme et une femme », Palme d'or en 1966 ?", ["Claude Lelouch", "Jacques Demy", "Claude Chabrol", "Éric Rohmer"],
    "Anouk Aimée et Jean-Louis Trintignant s'y retrouvent à Deauville, sur le « chabadabada » de Francis Lai.", "Claude Lelouch");
  Q('cinema', 2, "Quel acteur joue « Le Grand Blond avec une chaussure noire » (1972) ?", ["Pierre Richard", "Jean Rochefort", "Jacques Villeret", "Jean Carmet"],
    "Jean Rochefort et Mireille Darc partageaient l'affiche de cette comédie d'Yves Robert.", "Pierre Richard");
  Q('cinema', 2, "Dans « Le Corniaud » (1965), quelle voiture de Bourvil part en morceaux au début du film ?", ["Une 2 CV", "Une 4L", "Une DS", "Une Dauphine"],
    "La voiture avait été truquée pour se disloquer entièrement au moment du choc avec celle de Louis de Funès.", "Citroën 2 CV");
  Q('cinema', 2, "Quel acteur joue Enzo Molinari dans « Le Grand Bleu » (1988) ?", ["Jean Reno", "Jean-Marc Barr", "Christophe Lambert", "Richard Anconina"],
    "Le film de Luc Besson s'inspire des plongeurs en apnée Jacques Mayol et Enzo Maiorca.", "Jean Reno");
  Q('cinema', 2, "Quelle série télévisée suivait les policiers des brigades mobiles créées par Clemenceau ?", ["« Les Brigades du Tigre »", "« Les Cinq Dernières Minutes »", "« Commissaire Moulin »", "« Les Enquêtes du commissaire Maigret »"],
    "Elle tirait son nom du surnom de Clemenceau et a été diffusée de 1974 à 1983.");
  Q('cinema', 2, "Dans « Les Cinq Dernières Minutes », quelle phrase lançait le commissaire Bourrel ?", ["« Bon sang, mais c'est bien sûr ! »", "« Élémentaire, mon cher Watson ! »", "« Nom d'un petit bonhomme ! »", "« Sacrebleu, je le tiens ! »"],
    "Le commissaire Bourrel était joué par Raymond Souplex.", "Raymond Souplex");
  Q('cinema', 2, "Quel acteur jouait Fanfan la Tulipe dans le film de 1952 ?", ["Gérard Philipe", "Jean Marais", "Georges Marchal", "Daniel Gélin"],
    "Gina Lollobrigida lui donnait la réplique dans ce film de cape et d'épée de Christian-Jaque.", "Gérard Philipe");
  Q('cinema', 2, "Quelle série britannique mettait en scène John Steed et Emma Peel ?", ["« Chapeau melon et bottes de cuir »", "« Le Saint »", "« Amicalement vôtre »", "« Le Prisonnier »"],
    "Son titre anglais est « The Avengers ». John Steed ne se séparait jamais de son parapluie.");
  Q('cinema', 3, "Quel cinéaste a réalisé « Le Salaire de la peur » (1953) ?", ["Henri-Georges Clouzot", "Marcel Carné", "Julien Duvivier", "Jacques Becker"],
    "Yves Montand et Charles Vanel y conduisent des camions chargés de nitroglycérine.", "Henri-Georges Clouzot");
  Q('cinema', 3, "Dans « Les Misérables » de Jean-Paul Le Chanois (1958), quel rôle tient Bourvil ?", ["Thénardier", "Jean Valjean", "Javert", "Marius"],
    "Jean Gabin y incarne Jean Valjean et Bernard Blier, l'inspecteur Javert.");
  Q('cinema', 3, "Quel acteur joue le mime Baptiste dans « Les Enfants du paradis » (1945) ?", ["Jean-Louis Barrault", "Pierre Brasseur", "Gérard Philipe", "Jean Marais"],
    "Arletty y incarne Garance, dans le Paris du boulevard du Temple que l'on surnommait « boulevard du Crime ».", "Jean-Louis Barrault");
  Q('cinema', 3, "Quelle grande émission musicale Jacques Chancel a-t-il lancée en 1972 ?", ["« Le Grand Échiquier »", "« Champs-Élysées »", "« Numéro un »", "« La Chance aux chansons »"],
    "Chaque soirée était consacrée à un invité d'honneur, entouré d'artistes de tous horizons.", "Jacques Chancel");
  Q('cinema', 3, "Quel acteur jouait Lord Brett Sinclair aux côtés de Tony Curtis dans « Amicalement vôtre » ?", ["Roger Moore", "Sean Connery", "Patrick Macnee", "David Niven"],
    "Le doublage français, aux dialogues très libres, a beaucoup contribué au succès de la série en France.", "Roger Moore");
  Q('cinema', 3, "Quelle actrice chante « Le Tourbillon de la vie » dans « Jules et Jim » (1962) ?", ["Jeanne Moreau", "Anna Karina", "Delphine Seyrig", "Stéphane Audran"],
    "Le film est de François Truffaut.", "Jeanne Moreau");
  Q('cinema', 3, "Quel acteur, ancien lutteur, a débuté au cinéma dans « Touchez pas au grisbi » (1954) ?", ["Lino Ventura", "Bernard Blier", "Philippe Noiret", "Jean Carmet"],
    "Né à Parme, en Italie, il avait été lutteur professionnel avant qu'une blessure ne mette fin à sa carrière sportive.", "Lino Ventura");
  Q('cinema', 3, "Dans « Au théâtre ce soir », qui signait les décors, selon la célèbre formule ?", ["Roger Harth", "Pierre Sabbagh", "Jean Le Poulain", "Jacques Charon"],
    "La phrase complète était : « Les décors sont de Roger Harth et les costumes de Donald Cardwell. »");
  Q('cinema', 3, "Qui présentait le jeu « La Tête et les Jambes » dans les années 1960 ?", ["Pierre Bellemare", "Guy Lux", "Jacques Martin", "Léon Zitrone"],
    "Un candidat répondait aux questions ; en cas d'erreur, un sportif tentait une épreuve pour le sauver.", "Pierre Bellemare");
  Q('cinema', 3, "Dans « Quai des brumes » (1938), à quelle actrice Jean Gabin dit-il « T'as d'beaux yeux, tu sais » ?", ["Michèle Morgan", "Arletty", "Danielle Darrieux", "Simone Signoret"],
    "Elle lui répond : « Embrassez-moi. » Le film est de Marcel Carné, sur des dialogues de Jacques Prévert.", "Michèle Morgan");

  /* ---------- Histoire de France ---------- */
  Q('histoire', 1, "En quelle année a été signé l'armistice de la Première Guerre mondiale ?", ["1918", "1914", "1916", "1919"],
    "Il a été signé le 11 novembre 1918 dans un wagon, à Rethondes, en forêt de Compiègne.");
  Q('histoire', 1, "Qui a lancé l'appel du 18 juin 1940 depuis Londres ?", ["Charles de Gaulle", "Jean Moulin", "Philippe Pétain", "Georges Clemenceau"],
    "Le général de Gaulle s'est exprimé sur les ondes de la radio anglaise, la BBC.", "Charles de Gaulle");
  Q('histoire', 2, "En quelle année les Françaises ont-elles voté pour la première fois ?", ["1945", "1918", "1936", "1958"],
    "C'était lors des élections municipales d'avril 1945, un an après l'obtention du droit de vote.");
  Q('histoire', 2, "Quelle grande avancée sociale le Front populaire a-t-il obtenue en 1936 ?", ["Les congés payés", "La Sécurité sociale", "Le droit de vote des femmes", "Le salaire minimum"],
    "Deux semaines de congés payés : beaucoup d'ouvriers ont découvert la mer cet été-là.");
  Q('histoire', 1, "Quel jour a eu lieu le débarquement allié en Normandie ?", ["Le 6 juin 1944", "Le 8 mai 1945", "Le 14 juillet 1944", "Le 25 août 1944"],
    "C'est le « Jour J » : des milliers de soldats ont débarqué sur les plages normandes.");
  Q('histoire', 2, "En quel mois de 1944 Paris a-t-il été libéré ?", ["Août", "Juin", "Septembre", "Décembre"],
    "Le 25 août 1944, la 2e division blindée du général Leclerc est entrée dans Paris.");
  Q('histoire', 2, "En quelle année la Ve République a-t-elle été fondée ?", ["1958", "1946", "1962", "1968"],
    "Sa Constitution date du 4 octobre 1958 ; elle est toujours en vigueur.");
  Q('histoire', 1, "Qui fut le premier président de la Ve République ?", ["Charles de Gaulle", "Georges Pompidou", "René Coty", "Vincent Auriol"],
    "René Coty, lui, avait été le dernier président de la IVe République.", "Charles de Gaulle");
  Q('histoire', 1, "Que s'est-il passé en France en mai 1968 ?", ["Des manifestations étudiantes et une grande grève", "La fin de la guerre d'Algérie", "Le premier pas sur la Lune", "L'arrivée de l'euro"],
    "Parti des universités, le mouvement a conduit à une grève générale dans tout le pays.");
  Q('histoire', 3, "Quelle femme politique est devenue en 1979 la première présidente du Parlement européen élu ?", ["Simone Veil", "Édith Cresson", "Louise Weiss", "Simone de Beauvoir"],
    "Rescapée des camps de concentration, Simone Veil repose au Panthéon depuis 2018.", "Simone Veil");
  Q('histoire', 2, "Quel garde des Sceaux a défendu l'abolition de la peine de mort en 1981 ?", ["Robert Badinter", "Michel Rocard", "Jacques Chirac", "Pierre Mauroy"],
    "La loi a été votée en 1981, sous la présidence de François Mitterrand.", "Robert Badinter");
  Q('histoire', 1, "Qui a été élu président de la République le 10 mai 1981 ?", ["François Mitterrand", "Valéry Giscard d'Estaing", "Jacques Chirac", "Georges Pompidou"],
    "Il a été président pendant deux septennats, jusqu'en 1995.", "François Mitterrand");
  Q('histoire', 1, "Quel train à grande vitesse a été mis en service en 1981 entre Paris et Lyon ?", ["Le TGV", "Le Mistral", "L'Orient-Express", "Le Capitole"],
    "Le trajet passait alors à environ 2 heures 40, contre près de 4 heures auparavant.", "TGV Sud-Est");
  Q('histoire', 1, "Quel avion supersonique franco-britannique a volé pour la première fois en 1969 ?", ["Le Concorde", "La Caravelle", "L'Airbus A300", "Le Mirage"],
    "Son premier vol a eu lieu à Toulouse le 2 mars 1969. Il reliait Paris à New York en environ 3 heures 30.", "Concorde (avion)");
  Q('histoire', 1, "Quelle bataille de 1916 est restée le symbole de la Grande Guerre pour les Français ?", ["Verdun", "Waterloo", "Austerlitz", "Marignan"],
    "Elle a duré près de dix mois et fait des centaines de milliers de victimes.");
  Q('histoire', 1, "Comment surnommait-on les soldats français de la Première Guerre mondiale ?", ["Les poilus", "Les grognards", "Les mousquetaires", "Les chouans"],
    "Les grognards, eux, étaient les soldats de la Vieille Garde de Napoléon.");
  Q('histoire', 2, "Qui a présidé le Conseil national de la Résistance, créé en 1943 ?", ["Jean Moulin", "Pierre Brossolette", "Lucie Aubrac", "Jean Jaurès"],
    "Arrêté à Caluire en juin 1943, Jean Moulin est mort sans avoir parlé. Il repose au Panthéon.", "Jean Moulin");
  Q('histoire', 2, "En quelle année les accords d'Évian ont-ils mis fin à la guerre d'Algérie ?", ["1962", "1954", "1958", "1968"],
    "Ils ont été signés le 18 mars 1962 ; l'Algérie est devenue indépendante en juillet.");
  Q('histoire', 1, "Quel ouvrage reliant la France à l'Angleterre a été inauguré en 1994 ?", ["Le tunnel sous la Manche", "Le tunnel du Mont-Blanc", "Le pont de Normandie", "Le viaduc de Millau"],
    "Il mesure environ 50 kilomètres, dont près de 38 sous la mer.", "Tunnel sous la Manche");
  Q('histoire', 2, "Quel homme politique était surnommé « le Tigre » ?", ["Georges Clemenceau", "Charles de Gaulle", "Jean Jaurès", "Raymond Poincaré"],
    "On l'appelait aussi « le Père la Victoire » après 1918.", "Georges Clemenceau");
  Q('histoire', 3, "Quel homme politique socialiste a été assassiné le 31 juillet 1914 à Paris ?", ["Jean Jaurès", "Léon Blum", "Aristide Briand", "Jules Ferry"],
    "Pacifiste, il a été tué au café du Croissant, trois jours avant l'entrée en guerre de la France.", "Jean Jaurès");
  Q('histoire', 1, "Le Centre Pompidou, inauguré à Paris en 1977, porte le nom de quel président ?", ["Georges Pompidou", "Charles de Gaulle", "René Coty", "Vincent Auriol"],
    "Georges Pompidou avait voulu ce centre d'art moderne, mais il est mort en 1974, avant son ouverture.", "Georges Pompidou");
  Q('histoire', 3, "En quelle année le général de Gaulle a-t-il quitté la présidence de la République ?", ["1969", "1968", "1965", "1970"],
    "Il a démissionné en avril 1969, après l'échec d'un référendum. Il est mort l'année suivante.");
  Q('histoire', 3, "En quelle année la Sécurité sociale a-t-elle été créée ?", ["1945", "1936", "1958", "1968"],
    "Elle est née des ordonnances d'octobre 1945, dans l'esprit du programme de la Résistance.");
  Q('histoire', 1, "Que commémore-t-on en France le 11 novembre ?", ["L'armistice de 1918", "La victoire de 1945", "La prise de la Bastille", "La libération de Paris"],
    "La victoire de 1945, elle, est fêtée le 8 mai.");
  Q('histoire', 2, "Quel paquebot français, mis en service en 1962, était alors le plus long du monde ?", ["Le France", "Le Normandie", "Le Titanic", "Le Queen Mary"],
    "Long de plus de 300 mètres, il assurait la ligne Le Havre – New York.", "France (paquebot)");

  Q('histoire', 1, "Quel roi de France était surnommé « le Roi-Soleil » ?", ["Louis XIV", "Louis XVI", "François Ier", "Henri IV"],
    "Son règne a duré 72 ans, de 1643 à 1715 : un record dans l'histoire de France.", "Louis XIV");
  Q('histoire', 1, "Quelle jeune femme a délivré Orléans, assiégée par les Anglais, en 1429 ?", ["Jeanne d'Arc", "Catherine de Médicis", "Aliénor d'Aquitaine", "Anne de Bretagne"],
    "On la surnomme « la Pucelle d'Orléans » ; la ville la fête encore chaque année au mois de mai.", "Jeanne d'Arc");
  Q('histoire', 1, "Quel empereur est né à Ajaccio en 1769 ?", ["Napoléon Ier", "Napoléon III", "Louis-Philippe", "Charles X"],
    "Sa maison natale, la maison Bonaparte, est aujourd'hui un musée national.", "Napoléon Ier");
  Q('histoire', 1, "Quel roi souhaitait, selon la tradition, que chaque paysan puisse mettre « la poule au pot » le dimanche ?", ["Henri IV", "Louis XIV", "Saint Louis", "François Ier"],
    "Premier roi de la famille des Bourbons, il était né à Pau, en Béarn.", "Henri IV (roi de France)");
  Q('histoire', 1, "Quel chef gaulois a affronté Jules César à Alésia ?", ["Vercingétorix", "Clovis", "Brennus", "Charlemagne"],
    "Sa grande statue, voulue par Napoléon III, domine le site d'Alise-Sainte-Reine, en Côte-d'Or.", "Vercingétorix");
  Q('histoire', 1, "Quel monument parisien a été construit pour l'Exposition universelle de 1889 ?", ["La tour Eiffel", "L'Arc de triomphe", "Le Sacré-Cœur", "Le Grand Palais"],
    "Elle devait être démontée au bout de vingt ans ; ses antennes de radio l'ont sauvée.", "Tour Eiffel");
  Q('histoire', 2, "Quel président de la République a été élu en 1974 ?", ["Valéry Giscard d'Estaing", "François Mitterrand", "Jacques Chaban-Delmas", "Alain Poher"],
    "Dès 1974, il a abaissé l'âge de la majorité de 21 à 18 ans.", "Valéry Giscard d'Estaing");
  Q('histoire', 2, "Quel empereur a été couronné à Rome le jour de Noël de l'an 800 ?", ["Charlemagne", "Clovis", "Louis le Pieux", "Pépin le Bref"],
    "Il a été couronné par le pape Léon III dans la basilique Saint-Pierre.", "Charlemagne");
  Q('histoire', 2, "Quel ministre a rendu l'école primaire gratuite, laïque et obligatoire dans les années 1880 ?", ["Jules Ferry", "Jean Jaurès", "Victor Duruy", "Léon Gambetta"],
    "Les lois Jules Ferry de 1881 et 1882 ont rendu l'instruction obligatoire de 6 à 13 ans.", "Jules Ferry");
  Q('histoire', 2, "Quel savant français a mis au point le vaccin contre la rage en 1885 ?", ["Louis Pasteur", "Claude Bernard", "Ambroise Paré", "Marie Curie"],
    "Le jeune Joseph Meister, mordu par un chien, a été le premier à en bénéficier.", "Louis Pasteur");
  Q('histoire', 2, "Quelle savante a reçu deux prix Nobel, en physique puis en chimie ?", ["Marie Curie", "Irène Joliot-Curie", "Lise Meitner", "Simone Veil"],
    "Née à Varsovie, elle a reçu le prix Nobel de physique en 1903 et celui de chimie en 1911.", "Marie Curie");
  Q('histoire', 2, "Quel cardinal a été le principal ministre de Louis XIII ?", ["Richelieu", "Mazarin", "Fleury", "Dubois"],
    "Il a fondé l'Académie française en 1635.", "Armand Jean du Plessis de Richelieu");
  Q('histoire', 2, "Qui a été le premier à traverser la Manche en avion, en 1909 ?", ["Louis Blériot", "Roland Garros", "Clément Ader", "Henri Farman"],
    "Le 25 juillet 1909, il a relié les environs de Calais à Douvres en un peu plus d'une demi-heure.", "Louis Blériot");
  Q('histoire', 2, "Quel roi a accueilli Léonard de Vinci en France à la fin de sa vie ?", ["François Ier", "Louis XII", "Henri II", "Charles VIII"],
    "En 1516, Léonard s'est installé au Clos Lucé, près d'Amboise, avec la Joconde dans ses bagages.", "François Ier (roi de France)");
  Q('histoire', 2, "Quel ingénieur de Louis XIV a fortifié de nombreuses villes du royaume ?", ["Vauban", "Colbert", "Le Nôtre", "Mansart"],
    "Douze de ses sites fortifiés sont inscrits au patrimoine mondial de l'Unesco depuis 2008.", "Sébastien Le Prestre de Vauban");
  Q('histoire', 2, "Quel navigateur de Saint-Malo a exploré le fleuve Saint-Laurent, au Canada, à partir de 1534 ?", ["Jacques Cartier", "Samuel de Champlain", "Robert Surcouf", "Louis-Antoine de Bougainville"],
    "Il a pris possession de ces terres au nom du roi François Ier.", "Jacques Cartier");
  Q('histoire', 3, "Quelle duchesse a épousé successivement deux rois de France, Charles VIII et Louis XII ?", ["Anne de Bretagne", "Catherine de Médicis", "Aliénor d'Aquitaine", "Marie de Médicis"],
    "Ces mariages ont préparé le rattachement de la Bretagne au royaume de France.", "Anne de Bretagne");
  Q('histoire', 3, "Quel ministre de Louis XIV a développé les manufactures royales et la marine ?", ["Jean-Baptiste Colbert", "Nicolas Fouquet", "Mazarin", "Louvois"],
    "Il a notamment fait de la manufacture des Gobelins une manufacture royale.", "Jean-Baptiste Colbert");
  Q('histoire', 3, "Quel roi de France était surnommé « le Bien-Aimé » ?", ["Louis XV", "Louis XIV", "Louis XIII", "Louis XVI"],
    "Arrière-petit-fils de Louis XIV, il est devenu roi à l'âge de cinq ans.", "Louis XV");
  Q('histoire', 3, "Quel ministre des Affaires étrangères a lancé la construction européenne par sa déclaration du 9 mai 1950 ?", ["Robert Schuman", "Pierre Mendès France", "Antoine Pinay", "Georges Bidault"],
    "Le 9 mai est devenu la « Journée de l'Europe ».", "Robert Schuman");
  Q('histoire', 3, "Qui a conçu le canal du Midi, achevé en 1681 ?", ["Pierre-Paul Riquet", "Ferdinand de Lesseps", "Gustave Eiffel", "Jean-Baptiste Colbert"],
    "Ce canal, qui relie Toulouse à la Méditerranée, est inscrit au patrimoine mondial de l'Unesco.", "Pierre-Paul Riquet");
  Q('histoire', 3, "Quel jardinier a dessiné les jardins du château de Versailles ?", ["André Le Nôtre", "Jules Hardouin-Mansart", "Charles Le Brun", "Louis Le Vau"],
    "Il a aussi dessiné les jardins de Vaux-le-Vicomte et ceux des Tuileries.", "André Le Nôtre");
  Q('histoire', 3, "Qui fut le premier président de la IVe République, élu en 1947 ?", ["Vincent Auriol", "René Coty", "Albert Lebrun", "Gaston Doumergue"],
    "René Coty lui a succédé en 1954.", "Vincent Auriol");
  Q('histoire', 3, "Quel célèbre corsaire de Louis XIV était originaire de Dunkerque ?", ["Jean Bart", "Robert Surcouf", "René Duguay-Trouin", "Jacques Cassard"],
    "Sa statue, sabre au clair, se dresse sur la grande place de Dunkerque qui porte son nom.", "Jean Bart");
  Q('histoire', 3, "Quel roi des Francs a été baptisé à Reims par l'évêque Remi ?", ["Clovis", "Charlemagne", "Pépin le Bref", "Hugues Capet"],
    "Ce baptême explique en partie pourquoi les rois de France ont ensuite été sacrés à Reims.");
  Q('histoire', 3, "Sous quel nom connaît-on le roi Louis IX ?", ["Saint Louis", "Louis le Gros", "Louis le Hutin", "Louis le Pieux"],
    "On raconte qu'il rendait la justice sous un chêne, à Vincennes.", "Louis IX");

  /* ---------- Géographie de France ---------- */
  Q('geographie', 1, "Quel est le plus long fleuve de France ?", ["La Loire", "La Seine", "Le Rhône", "La Garonne"],
    "La Loire parcourt plus de 1 000 kilomètres, du mont Gerbier-de-Jonc jusqu'à l'Atlantique.", "Loire");
  Q('geographie', 1, "Quel est le plus haut sommet de France ?", ["Le mont Blanc", "Le mont Ventoux", "Le puy de Dôme", "Le pic du Midi"],
    "Il culmine à environ 4 800 mètres, dans le massif des Alpes.", "Mont Blanc");
  Q('geographie', 1, "Quelle ville est surnommée « la Ville rose » ?", ["Toulouse", "Lyon", "Albi", "Marseille"],
    "Elle doit ce surnom à la couleur des briques de ses maisons et monuments.", "Toulouse");
  Q('geographie', 2, "Quelle ville est surnommée « la capitale des Gaules » ?", ["Lyon", "Paris", "Reims", "Bordeaux"],
    "À l'époque romaine, Lugdunum (Lyon) était la principale ville de la Gaule.", "Lyon");
  Q('geographie', 1, "Dans quelle ville se trouve la Promenade des Anglais ?", ["Nice", "Cannes", "Le Touquet", "Biarritz"],
    "Elle longe la baie des Anges sur plusieurs kilomètres.", "Nice");
  Q('geographie', 1, "Quelle île française est surnommée « l'île de Beauté » ?", ["La Corse", "La Réunion", "Belle-Île", "Oléron"],
    "C'est la plus grande île française de la Méditerranée.", "Calanques de Piana");
  Q('geographie', 1, "Quelle chaîne de montagnes sépare la France de l'Espagne ?", ["Les Pyrénées", "Les Alpes", "Le Jura", "Les Vosges"],
    "Elle s'étend de l'Atlantique à la Méditerranée, sur environ 430 kilomètres.", "Pyrénées");
  Q('geographie', 1, "Quel fleuve traverse Paris ?", ["La Seine", "La Loire", "Le Rhône", "La Garonne"],
    "La Seine se jette dans la Manche, entre Le Havre et Honfleur.", "Seine");
  Q('geographie', 2, "Dans quel département se trouve la dune du Pilat, la plus haute d'Europe ?", ["La Gironde", "Les Landes", "La Charente-Maritime", "La Vendée"],
    "Elle domine le bassin d'Arcachon, à plus de 100 mètres de hauteur.", "Dune du Pilat");
  Q('geographie', 3, "Quel est le plus grand lac naturel situé entièrement en France ?", ["Le lac du Bourget", "Le lac d'Annecy", "Le lac Léman", "Le lac de Serre-Ponçon"],
    "Le lac Léman est plus grand, mais il est partagé avec la Suisse. Serre-Ponçon est un lac artificiel.", "Lac du Bourget");
  Q('geographie', 1, "Dans quelle ville se trouve le pont où « l'on y danse » ?", ["Avignon", "Arles", "Nîmes", "Orange"],
    "Le pont Saint-Bénezet n'a plus que quatre arches sur le Rhône.", "Pont Saint-Bénézet");
  Q('geographie', 2, "Combien la France métropolitaine compte-t-elle de départements ?", ["96", "88", "101", "110"],
    "Avec les cinq départements d'outre-mer, on arrive à 101.");
  Q('geographie', 1, "Dans quelle région se trouvent les anciens volcans de la chaîne des Puys ?", ["Le Massif central", "Les Vosges", "Le Jura", "Les Alpes"],
    "Le puy de Dôme, au-dessus de Clermont-Ferrand, en est le plus célèbre.", "Chaîne des Puys");
  Q('geographie', 3, "Quelle ville est la préfecture du Finistère ?", ["Quimper", "Brest", "Morlaix", "Lorient"],
    "Brest est la plus grande ville du département, mais la préfecture est à Quimper.", "Quimper");
  Q('geographie', 1, "Le Mont-Saint-Michel se trouve à la limite de la Normandie et de quelle région ?", ["La Bretagne", "La Picardie", "La Vendée", "L'Anjou"],
    "La petite rivière du Couesnon marque la frontière entre les deux régions.", "Le Mont-Saint-Michel");
  Q('geographie', 2, "Quelle cité médiévale fortifiée a été restaurée par l'architecte Viollet-le-Duc ?", ["Carcassonne", "Avignon", "Saint-Malo", "Provins"],
    "Ses remparts comptent plus de cinquante tours.", "Cité de Carcassonne");
  Q('geographie', 2, "Dans quelle ville siège le Parlement européen ?", ["Strasbourg", "Lyon", "Genève", "Metz"],
    "Les députés européens s'y réunissent chaque mois en séance plénière.", "Strasbourg");
  Q('geographie', 1, "Quelle mer borde la ville de Marseille ?", ["La Méditerranée", "L'Atlantique", "La Manche", "La mer du Nord"],
    "Marseille est le plus grand port de France.");
  Q('geographie', 2, "Quelle ville est surnommée « la cité phocéenne » ?", ["Marseille", "Nice", "Toulon", "Montpellier"],
    "Elle a été fondée vers 600 avant J.-C. par des marins grecs venus de Phocée.", "Marseille");
  Q('geographie', 2, "Quel fleuve forme la Camargue avant de se jeter dans la Méditerranée ?", ["Le Rhône", "La Garonne", "La Loire", "La Durance"],
    "La Camargue est célèbre pour ses chevaux blancs, ses taureaux et ses flamants roses.", "Rhône");
  Q('geographie', 2, "Quelle ville du Nord est célèbre pour sa grande braderie de septembre ?", ["Lille", "Roubaix", "Amiens", "Arras"],
    "On y mange traditionnellement des moules-frites.", "Braderie de Lille");
  Q('geographie', 1, "Quel département porte le numéro 75 ?", ["Paris", "La Seine-et-Marne", "Les Yvelines", "Les Hauts-de-Seine"],
    "Ces numéros apparaissaient autrefois à la fin des plaques d'immatriculation.", "Paris");
  Q('geographie', 1, "Quelle grande ville, célèbre pour ses vins, est traversée par la Garonne ?", ["Bordeaux", "Lyon", "Nantes", "Strasbourg"],
    "Sa place de la Bourse se reflète dans le célèbre « miroir d'eau ».", "Bordeaux");
  Q('geographie', 1, "Quelle est la capitale de la région Bretagne ?", ["Rennes", "Brest", "Vannes", "Saint-Brieuc"],
    "Rennes est aussi la préfecture du département d'Ille-et-Vilaine.", "Rennes");
  Q('geographie', 1, "Quelle île française se trouve dans l'océan Indien ?", ["La Réunion", "La Martinique", "La Guadeloupe", "La Corse"],
    "Elle abrite le piton de la Fournaise, l'un des volcans les plus actifs du monde.", "Piton de la Fournaise");
  Q('geographie', 1, "Dans quelle ville se trouve le château construit pour Louis XIV ?", ["Versailles", "Fontainebleau", "Chambord", "Vincennes"],
    "La galerie des Glaces compte 357 miroirs.", "Château de Versailles");
  Q('geographie', 2, "Quel château de la Loire possède un célèbre escalier à double révolution ?", ["Chambord", "Chenonceau", "Amboise", "Blois"],
    "Deux personnes peuvent y monter en même temps sans jamais se croiser. On en attribue parfois l'idée à Léonard de Vinci.", "Château de Chambord");

  Q('geographie', 1, "Quel monument se dresse en haut de l'avenue des Champs-Élysées ?", ["L'Arc de triomphe", "L'obélisque", "La colonne Vendôme", "La tour Saint-Jacques"],
    "Voulu par Napoléon Ier, il a été achevé en 1836 ; douze avenues rayonnent autour de lui.", "Arc de triomphe de l'Étoile");
  Q('geographie', 1, "Quel massif montagneux sépare l'Alsace de la Lorraine ?", ["Les Vosges", "Le Jura", "Le Morvan", "Les Ardennes"],
    "Son point culminant est le Grand Ballon, à un peu plus de 1 400 mètres.", "Massif des Vosges");
  Q('geographie', 1, "Dans quelle ville se trouve le boulevard de la Croisette ?", ["Cannes", "Nice", "Antibes", "Menton"],
    "Ce boulevard bordé de palaces longe la mer sur environ deux kilomètres.", "La Croisette");
  Q('geographie', 1, "Quelle région est célèbre pour ses champs de lavande ?", ["La Provence", "La Bretagne", "L'Alsace", "La Normandie"],
    "Le plateau de Valensole est l'un des plus beaux endroits pour admirer la floraison, en juillet.", "Plateau de Valensole");
  Q('geographie', 1, "Quel fleuve marque une partie de la frontière entre la France et l'Allemagne ?", ["Le Rhin", "La Moselle", "La Meuse", "Le Danube"],
    "Le Rhin prend sa source dans les Alpes suisses et se jette dans la mer du Nord.", "Rhin");
  Q('geographie', 1, "Quelle ville bretonne entourée de remparts est surnommée « la cité corsaire » ?", ["Saint-Malo", "Concarneau", "Vannes", "Dinan"],
    "On s'y promène sur les remparts, face aux îlots du Grand Bé et du Petit Bé.", "Saint-Malo");
  Q('geographie', 2, "Dans quelle ville se dresse une cathédrale de grès rose dont la flèche culmine à 142 mètres ?", ["Strasbourg", "Metz", "Reims", "Colmar"],
    "Elle a été le plus haut édifice du monde pendant plus de deux siècles.", "Cathédrale Notre-Dame de Strasbourg");
  Q('geographie', 2, "Quel pont, inauguré en 1995, enjambe l'estuaire de la Seine entre Le Havre et Honfleur ?", ["Le pont de Normandie", "Le pont de Tancarville", "Le pont de Brotonne", "Le pont de Saint-Nazaire"],
    "À son ouverture, c'était le plus long pont à haubans du monde.", "Pont de Normandie");
  Q('geographie', 2, "Quelle rivière aux eaux vert émeraude a creusé de spectaculaires gorges en Provence ?", ["Le Verdon", "L'Ardèche", "Le Tarn", "La Durance"],
    "Ses gorges, profondes par endroits de plus de 700 mètres, attirent randonneurs et kayakistes.", "Gorges du Verdon");
  Q('geographie', 2, "Quelle ville romaine était alimentée en eau par l'aqueduc du pont du Gard ?", ["Nîmes", "Arles", "Avignon", "Orange"],
    "Construit au Ier siècle, le pont franchit la rivière du Gardon sur trois rangées d'arches.", "Pont du Gard");
  Q('geographie', 2, "Quelle ville d'Alsace possède un quartier pittoresque surnommé « la Petite Venise » ?", ["Colmar", "Mulhouse", "Sélestat", "Haguenau"],
    "Ses maisons à colombages colorées se reflètent dans les eaux de la Lauch.", "Colmar");
  Q('geographie', 2, "Quelle île vendéenne est accessible à marée basse par le passage du Gois ?", ["Noirmoutier", "L'île d'Yeu", "L'île de Ré", "L'île d'Aix"],
    "Le passage du Gois, long de plus de 4 kilomètres, est recouvert par la mer deux fois par jour.", "Passage du Gois");
  Q('geographie', 2, "Quelle région de marais, parcourue en barque, est surnommée « la Venise verte » ?", ["Le Marais poitevin", "La Camargue", "La Brière", "La Dombes"],
    "On y circule en barque à fond plat, le long de canaux ombragés.", "Marais poitevin");
  Q('geographie', 2, "Dans quelle ville se trouve la place Stanislas ?", ["Nancy", "Metz", "Lunéville", "Épinal"],
    "Ses grilles dorées sont l'œuvre du ferronnier Jean Lamour. Elle est inscrite au patrimoine mondial de l'Unesco.", "Place Stanislas");
  Q('geographie', 2, "Dans quelle ville se trouve le château des ducs de Bretagne ?", ["Nantes", "Rennes", "Vannes", "Quimper"],
    "Ancienne capitale des ducs de Bretagne, Nantes est aujourd'hui la préfecture de la Loire-Atlantique.", "Château des ducs de Bretagne");
  Q('geographie', 2, "Quelle rivière le viaduc de Millau, inauguré en 2004, franchit-il ?", ["Le Tarn", "Le Lot", "L'Aveyron", "La Dordogne"],
    "Sa plus haute pile dépasse 240 mètres : c'est l'un des ponts les plus hauts du monde.", "Viaduc de Millau");
  Q('geographie', 3, "Quel est le point culminant du Massif central ?", ["Le puy de Sancy", "Le puy de Dôme", "Le plomb du Cantal", "Le mont Mézenc"],
    "Il culmine à 1 885 mètres ; la Dordogne prend sa source sur ses pentes.", "Puy de Sancy");
  Q('geographie', 3, "Quel est le plus haut sommet des Pyrénées françaises ?", ["Le Vignemale", "Le pic du Midi de Bigorre", "Le Canigou", "Le pic d'Anie"],
    "Il culmine à 3 298 mètres, sur la frontière avec l'Espagne.", "Vignemale");
  Q('geographie', 3, "Quelle ville est la préfecture de l'Aveyron ?", ["Rodez", "Millau", "Villefranche-de-Rouergue", "Decazeville"],
    "Sa cathédrale de grès rouge domine la ville, qui abrite aussi le musée Soulages.", "Rodez");
  Q('geographie', 3, "Quelle ville est la préfecture de la Corrèze ?", ["Tulle", "Brive-la-Gaillarde", "Ussel", "Uzerche"],
    "Brive est plus peuplée, mais c'est Tulle, connue pour ses accordéons Maugein, qui est la préfecture.", "Tulle");
  Q('geographie', 3, "Quel fleuve traverse Rennes avant de se jeter dans l'Atlantique ?", ["La Vilaine", "La Rance", "Le Blavet", "L'Odet"],
    "À Rennes, elle reçoit les eaux de l'Ille : les deux rivières ont donné leur nom au département d'Ille-et-Vilaine.", "Vilaine (fleuve)");
  Q('geographie', 3, "Quelle ville a été reconstruite par l'architecte Auguste Perret, et son centre inscrit au patrimoine mondial ?", ["Le Havre", "Brest", "Saint-Nazaire", "Dunkerque"],
    "Son centre, bâti en béton par Auguste Perret, est inscrit à l'Unesco depuis 2005.", "Église Saint-Joseph du Havre");
  Q('geographie', 3, "Dans quel département d'Auvergne se trouve un immense ancien volcan, souvent présenté comme le plus vaste d'Europe ?", ["Le Cantal", "La Haute-Loire", "L'Allier", "La Creuse"],
    "Ce massif d'environ 70 kilomètres de diamètre culmine au plomb du Cantal.", "Monts du Cantal");
  Q('geographie', 3, "Dans quelle ville du Gers se dresse la statue de d'Artagnan, au pied d'un grand escalier ?", ["Auch", "Condom", "Lectoure", "Mirande"],
    "Le vrai d'Artagnan, Charles de Batz de Castelmore, était un Gascon né près de Lupiac.", "Auch");
  Q('geographie', 3, "Quelle île varoise est devenue un parc national dès 1963 ?", ["Port-Cros", "Porquerolles", "L'île du Levant", "L'île de Bendor"],
    "C'est l'un des premiers parcs nationaux marins d'Europe ; on peut y suivre un sentier sous-marin avec masque et tuba.", "Île de Port-Cros");

  /* ---------- Cuisine et terroir ---------- */
  Q('cuisine', 1, "Quelle ville a donné son nom à la moutarde la plus célèbre de France ?", ["Dijon", "Lyon", "Reims", "Troyes"],
    "La moutarde de Dijon est faite de graines de moutarde, de vinaigre ou de verjus, et de sel.", "Moutarde de Dijon");
  Q('cuisine', 1, "De quelle région le camembert est-il originaire ?", ["La Normandie", "La Bretagne", "La Savoie", "L'Auvergne"],
    "Selon la tradition, Marie Harel l'aurait mis au point à la fin du XVIIIe siècle.", "Camembert (fromage)");
  Q('cuisine', 2, "Avec quel lait le roquefort est-il fabriqué ?", ["Du lait de brebis", "Du lait de vache", "Du lait de chèvre", "Du lait de bufflonne"],
    "Il est affiné dans les caves naturelles de Roquefort-sur-Soulzon, dans l'Aveyron.", "Roquefort (fromage)");
  Q('cuisine', 2, "Quelle ville est célèbre pour ses calissons ?", ["Aix-en-Provence", "Montélimar", "Nice", "Carpentras"],
    "Le calisson est une confiserie d'amandes et de melon confit, en forme de petit bateau.", "Calisson");
  Q('cuisine', 1, "Quelle ville est réputée pour son nougat ?", ["Montélimar", "Aix-en-Provence", "Nancy", "Cambrai"],
    "Le nougat de Montélimar contient du miel et des amandes.", "Nougat de Montélimar");
  Q('cuisine', 2, "Qu'est-ce qu'une « bêtise de Cambrai » ?", ["Un bonbon à la menthe", "Un gâteau aux pommes", "Un fromage", "Une saucisse"],
    "La légende raconte qu'elle serait née d'une erreur d'un apprenti confiseur.", "Bêtise de Cambrai");
  Q('cuisine', 1, "Quels sont les ingrédients principaux de la tartiflette ?", ["Pommes de terre et reblochon", "Pâtes et comté", "Riz et emmental", "Chou et saucisse"],
    "Cette recette savoyarde a été popularisée dans les années 1980 pour faire connaître le reblochon.", "Tartiflette");
  Q('cuisine', 1, "Quel plat alsacien associe chou fermenté et charcuteries ?", ["La choucroute", "La potée", "Le cassoulet", "La garbure"],
    "On la sert avec des saucisses de Strasbourg, du lard et des pommes de terre.", "Choucroute");
  Q('cuisine', 3, "Quelle ville se dispute avec Toulouse et Carcassonne le titre de capitale du cassoulet ?", ["Castelnaudary", "Bayonne", "Agen", "Albi"],
    "Chacune de ces trois villes défend sa propre recette, aux haricots blancs et à la viande confite.", "Castelnaudary");
  Q('cuisine', 1, "Lequel de ces légumes entre dans la ratatouille ?", ["L'aubergine", "Le poireau", "Le navet", "Le chou-fleur"],
    "La ratatouille niçoise réunit aubergines, courgettes, poivrons, tomates et oignons.", "Aubergine");
  Q('cuisine', 1, "La bouillabaisse est une soupe de poissons de quelle ville ?", ["Marseille", "Bordeaux", "Brest", "Nantes"],
    "Elle se sert avec des croûtons et une sauce rouille.", "Bouillabaisse");
  Q('cuisine', 3, "Quelle ville est célèbre pour ses macarons et ses bergamotes ?", ["Nancy", "Metz", "Reims", "Dijon"],
    "La bergamote de Nancy est un petit bonbon doré parfumé à l'essence de bergamote.", "Bergamote de Nancy");
  Q('cuisine', 2, "De quelle région vient le kouign-amann ?", ["La Bretagne", "Le Pays basque", "L'Alsace", "La Normandie"],
    "Son nom signifie « gâteau au beurre » en breton. Il est né à Douarnenez.", "Kouign-amann");
  Q('cuisine', 2, "Quelle est la spécialité de la ville d'Agen ?", ["Les pruneaux", "Les noix", "Les cerises", "Les olives"],
    "Ils sont préparés à partir de la prune d'Ente, séchée au four.", "Pruneau");
  Q('cuisine', 1, "Quel vin pétillant est produit autour de Reims et d'Épernay ?", ["Le champagne", "Le muscadet", "Le beaujolais", "Le sauternes"],
    "La tradition attribue à un moine, dom Pérignon, un rôle important dans son élaboration.", "Champagne (AOC)");
  Q('cuisine', 2, "Quand le beaujolais nouveau est-il traditionnellement mis en vente ?", ["Le troisième jeudi de novembre", "Le 1er mai", "Le 14 juillet", "Le jour de Noël"],
    "« Le beaujolais nouveau est arrivé ! » annoncent alors les affiches des cafés.");
  Q('cuisine', 2, "Quelle pâtisserie en forme de couronne porte le nom d'une course cycliste ?", ["Le paris-brest", "Le saint-honoré", "L'opéra", "Le mille-feuille"],
    "Elle a été créée en 1910 pour célébrer la course Paris-Brest-Paris ; sa forme rappelle une roue de vélo.", "Paris-brest");
  Q('cuisine', 1, "Que cache-t-on traditionnellement dans la galette des Rois ?", ["Une fève", "Une pièce", "Une bague", "Un dé"],
    "Celui ou celle qui trouve la fève devient le roi ou la reine et porte la couronne.", "Galette des rois");
  Q('cuisine', 1, "Quelle sauce froide est faite de jaune d'œuf, de moutarde et d'huile ?", ["La mayonnaise", "La béchamel", "La vinaigrette", "La sauce béarnaise"],
    "La béchamel, elle, est une sauce chaude à base de lait, de beurre et de farine.", "Mayonnaise");
  Q('cuisine', 1, "Quelle tarte se cuit à l'envers, les pommes caramélisées en dessous ?", ["La tarte Tatin", "La tarte normande", "La tarte bourdaloue", "La tarte au sucre"],
    "Elle doit son nom aux sœurs Tatin, qui tenaient un hôtel à Lamotte-Beuvron, en Sologne.", "Tarte Tatin");
  Q('cuisine', 2, "Quelle région est célèbre pour ses volailles aux pattes bleues ?", ["La Bresse", "La Beauce", "La Brie", "La Sologne"],
    "Pattes bleues, plumage blanc et crête rouge : on dit que c'est une volaille « tricolore ».", "Volaille de Bresse");
  Q('cuisine', 2, "Quel fromage à pâte dure est fabriqué en grosses meules dans le massif du Jura ?", ["Le comté", "Le camembert", "Le munster", "Le roquefort"],
    "Il faut environ 400 litres de lait pour fabriquer une meule de comté.", "Comté (fromage)");
  Q('cuisine', 2, "De quelle région vient le munster ?", ["L'Alsace et les Vosges", "La Bretagne", "L'Auvergne", "La Provence"],
    "Ce fromage au goût prononcé se déguste souvent avec un peu de cumin.", "Munster (fromage)");
  Q('cuisine', 1, "Quelle viande est à la base du pot-au-feu ?", ["Le bœuf", "Le poulet", "Le poisson", "L'agneau"],
    "On le prépare avec des légumes (carottes, poireaux, navets) et des os à moelle.", "Pot-au-feu");
  Q('cuisine', 2, "Quelle crème fouettée porte le nom d'un château au nord de Paris ?", ["La crème chantilly", "La crème brûlée", "La crème anglaise", "La crème pâtissière"],
    "Le château de Chantilly se trouve dans l'Oise.", "Crème chantilly");
  Q('cuisine', 1, "Que met-on traditionnellement dans la quiche lorraine ?", ["Des lardons", "Du saumon", "Des champignons", "Du poulet"],
    "La recette classique : pâte, œufs, crème fraîche et lardons.", "Quiche lorraine");
  Q('cuisine', 1, "À quelle fête mange-t-on traditionnellement des crêpes ?", ["La Chandeleur", "Pâques", "Noël", "La Toussaint"],
    "La Chandeleur a lieu le 2 février. On fait sauter la crêpe avec une pièce dans l'autre main pour avoir de la chance.", "Crêpe");

  Q('cuisine', 1, "Quel fromage de Seine-et-Marne est surnommé « le roi des fromages » ?", ["Le brie", "Le camembert", "Le roquefort", "Le comté"],
    "Selon la tradition, le brie de Meaux aurait été sacré « roi des fromages » lors du congrès de Vienne, en 1815.", "Brie de Meaux");
  Q('cuisine', 1, "Quel plat de bœuf mijoté au vin rouge est une spécialité de Bourgogne ?", ["Le bœuf bourguignon", "Le pot-au-feu", "La blanquette de veau", "Le navarin"],
    "On le prépare avec des lardons, des champignons et des petits oignons.", "Bœuf bourguignon");
  Q('cuisine', 1, "De quelle région viennent les galettes de sarrasin ?", ["La Bretagne", "L'Alsace", "La Provence", "Le Limousin"],
    "La galette « complète » est garnie de jambon, d'œuf et de fromage râpé.");
  Q('cuisine', 1, "Quel apéritif anisé est associé à Marseille ?", ["Le pastis", "Le pineau", "La suze", "Le cognac"],
    "Paul Ricard a lancé son pastis à Marseille en 1932. On le sert avec de l'eau fraîche.", "Pastis");
  Q('cuisine', 1, "Quel fruit garnit le clafoutis traditionnel du Limousin ?", ["Les cerises", "Les pommes", "Les poires", "Les prunes"],
    "Traditionnellement, on ne dénoyaute pas les cerises : les noyaux donnent un petit goût d'amande.", "Clafoutis");
  Q('cuisine', 1, "Quel est l'ingrédient principal de l'aïoli provençal ?", ["L'ail", "Le basilic", "La moutarde", "L'anchois"],
    "En Provence, le « grand aïoli » se sert avec de la morue, des légumes et des œufs durs.", "Aïoli");
  Q('cuisine', 2, "Quel apéritif associe vin blanc et crème de cassis ?", ["Le kir", "Le pastis", "Le pineau", "Le picon"],
    "Il porte le nom du chanoine Félix Kir, ancien maire de Dijon.", "Kir");
  Q('cuisine', 2, "Quel fromage du Nord, à la croûte orangée, est réputé pour son odeur puissante ?", ["Le maroilles", "Le munster", "Le livarot", "L'époisses"],
    "Il serait né à l'abbaye de Maroilles, il y a plus de mille ans.", "Maroilles (fromage)");
  Q('cuisine', 2, "Quelle eau-de-vie normande est obtenue en distillant du cidre ?", ["Le calvados", "Le cognac", "L'armagnac", "Le marc de Bourgogne"],
    "On le boit parfois en « trou normand », au milieu du repas, pour se remettre en appétit.", "Calvados (eau-de-vie)");
  Q('cuisine', 2, "Quelle petite prune jaune et sucrée est la grande spécialité de la Lorraine ?", ["La mirabelle", "La reine-claude", "La quetsche", "La prune d'Ente"],
    "La Lorraine produit la grande majorité des mirabelles du monde.", "Mirabelle de Lorraine");
  Q('cuisine', 2, "Quelle ville du Pays basque a donné son nom à un célèbre jambon ?", ["Bayonne", "Biarritz", "Hendaye", "Saint-Jean-de-Luz"],
    "Il est salé puis séché lentement pendant de longs mois.", "Jambon de Bayonne");
  Q('cuisine', 2, "Quel piment basque est séché en guirlandes sur les façades des maisons ?", ["Le piment d'Espelette", "Le piment de Cayenne", "Le paprika", "Le poivre de Kampot"],
    "Il bénéficie d'une appellation d'origine depuis 2000, et le village d'Espelette lui consacre une fête chaque automne.", "Piment d'Espelette");
  Q('cuisine', 2, "Quelle ville bourguignonne est célèbre pour ses Hospices et leur vente de vins aux enchères ?", ["Beaune", "Dijon", "Chablis", "Mâcon"],
    "Les Hospices, aux toits de tuiles vernissées multicolores, ont été fondés en 1443.", "Hospices de Beaune");
  Q('cuisine', 2, "Quelle spécialité lyonnaise est une sorte de boulette pochée, souvent au brochet ?", ["La quenelle", "Le saucisson brioché", "La cervelle de canut", "Le tablier de sapeur"],
    "On la sert souvent nappée de sauce Nantua, aux écrevisses.", "Quenelle");
  Q('cuisine', 2, "Quelle spécialité niçoise est une grande galette de farine de pois chiches ?", ["La socca", "La pissaladière", "La fougasse", "La fouace"],
    "On la cuit sur de grandes plaques au four à bois et on la mange chaude, bien poivrée.", "Socca");
  Q('cuisine', 2, "Quelle petite pâtisserie bordelaise est parfumée au rhum et à la vanille ?", ["Le canelé", "Le financier", "La madeleine", "Le macaron"],
    "Sa croûte caramélisée cache un cœur moelleux ; on le cuit dans de petits moules cannelés en cuivre.", "Cannelé");
  Q('cuisine', 2, "Quelle ville de la Meuse est célèbre pour ses madeleines ?", ["Commercy", "Verdun", "Bar-le-Duc", "Saint-Mihiel"],
    "Marcel Proust a rendu la madeleine célèbre dans « Du côté de chez Swann ».", "Madeleine (pâtisserie)");
  Q('cuisine', 3, "Quel fromage de chèvre du Berry a la forme d'une pyramide tronquée ?", ["Le valençay", "Le crottin de Chavignol", "Le pélardon", "Le picodon"],
    "Selon la légende, Napoléon, de retour d'Égypte, en aurait fait couper le sommet d'un coup d'épée.", "Valençay (fromage)");
  Q('cuisine', 3, "Quel fromage bleu d'Auvergne a une forme de haut cylindre ?", ["La fourme d'Ambert", "Le saint-nectaire", "Le cantal", "Le salers"],
    "Ambert, la ville qui lui a donné son nom, se trouve dans le Puy-de-Dôme.", "Fourme d'Ambert");
  Q('cuisine', 3, "Quel cépage donne l'essentiel des vins rouges du Beaujolais ?", ["Le gamay", "Le pinot noir", "Le merlot", "Le cabernet sauvignon"],
    "Sa peau noire cache un jus blanc ; c'est aussi le cépage du beaujolais nouveau.", "Gamay");
  Q('cuisine', 3, "Quel vin blanc liquoreux de Gironde naît de raisins touchés par la « pourriture noble » ?", ["Le sauternes", "Le muscadet", "Le chablis", "Le sancerre"],
    "Un petit champignon, le botrytis, concentre le sucre des grains de raisin.", "Sauternes (AOC)");
  Q('cuisine', 3, "Qu'est-ce que la « cervelle de canut » lyonnaise ?", ["Un fromage blanc aux herbes", "Une cervelle d'agneau", "Un gâteau au chocolat", "Une saucisse fumée"],
    "Les canuts étaient les ouvriers de la soie du quartier de la Croix-Rousse.", "Cervelle de canut");
  Q('cuisine', 3, "Quel fromage du Haut-Doubs, cerclé d'épicéa, se déguste aussi chaud, au four ?", ["Le mont-d'or", "Le morbier", "Le comté", "Le bleu de Gex"],
    "Il n'est fabriqué que pendant la saison froide, de la mi-août à la mi-mars.", "Mont d'Or (fromage)");
  Q('cuisine', 3, "Quel fromage de Savoie, au talon creusé, est surnommé « le prince des gruyères » ?", ["Le beaufort", "L'abondance", "La tomme de Savoie", "Le reblochon"],
    "Son talon concave vient de la sangle de bois qui le cerclait pendant sa fabrication.", "Beaufort (fromage)");
  Q('cuisine', 3, "Quel fromage de chèvre de Touraine est traversé par une paille de seigle ?", ["Le sainte-maure-de-touraine", "Le crottin de Chavignol", "Le valençay", "Le pélardon"],
    "La paille sert à consolider ce long fromage, fragile quand il est jeune.", "Sainte-maure-de-touraine");
  Q('cuisine', 3, "Quelle spécialité de Sète est une petite tourte garnie de poulpe à la sauce tomate ?", ["La tielle", "La pissaladière", "La flamiche", "La fougasse"],
    "Elle a été apportée à Sète par des familles de pêcheurs venues de Gaète, en Italie.", "Tielle");

  /* ---------- Vie d'autrefois ---------- */
  Q('autrefois', 1, "Quelle était la monnaie de la France avant l'euro ?", ["Le franc", "Le louis", "L'écu", "La livre"],
    "Le franc a été remplacé par l'euro en 2002 : 1 euro valait 6,55957 francs.", "Franc français");
  Q('autrefois', 2, "En 1960, combien d'anciens francs valait un « nouveau franc » ?", ["100", "10", "1 000", "50"],
    "Longtemps après, beaucoup de gens comptaient encore en anciens francs, surtout pour les grosses sommes.");
  Q('autrefois', 1, "En quelle année les pièces et billets en euros ont-ils remplacé le franc ?", ["2002", "1999", "2000", "2004"],
    "Le passage a eu lieu le 1er janvier 2002 ; il fallait souvent sa petite calculette pour convertir.");
  Q('autrefois', 1, "À quoi servait la bouillotte ?", ["À réchauffer le lit", "À faire bouillir le lait", "À conserver la soupe", "À laver le linge"],
    "On la remplissait d'eau chaude avant de la glisser sous les draps.", "Bouillotte");
  Q('autrefois', 1, "Sur les anciens téléphones, avec quoi composait-on le numéro ?", ["Un cadran rotatif", "Un écran tactile", "Une télécommande", "Une molette"],
    "On glissait le doigt dans le trou du chiffre et on tournait le cadran jusqu'à la butée.", "Cadran téléphonique");
  Q('autrefois', 1, "Quel service français, lancé au début des années 1980, se consultait sur un petit écran relié au téléphone ?", ["Le Minitel", "Le Télex", "Le Bip", "Le Tam-tam"],
    "On y consultait l'annuaire, les horaires de train ou ses comptes, avec des codes comme le 3615.", "Minitel");
  Q('autrefois', 1, "Quelle célèbre voiture Citroën était surnommée « la deuche » ?", ["La 2 CV", "La DS", "La Traction", "L'Ami 6"],
    "Présentée en 1948, elle devait pouvoir transporter un panier d'œufs à travers un champ sans les casser.", "Citroën 2 CV");
  Q('autrefois', 3, "Quelle voiture Renault d'après-guerre était surnommée « la motte de beurre » ?", ["La 4 CV", "La Dauphine", "La 4L", "La R5"],
    "On la surnommait ainsi à cause de sa forme arrondie et de sa peinture jaune sable des premiers modèles.", "Renault 4CV");
  Q('autrefois', 1, "À quoi servait le buvard à l'école ?", ["À absorber l'encre", "À effacer le crayon", "À tailler les crayons", "À ranger les plumes"],
    "Il évitait les taches d'encre. Les buvards étaient souvent illustrés de publicités.", "Papier buvard");
  Q('autrefois', 1, "Qu'était le certificat d'études ?", ["Un diplôme de fin d'école primaire", "Un permis de conduire", "Un certificat médical", "Un diplôme universitaire"],
    "Ce diplôme, préparé vers 12 ou 13 ans, a été supprimé en 1989.");
  Q('autrefois', 2, "À quoi servait la lessiveuse ?", ["À faire bouillir le linge", "À laver la vaisselle", "À repasser", "À sécher le linge"],
    "On la posait sur le feu ; l'eau bouillante remontait par un tube central et arrosait le linge.", "Lessiveuse");
  Q('autrefois', 1, "Qu'appelait-on un « 45 tours » ?", ["Un petit disque vinyle", "Un tracteur", "Un manège de fête foraine", "Une cassette audio"],
    "Il contenait en général deux à quatre chansons et tournait à 45 tours par minute.", "Disque microsillon");
  Q('autrefois', 1, "Qui distribuait le courrier, souvent à vélo, dans les villages ?", ["Le facteur", "Le garde champêtre", "Le gendarme", "Le cantonnier"],
    "Il passait aussi, en fin d'année, proposer son calendrier.", "Facteur (courrier)");
  Q('autrefois', 2, "Qui lisait les avis de la mairie au son du tambour, dans les villages ?", ["Le garde champêtre", "Le facteur", "Le curé", "Le maréchal-ferrant"],
    "Il commençait par le fameux « Avis à la population ! ».", "Garde champêtre");
  Q('autrefois', 1, "Quel artisan ferrait les chevaux ?", ["Le maréchal-ferrant", "Le charron", "Le bourrelier", "Le tonnelier"],
    "Le charron fabriquait les roues, le bourrelier les harnais et le tonnelier les tonneaux.", "Maréchal-ferrant");
  Q('autrefois', 2, "Que faisait le rémouleur qui passait dans les rues ?", ["Il aiguisait les couteaux", "Il ramonait les cheminées", "Il vendait du charbon", "Il réparait les chaussures"],
    "Il annonçait son passage en criant et faisait tourner sa meule avec une pédale.", "Rémouleur");
  Q('autrefois', 2, "Quel écrivain figurait sur le billet de 50 francs des années 1990 ?", ["Antoine de Saint-Exupéry", "Victor Hugo", "Molière", "Voltaire"],
    "On y voyait aussi le Petit Prince et un avion.", "Antoine de Saint-Exupéry");
  Q('autrefois', 3, "Quel est le premier hypermarché ouvert en France, en 1963 ?", ["Carrefour", "Auchan", "Leclerc", "Mammouth"],
    "Il a ouvert à Sainte-Geneviève-des-Bois, dans l'Essonne.");
  Q('autrefois', 1, "Dans quel jeu de société achète-t-on des rues, dont la rue de la Paix ?", ["Le Monopoly", "Le Scrabble", "Les Petits Chevaux", "Le Cluedo"],
    "Dans la version française, la rue de la Paix est la case la plus chère.", "Monopoly");
  Q('autrefois', 1, "Avec quel objet moulait-on le café à la maison ?", ["Le moulin à café", "Le presse-purée", "Le hachoir", "La passoire"],
    "On le coinçait souvent entre ses genoux pour tourner la manivelle.", "Moulin à café");
  Q('autrefois', 2, "Que désignait autrefois l'abréviation « TSF » ?", ["La radio", "La télévision", "Le téléphone", "Le tourne-disque"],
    "TSF signifie « télégraphie sans fil ». On disait « écouter la TSF ».");
  Q('autrefois', 1, "Que faisait-on au lavoir ?", ["On lavait le linge", "On faisait le pain", "On ferrait les chevaux", "On votait"],
    "Les lavandières y battaient le linge, et c'était aussi un lieu où l'on échangeait les nouvelles.", "Lavoir (bassin public)");
  Q('autrefois', 1, "Avec quoi les écoliers écrivaient-ils à l'encre, autrefois ?", ["Un porte-plume", "Un stylo-bille", "Un feutre", "Un crayon de couleur"],
    "On trempait la plume dans l'encrier posé sur le pupitre. Le stylo-bille l'a peu à peu remplacé.", "Porte-plume (écriture)");
  Q('autrefois', 1, "Qu'est-ce qu'un Solex ?", ["Un vélomoteur", "Un appareil photo", "Un poste de radio", "Un réfrigérateur"],
    "Son moteur était posé au-dessus de la roue avant, qu'il entraînait par un galet.", "VéloSoleX");

  Q('autrefois', 1, "Comment appelait-on le petit poste de radio portatif à piles, très à la mode dans les années 1960 ?", ["Le transistor", "Le phonographe", "Le Minitel", "Le magnétophone"],
    "On l'emportait partout, à la plage comme au jardin, pour écouter ses émissions préférées.");
  Q('autrefois', 1, "Quel petit appareil, apparu en 1979, permettait d'écouter des cassettes en marchant, avec un casque ?", ["Le baladeur", "Le tourne-disque", "Le juke-box", "Le magnétoscope"],
    "Le premier modèle, de la marque japonaise Sony, s'appelait le Walkman.", "Baladeur");
  Q('autrefois', 1, "Quel autocuiseur, lancé par la marque SEB dans les années 1950, a équipé des millions de cuisines ?", ["La Cocotte-Minute", "La sorbetière", "Le bain-marie", "Le faitout"],
    "Son petit sifflement, quand la soupape se met à tourner, annonce que la cuisson a commencé.", "Autocuiseur");
  Q('autrefois', 1, "Quelle voiture Citroën, présentée en 1955, était surnommée « la Déesse » ?", ["La DS", "La 2 CV", "La Traction", "L'Ami 6"],
    "Sa suspension hydropneumatique lui permettait de « flotter » sur la route. Elle a fait sensation au Salon de l'automobile.", "Citroën DS");
  Q('autrefois', 1, "Qui est Bibendum, le célèbre bonhomme blanc fait de pneus ?", ["La mascotte de Michelin", "La mascotte de Renault", "Un personnage de Tintin", "Un clown du cirque Pinder"],
    "Il est apparu en 1898 sur une affiche dessinée par O'Galop.", "Bibendum");
  Q('autrefois', 1, "Quelle marque automobile fabriquait les 203, 403 et 404 ?", ["Peugeot", "Renault", "Citroën", "Simca"],
    "À la télévision, l'inspecteur Columbo roulait dans une vieille Peugeot 403 cabriolet.", "Peugeot 403");
  Q('autrefois', 2, "Quelle marque lyonnaise d'électrophones en forme de valise animait les fêtes des années 1950 et 1960 ?", ["Teppaz", "Moulinex", "Solex", "Frigidaire"],
    "Légers et faciles à transporter, ces tourne-disques passaient les 45 tours de toutes les idoles.");
  Q('autrefois', 2, "Comment appelait-on les fêtes entre jeunes, où l'on dansait sur des disques à la maison ?", ["Les surprises-parties", "Les guinguettes", "Les kermesses", "Les veillées"],
    "On les appelait aussi « surboums », puis tout simplement « boums ».");
  Q('autrefois', 2, "Quelle marque d'électroménager avait pour slogan « … libère la femme » ?", ["Moulinex", "Seb", "Calor", "Tefal"],
    "Son fondateur, Jean Mantelet, avait inventé en 1932 un moulin à légumes qui a fait sa fortune.");
  Q('autrefois', 2, "Quelle petite voiture Renault, lancée en 1961, a été vendue à plus de huit millions d'exemplaires ?", ["La 4L", "La Dauphine", "La R16", "La Frégate"],
    "Pratique et robuste, elle a servi aussi bien aux familles qu'aux gendarmes et aux postiers.", "Renault 4");
  Q('autrefois', 2, "Comment s'appelait le célèbre cyclomoteur de la marque Motobécane ?", ["La Mobylette", "La Vespa", "Le Solex", "Le Ciao"],
    "Le mot « mobylette », à l'origine un nom de marque, est devenu un nom commun.", "Mobylette");
  Q('autrefois', 2, "Comment appelait-on à Paris le marchand de charbon et de bois, qui tenait souvent aussi un café ?", ["Le bougnat", "Le chiffonnier", "Le colporteur", "Le rémouleur"],
    "Beaucoup de bougnats parisiens étaient originaires de l'Aveyron et de l'Auvergne.");
  Q('autrefois', 2, "Qu'appelait-on familièrement des « godillots » ?", ["De grosses chaussures", "Des chapeaux", "Des petits verres", "Des gants"],
    "Le mot vient d'Alexis Godillot, qui fournissait des chaussures à l'armée au XIXe siècle.");
  Q('autrefois', 2, "Qu'appelait-on une « micheline » ?", ["Un autorail sur pneus", "Un vélomoteur", "Une machine à coudre", "Un poêle à bois"],
    "Ces autorails montés sur pneus ont été mis au point par l'entreprise Michelin dans les années 1930.", "Micheline (transport)");
  Q('autrefois', 2, "Quel jeu de cartes se joue avec un paquet de 78 cartes ?", ["Le tarot", "La belote", "La manille", "Le rami"],
    "Il comprend 21 atouts et l'Excuse ; mener le « petit au bout » rapporte des points en plus.", "Tarot français");
  Q('autrefois', 2, "Comment appelait-on les jeunes filles de 25 ans encore célibataires, fêtées le 25 novembre ?", ["Les catherinettes", "Les midinettes", "Les cousettes", "Les rosières"],
    "Elles portaient ce jour-là des chapeaux extravagants aux couleurs jaune et vert.");
  Q('autrefois', 2, "De quelle région viennent les horloges comtoises, qui ornaient tant de salles à manger ?", ["La Franche-Comté", "La Bretagne", "La Normandie", "L'Alsace"],
    "Elles étaient fabriquées notamment autour de Morez et de Morbier, dans le Jura.", "Horloge comtoise");
  Q('autrefois', 3, "En quelle année la deuxième chaîne de télévision a-t-elle été lancée en France ?", ["1964", "1950", "1972", "1981"],
    "C'est elle qui, la première, a diffusé des programmes en couleur, en 1967.");
  Q('autrefois', 3, "Qu'appelait-on « le tub », avant l'arrivée des salles de bains ?", ["Une grande bassine pour se laver", "Un autobus", "Un placard à linge", "Un poêle à charbon"],
    "On y faisait sa toilette avec de l'eau chauffée sur la cuisinière.");
  Q('autrefois', 3, "Quel jouet à dessiner, muni de deux boutons, a été inventé par un Français à la fin des années 1950 ?", ["Le Télécran", "Le Spirographe", "L'Ardoise magique", "Le Kaléidoscope"],
    "Son inventeur, André Cassagnes, a vendu son idée à une firme américaine, qui en a fait un succès mondial.");
  Q('autrefois', 3, "Quelle émission de radio d'Europe 1, lancée en 1959, a accompagné la vague « yé-yé » ?", ["« Salut les copains »", "« Le Pop Club »", "« Les Grosses Têtes »", "« La Tribune de l'histoire »"],
    "Animée par Daniel Filipacchi et Frank Ténot, elle a donné naissance à un magazine du même nom en 1962.");
  Q('autrefois', 3, "Que signifiait le sigle « ORTF » ?", ["Office de radiodiffusion-télévision française", "Organisation régionale de la télévision française", "Office royal de la télévision et du film", "Ordre des radios et télévisions de France"],
    "Créé en 1964, l'ORTF a été remplacé en 1975 par plusieurs sociétés, dont TF1, Antenne 2 et FR3.");
  Q('autrefois', 3, "Pour un appelé du service militaire, que signifiait « la quille » ?", ["La fin du service", "Une permission", "Une corvée", "Le premier jour à la caserne"],
    "Cent jours avant la libération, les appelés fêtaient le « Père Cent ».");
  Q('autrefois', 3, "Quelle était la valeur de la pièce d'or appelée « napoléon » ?", ["20 francs", "10 francs", "50 francs", "100 francs"],
    "La pièce de 10 francs en or était, elle, surnommée « demi-napoléon ».");
  Q('autrefois', 3, "Quel industriel a lancé en 1950 le célèbre stylo à bille Bic Cristal ?", ["Marcel Bich", "Marcel Dassault", "André Citroën", "Louis Renault"],
    "Le nom de la marque vient de son propre nom, Bich, raccourci en « Bic ».", "Bic Cristal");
  Q('autrefois', 3, "Quel train de luxe à voitures-lits reliait Calais et Paris à la Côte d'Azur ?", ["Le Train bleu", "Le Mistral", "Le Capitole", "L'Orient-Express"],
    "Le célèbre restaurant de la gare de Lyon, à Paris, porte son nom.");

  /* ---------- Nature ---------- */
  Q('nature', 1, "Quel arbre donne des glands ?", ["Le chêne", "Le hêtre", "Le châtaignier", "Le noyer"],
    "Les glands nourrissent de nombreux animaux, comme les geais, les écureuils et les sangliers.", "Chêne");
  Q('nature', 1, "Quel oiseau est l'un des symboles de la France ?", ["Le coq", "L'aigle", "Le pigeon", "Le merle"],
    "En latin, le même mot « gallus » désignait le coq et le Gaulois.", "Coq");
  Q('nature', 1, "Combien de pattes a une araignée ?", ["8", "6", "10", "12"],
    "Les araignées ne sont pas des insectes : les insectes, eux, ont 6 pattes.");
  Q('nature', 1, "Quel animal construit des barrages sur les rivières ?", ["Le castor", "La loutre", "Le ragondin", "Le héron"],
    "Le castor abat des arbres avec ses dents, qui poussent toute sa vie.", "Castor fiber");
  Q('nature', 1, "Quel est le plus grand animal du monde ?", ["La baleine bleue", "L'éléphant d'Afrique", "Le cachalot", "La girafe"],
    "Elle peut dépasser 25 mètres de long.", "Baleine bleue");
  Q('nature', 1, "Quelle fleur offre-t-on le 1er mai en France ?", ["Le muguet", "La rose", "La violette", "La jonquille"],
    "Selon la tradition, le muguet porte bonheur.", "Muguet de mai");
  Q('nature', 3, "Quel conifère perd ses aiguilles en hiver ?", ["Le mélèze", "Le sapin", "L'épicéa", "Le pin"],
    "C'est le seul conifère de nos forêts à perdre ses aiguilles ; elles deviennent dorées à l'automne.", "Larix decidua");
  Q('nature', 1, "Comment appelle-t-on le petit de la biche ?", ["Le faon", "Le chevreau", "L'agneau", "Le poulain"],
    "Le faon porte des taches blanches sur le dos pendant ses premiers mois.");
  Q('nature', 1, "Quel oiseau migrateur annonce le retour du printemps ?", ["L'hirondelle", "Le moineau", "Le pigeon", "Le corbeau"],
    "Les hirondelles passent l'hiver en Afrique et reviennent nicher chez nous.", "Hirondelle rustique");
  Q('nature', 1, "Vers quelle date commence l'été ?", ["Vers le 21 juin", "Le 1er juin", "Le 14 juillet", "Vers le 21 mai"],
    "C'est le solstice d'été, le jour le plus long de l'année. Il tombe le 20 ou le 21 juin.");
  Q('nature', 1, "Quel insecte fabrique le miel ?", ["L'abeille", "La guêpe", "La coccinelle", "La fourmi"],
    "Pour produire un pot de miel, les abeilles visitent des milliers de fleurs.", "Apis mellifera");
  Q('nature', 1, "Quel est l'animal terrestre le plus rapide ?", ["Le guépard", "Le lion", "L'antilope", "Le cheval"],
    "Il peut dépasser 100 km/h, mais seulement sur de courtes distances.", "Guépard");
  Q('nature', 1, "Que devient le têtard en grandissant ?", ["Une grenouille", "Un poisson", "Un lézard", "Une libellule"],
    "Il perd sa queue et ses pattes apparaissent peu à peu.", "Grenouille");
  Q('nature', 2, "Lequel de ces champignons est mortel ?", ["L'amanite phalloïde", "Le cèpe", "La girolle", "Le rosé des prés"],
    "En cas de doute, il faut toujours faire vérifier sa cueillette par un pharmacien.", "Amanite phalloïde");
  Q('nature', 2, "Quel arbre produit les marrons d'Inde, qui ne se mangent pas ?", ["Le marronnier", "Le châtaignier", "Le noisetier", "Le platane"],
    "Les châtaignes que l'on fait griller viennent du châtaignier.", "Aesculus hippocastanum");
  Q('nature', 3, "Combien de temps dure environ la gestation d'une vache ?", ["9 mois", "3 mois", "6 mois", "12 mois"],
    "C'est à peu près la même durée que chez la femme. Le petit s'appelle le veau.");
  Q('nature', 3, "Quel oiseau de l'Antarctique ne peut pas voler ?", ["Le manchot", "Le pingouin", "L'albatros", "Le goéland"],
    "On les confond souvent : le pingouin vit dans l'hémisphère Nord et, lui, sait voler.", "Manchot empereur");
  Q('nature', 1, "Que mange principalement le panda géant ?", ["Du bambou", "Du poisson", "Des fruits", "Du miel"],
    "Il en mange plusieurs dizaines de kilos par jour.", "Bambou");
  Q('nature', 1, "Quelle planète est surnommée « la planète rouge » ?", ["Mars", "Vénus", "Jupiter", "Saturne"],
    "Sa couleur vient de la rouille (oxyde de fer) présente dans son sol.", "Mars (planète)");
  Q('nature', 2, "Combien de planètes compte le système solaire ?", ["8", "9", "7", "10"],
    "Pluton n'est plus considérée comme une planète depuis 2006.");
  Q('nature', 1, "Quel est le plus grand oiseau du monde ?", ["L'autruche", "L'aigle royal", "Le cygne", "Le condor"],
    "Elle ne vole pas, mais court très vite, à plus de 60 km/h.", "Autruche");
  Q('nature', 3, "Combien de cœurs possède une pieuvre ?", ["3", "1", "2", "8"],
    "Elle a aussi le sang bleu !");
  Q('nature', 2, "Comment s'appelle la femelle du sanglier ?", ["La laie", "La biche", "La hase", "La chevrette"],
    "Ses petits, les marcassins, ont un pelage rayé.", "Sanglier");
  Q('nature', 1, "Lequel de ces animaux hiberne pendant l'hiver ?", ["La marmotte", "Le renard", "Le lapin", "Le cerf"],
    "Elle peut dormir près de six mois dans son terrier.", "Marmota marmota");
  Q('nature', 2, "Lequel de ces animaux est un marsupial ?", ["Le kangourou", "Le lapin", "Le castor", "Le hérisson"],
    "Les marsupiaux portent leur petit dans une poche sur le ventre.", "Kangourou roux");
  Q('nature', 2, "Pourquoi la coccinelle est-elle l'amie du jardinier ?", ["Elle mange les pucerons", "Elle mange les limaces", "Elle pollinise les tomates", "Elle chasse les taupes"],
    "Une seule coccinelle peut dévorer des dizaines de pucerons par jour.", "Coccinella septempunctata");

  Q('nature', 1, "Quel petit animal se roule en boule hérissée de piquants quand il a peur ?", ["Le hérisson", "Le porc-épic", "Le blaireau", "La taupe"],
    "Grand mangeur de limaces et d'insectes, c'est un précieux allié du jardinier.", "Erinaceus europaeus");
  Q('nature', 1, "Quelle fleur rouge pousse au bord des champs de blé ?", ["Le coquelicot", "Le bleuet", "La marguerite", "La pâquerette"],
    "Ses pétales, fins comme du papier de soie, ne durent souvent qu'un jour ou deux.", "Coquelicot");
  Q('nature', 1, "Quel grand oiseau blanc aux ailes noires, symbole de l'Alsace, niche sur les toits ?", ["La cigogne blanche", "Le héron cendré", "La grue cendrée", "Le cygne"],
    "Selon la légende, c'est elle qui apporte les bébés. La plupart passent l'hiver en Afrique.", "Cigogne blanche");
  Q('nature', 1, "Lequel de ces animaux n'a qu'une seule bosse ?", ["Le dromadaire", "Le chameau de Bactriane", "Le lama", "L'alpaga"],
    "Sa bosse ne contient pas d'eau, mais de la graisse : une réserve d'énergie pour traverser le désert.", "Dromadaire");
  Q('nature', 1, "Quel petit oiseau à la poitrine orangée suit volontiers le jardinier qui bêche ?", ["Le rouge-gorge", "La mésange charbonnière", "Le moineau", "La fauvette"],
    "Il guette les vers de terre remués par la bêche. Il continue de chanter même en hiver.", "Rouge-gorge familier");
  Q('nature', 1, "Sous quelle plante est-il de tradition de s'embrasser au Nouvel An ?", ["Le gui", "Le houx", "Le lierre", "Le buis"],
    "« Au gui l'an neuf ! » Cette plante pousse sur les branches d'autres arbres, comme le pommier.", "Gui (plante)");
  Q('nature', 2, "Quel rapace nocturne se distingue du hibou par l'absence d'aigrettes, ces plumes en forme d'oreilles ?", ["La chouette", "Le grand-duc", "Le moyen-duc", "Le petit-duc"],
    "La chouette effraie, au plumage clair, niche volontiers dans les granges et les clochers.", "Chouette hulotte");
  Q('nature', 2, "Quel est le seul mammifère capable de vraiment voler ?", ["La chauve-souris", "L'écureuil volant", "Le lérot", "La musaraigne"],
    "En France, toutes les espèces de chauves-souris sont protégées ; elles dévorent quantité d'insectes.", "Chiroptera");
  Q('nature', 2, "Quel oiseau est l'animal le plus rapide du monde, lorsqu'il plonge en piqué ?", ["Le faucon pèlerin", "L'aigle royal", "L'hirondelle rustique", "Le martinet noir"],
    "En piqué, il peut dépasser 300 km/h pour fondre sur sa proie.", "Faucon pèlerin");
  Q('nature', 2, "Quel arbre aux feuilles en éventail est souvent qualifié de « fossile vivant » ?", ["Le ginkgo", "Le platane", "Le tilleul", "Le saule pleureur"],
    "Ses feuilles deviennent d'un jaune d'or éclatant à l'automne ; ses ancêtres vivaient déjà au temps des dinosaures.", "Ginkgo biloba");
  Q('nature', 2, "Quel arbre domine dans la grande forêt des Landes de Gascogne ?", ["Le pin maritime", "Le chêne-liège", "Le hêtre", "Le sapin"],
    "Cette immense forêt a été plantée au XIXe siècle, notamment pour assainir les marais.", "Pinus pinaster");
  Q('nature', 2, "Quelle étoile permet de repérer le nord, la nuit ?", ["L'étoile Polaire", "L'étoile du Berger", "Sirius", "Bételgeuse"],
    "L'« étoile du Berger », elle, n'est pas une étoile : c'est la planète Vénus.", "Étoile polaire");
  Q('nature', 2, "Comment s'appelle la femelle du lièvre ?", ["La hase", "La lapine", "La laie", "La chevrette"],
    "Ses petits, les levrauts, naissent les yeux ouverts et couverts de poils.", "Lièvre d'Europe");
  Q('nature', 2, "Quel champignon souterrain, surnommé « le diamant noir », se cherche avec un chien ?", ["La truffe", "La morille", "Le cèpe", "La girolle"],
    "Autrefois, on la cherchait souvent avec une truie, attirée par son parfum.", "Truffe noire");
  Q('nature', 2, "Quel oiseau au plumage bleu et orange plonge dans les rivières pour pêcher ?", ["Le martin-pêcheur", "Le héron cendré", "Le cormoran", "Le geai des chênes"],
    "Il guette sa proie depuis une branche avant de plonger d'un coup dans l'eau.", "Martin-pêcheur d'Europe");
  Q('nature', 2, "Comment appelle-t-on le cri du cerf à l'automne ?", ["Le brame", "Le barrissement", "Le hennissement", "Le glapissement"],
    "En septembre et octobre, les mâles brament pour attirer les biches et impressionner leurs rivaux.", "Cerf élaphe");
  Q('nature', 3, "Qu'est-ce qu'un ver luisant ?", ["Un insecte", "Un ver de terre", "Une chenille", "Une limace"],
    "C'est un petit coléoptère : la femelle, sans ailes, brille dans l'herbe les soirs d'été pour attirer les mâles.", "Lampyre");
  Q('nature', 3, "Quel insecte, à l'âge adulte, ne vit souvent qu'un jour ou deux ?", ["L'éphémère", "La libellule", "Le hanneton", "La mouche"],
    "Sa larve vit pourtant de longs mois dans l'eau ; l'adulte, lui, ne se nourrit même pas.", "Ephemeroptera");
  Q('nature', 3, "Quel grand rapace des montagnes se nourrit surtout d'os ?", ["Le gypaète barbu", "Le vautour fauve", "L'aigle royal", "Le milan royal"],
    "Il lâche les os du haut des airs sur des rochers pour les briser. Il a été réintroduit dans les Alpes.", "Gypaète barbu");
  Q('nature', 3, "Quel petit carnivore devient blanc en hiver, sauf le bout de sa queue qui reste noir ?", ["L'hermine", "La belette", "Le putois", "La fouine"],
    "C'est l'emblème de la Bretagne, dont le drapeau porte des mouchetures d'hermine.", "Mustela erminea");
  Q('nature', 3, "Quel animal aux grandes cornes annelées est l'emblème du parc national de la Vanoise ?", ["Le bouquetin", "Le chamois", "Le mouflon", "La marmotte"],
    "Ce parc, le premier parc national français, a été créé en 1963, en partie pour le protéger.", "Bouquetin des Alpes");
  Q('nature', 3, "Quel est le plus petit oiseau d'Europe ?", ["Le roitelet", "Le troglodyte", "La mésange bleue", "Le rouge-gorge"],
    "Il pèse à peine 5 ou 6 grammes, à peu près le poids d'une pièce de monnaie.", "Roitelet huppé");
  Q('nature', 3, "Quel mammifère d'Australie, au bec de canard, pond des œufs ?", ["L'ornithorynque", "Le koala", "Le wombat", "Le kangourou"],
    "Les premiers savants européens qui en ont vu un naturalisé ont cru à une farce.", "Ornithorynque");
  Q('nature', 3, "Quel conifère détient le record de l'arbre le plus haut du monde ?", ["Le séquoia", "Le cèdre", "Le pin parasol", "Le sapin pectiné"],
    "Un séquoia de Californie, surnommé « Hyperion », mesure plus de 115 mètres.", "Sequoia sempervirens");
  Q('nature', 3, "Quel oiseau marin au bec multicolore, surnommé « perroquet de mer », niche en Bretagne ?", ["Le macareux moine", "Le fou de Bassan", "Le guillemot de Troïl", "Le cormoran huppé"],
    "La réserve des Sept-Îles, au large de Perros-Guirec, abrite sa principale colonie française.", "Macareux moine");
  Q('nature', 3, "Quel est le plus grand papillon d'Europe ?", ["Le grand paon de nuit", "Le machaon", "Le flambé", "Le paon-du-jour"],
    "Ce papillon de nuit peut atteindre 15 centimètres d'envergure ; ses ailes portent de grands ocelles.", "Grand paon de nuit");

  /* ---------- Sport ---------- */
  Q('sport', 1, "En quelle année la France a-t-elle gagné sa première Coupe du monde de football ?", ["1998", "1984", "2002", "1982"],
    "Elle a battu le Brésil 3 à 0 au Stade de France, avec deux buts de Zinédine Zidane.");
  Q('sport', 2, "Quel coureur breton a remporté cinq fois le Tour de France ?", ["Bernard Hinault", "Jacques Anquetil", "Raymond Poulidor", "Louison Bobet"],
    "On le surnommait « le Blaireau ». Jacques Anquetil, lui aussi quintuple vainqueur, était normand.", "Bernard Hinault");
  Q('sport', 2, "Quel coureur, surnommé « l'éternel second », n'a jamais porté le maillot jaune ?", ["Raymond Poulidor", "Jacques Anquetil", "Bernard Thévenet", "Laurent Fignon"],
    "Il est monté huit fois sur le podium du Tour, et le public l'adorait : on l'appelait « Poupou ».", "Raymond Poulidor");
  Q('sport', 1, "De quelle couleur est le maillot du premier du classement général du Tour de France ?", ["Jaune", "Vert", "Blanc", "À pois rouges"],
    "Il est jaune depuis 1919, comme les pages du journal L'Auto qui organisait la course.", "Maillot jaune");
  Q('sport', 1, "Où se termine traditionnellement le Tour de France ?", ["Sur les Champs-Élysées", "À Lyon", "À Marseille", "Au Mont-Saint-Michel"],
    "L'arrivée a lieu à Paris, sur les Champs-Élysées, presque chaque année depuis 1975.", "Avenue des Champs-Élysées");
  Q('sport', 1, "Quel grand tournoi de tennis se joue sur terre battue à Paris ?", ["Roland-Garros", "Wimbledon", "L'US Open", "L'Open d'Australie"],
    "Il porte le nom de l'aviateur Roland Garros, le premier à traverser la Méditerranée en avion, en 1913.", "Stade Roland-Garros");
  Q('sport', 2, "Quel joueur français a gagné le tournoi de Roland-Garros en 1983 ?", ["Yannick Noah", "Henri Leconte", "Guy Forget", "Jean-Claude Killy"],
    "Il a battu le Suédois Mats Wilander en finale, puis est tombé dans les bras de son père.", "Yannick Noah");
  Q('sport', 1, "Combien de joueurs compte une équipe de football sur le terrain ?", ["11", "9", "12", "15"],
    "Dix joueurs de champ et un gardien de but.");
  Q('sport', 1, "Quel tournoi de rugby oppose chaque année la France à cinq autres nations ?", ["Le Tournoi des Six Nations", "La Coupe Davis", "Le Tour de France", "La Ryder Cup"],
    "Avant l'arrivée de l'Italie en 2000, on l'appelait le Tournoi des Cinq Nations.");
  Q('sport', 2, "Quel skieur français a remporté trois médailles d'or aux Jeux de Grenoble, en 1968 ?", ["Jean-Claude Killy", "Guy Périllat", "Luc Alphand", "Franck Piccard"],
    "Il a gagné la descente, le slalom géant et le slalom.", "Jean-Claude Killy");
  Q('sport', 1, "Quelle ville a accueilli les Jeux olympiques d'été en 2024 ?", ["Paris", "Lyon", "Londres", "Los Angeles"],
    "Paris avait déjà accueilli les Jeux un siècle plus tôt, en 1924.");
  Q('sport', 1, "Quelle course automobile dure 24 heures dans la Sarthe ?", ["Les 24 Heures du Mans", "Le Rallye de Monte-Carlo", "Le Grand Prix de Pau", "Le Paris-Dakar"],
    "Elle existe depuis 1923. Les pilotes se relaient au volant jour et nuit.", "24 Heures du Mans");
  Q('sport', 2, "Quel boxeur français, champion du monde, a vécu une histoire d'amour avec Édith Piaf ?", ["Marcel Cerdan", "Georges Carpentier", "Jean-Claude Bouttier", "Alphonse Halimi"],
    "Il est mort en 1949 dans un accident d'avion aux Açores.", "Marcel Cerdan");
  Q('sport', 1, "Dans quel sport Alain Prost s'est-il illustré ?", ["La Formule 1", "Le cyclisme", "Le tennis", "Le ski"],
    "Il a été quatre fois champion du monde de Formule 1.", "Alain Prost");
  Q('sport', 1, "Quel est le surnom de l'équipe de France de football ?", ["Les Bleus", "Les Verts", "Les Coqs", "Les Lions"],
    "« Les Verts » est le surnom de l'AS Saint-Étienne.");
  Q('sport', 2, "Quelle équipe, surnommée « les Verts », a joué la finale de la Coupe d'Europe en 1976 ?", ["Saint-Étienne", "Nantes", "Marseille", "Reims"],
    "Elle a perdu 1 à 0 contre le Bayern Munich à Glasgow. On parle encore des « poteaux carrés ».", "Stade Geoffroy-Guichard");
  Q('sport', 1, "Combien de temps dure un match de football, sans les prolongations ?", ["90 minutes", "60 minutes", "80 minutes", "100 minutes"],
    "Deux mi-temps de 45 minutes, plus le temps additionnel décidé par l'arbitre.");
  Q('sport', 1, "Dans quel jeu utilise-t-on un cochonnet ?", ["La pétanque", "Le golf", "Le croquet", "Le bowling"],
    "La pétanque est née à La Ciotat en 1907 ; son nom vient de « pieds tanqués », c'est-à-dire joints.", "Pétanque");
  Q('sport', 2, "Quelle course à la voile en solitaire relie Saint-Malo à Pointe-à-Pitre ?", ["La Route du Rhum", "Le Vendée Globe", "La Solitaire du Figaro", "La Transat Jacques Vabre"],
    "Elle a lieu tous les quatre ans depuis 1978.", "Route du Rhum");
  Q('sport', 3, "Quelle athlète française a gagné le 200 m et le 400 m aux Jeux d'Atlanta, en 1996 ?", ["Marie-José Pérec", "Christine Arron", "Muriel Hurtis", "Jeannie Longo"],
    "Elle avait déjà gagné le 400 m aux Jeux de Barcelone en 1992.", "Marie-José Pérec");
  Q('sport', 2, "Combien de trous compte un parcours de golf classique ?", ["18", "9", "12", "24"],
    "Le but est de terminer le parcours avec le moins de coups possible.");
  Q('sport', 1, "Dans quel sport s'est illustré Jacques Anquetil ?", ["Le cyclisme", "Le football", "La boxe", "Le rugby"],
    "Il a été le premier coureur à gagner cinq fois le Tour de France.", "Jacques Anquetil");
  Q('sport', 1, "Dans quel sport Teddy Riner est-il champion ?", ["Le judo", "La lutte", "La boxe", "L'escrime"],
    "Il a remporté plusieurs titres olympiques et de nombreux titres de champion du monde.", "Teddy Riner");
  Q('sport', 3, "Quelle joueuse de tennis des années 1920 a donné son nom à un court de Roland-Garros ?", ["Suzanne Lenglen", "Amélie Mauresmo", "Mary Pierce", "Françoise Dürr"],
    "Surnommée « la Divine », elle a gagné de nombreux tournois, dont Wimbledon à six reprises.", "Suzanne Lenglen");
  Q('sport', 1, "Dans quel sport s'illustrait Jeannie Longo ?", ["Le cyclisme", "La natation", "Le tennis", "Le ski"],
    "Elle a été championne olympique sur route en 1996 et a couru à très haut niveau pendant plus de trente ans.", "Jeannie Longo");

  Q('sport', 1, "Quel sport se joue avec un ballon ovale ?", ["Le rugby", "Le handball", "Le volley-ball", "Le basket-ball"],
    "Selon la légende, il serait né en 1823 au collège anglais de Rugby, quand un élève prit le ballon à la main.");
  Q('sport', 1, "Dans quel sport utilise-t-on un fleuret, une épée ou un sabre ?", ["L'escrime", "Le tir à l'arc", "Le judo", "La lutte"],
    "Dans le monde entier, l'arbitre donne ses ordres en français : « En garde ! Prêts ? Allez ! »", "Escrime");
  Q('sport', 1, "Dans quel sport s'est illustré Éric Tabarly ?", ["La voile", "L'aviron", "La natation", "Le ski nautique"],
    "Ses bateaux s'appelaient tous « Pen Duick ». Il a gagné la course transatlantique en solitaire en 1964.", "Éric Tabarly");
  Q('sport', 1, "Quel baron français est à l'origine des Jeux olympiques modernes ?", ["Pierre de Coubertin", "Jean Bouin", "Georges Carpentier", "Jean Borotra"],
    "Les premiers Jeux olympiques modernes ont eu lieu à Athènes, en 1896.", "Pierre de Coubertin");
  Q('sport', 1, "Dans quel sport deux équipes de cinq joueurs cherchent-elles à lancer le ballon dans un panier ?", ["Le basket-ball", "Le handball", "Le volley-ball", "Le water-polo"],
    "Il a été inventé en 1891 aux États-Unis par James Naismith, un professeur d'éducation physique.");
  Q('sport', 2, "Dans quelle ville est né Zinédine Zidane ?", ["Marseille", "Lyon", "Bordeaux", "Toulouse"],
    "Il a grandi dans le quartier de la Castellane, dans les quartiers nord de la ville.", "Zinédine Zidane");
  Q('sport', 2, "Quel footballeur français a remporté trois Ballons d'or de suite, de 1983 à 1985 ?", ["Michel Platini", "Jean-Pierre Papin", "Raymond Kopa", "Zinédine Zidane"],
    "Il a aussi mené les Bleus à la victoire au championnat d'Europe de 1984, en marquant neuf buts.", "Michel Platini");
  Q('sport', 2, "Quelle course cycliste, célèbre pour ses pavés, est surnommée « l'enfer du Nord » ?", ["Paris-Roubaix", "Paris-Nice", "Milan-San Remo", "Bordeaux-Paris"],
    "Ses portions de pavés, comme la tranchée d'Arenberg, mettent hommes et vélos à rude épreuve.", "Paris-Roubaix");
  Q('sport', 2, "Quel col des Pyrénées est le plus souvent franchi par le Tour de France ?", ["Le col du Tourmalet", "Le col de l'Aubisque", "Le col d'Aspin", "Le col de Peyresourde"],
    "Il culmine à 2 115 mètres et a été franchi pour la première fois par le Tour en 1910.", "Col du Tourmalet");
  Q('sport', 2, "Quel sommet, surnommé « le Géant de Provence », est une ascension mythique du Tour de France ?", ["Le mont Ventoux", "Le mont Aigoual", "La montagne Sainte-Victoire", "Le mont Lozère"],
    "Son sommet pelé, couvert de cailloux blancs, ressemble de loin à un sommet enneigé.", "Mont Ventoux");
  Q('sport', 2, "Quelle ville de Savoie a accueilli les Jeux olympiques d'hiver de 1992 ?", ["Albertville", "Chambéry", "Chamonix", "Annecy"],
    "Les épreuves étaient réparties dans plusieurs stations ; Philippe Decouflé avait mis en scène la cérémonie d'ouverture.", "Albertville");
  Q('sport', 2, "Quel champion de tennis a donné son nom à une marque au crocodile ?", ["René Lacoste", "Jean Borotra", "Henri Cochet", "Yannick Noah"],
    "On le surnommait « le Crocodile » pour sa ténacité ; il a lancé sa marque de chemises de sport en 1933.", "René Lacoste");
  Q('sport', 2, "Quel club français a remporté la Ligue des champions de football en 1993 ?", ["L'Olympique de Marseille", "Le Paris Saint-Germain", "Les Girondins de Bordeaux", "L'AS Monaco"],
    "En finale, à Munich, Basile Boli a marqué de la tête l'unique but du match contre le Milan AC.");
  Q('sport', 2, "Dans quelle épreuve Guy Drut a-t-il été champion olympique à Montréal, en 1976 ?", ["Le 110 mètres haies", "Le saut en longueur", "Le 400 mètres", "Le décathlon"],
    "Il a devancé le Cubain Alejandro Casañas en finale.", "Guy Drut");
  Q('sport', 2, "Quel Français a lancé la première Coupe du monde de football, en 1930 ?", ["Jules Rimet", "Jean Bouin", "Gabriel Hanot", "Pierre de Coubertin"],
    "Le premier trophée de la Coupe du monde portait son nom.", "Jules Rimet");
  Q('sport', 2, "Quelle grande course de galop se dispute chaque automne à l'hippodrome de Longchamp ?", ["Le prix de l'Arc de Triomphe", "Le prix d'Amérique", "Le prix de Diane", "Le Grand Steeple-Chase de Paris"],
    "Le prix d'Amérique, lui, est la grande course de trot, disputée à Vincennes en janvier.", "Hippodrome de Longchamp");
  Q('sport', 2, "Quel cheval a remporté l'or olympique en saut d'obstacles avec Pierre Durand, en 1988 ?", ["Jappeloup", "Ourasi", "Milton", "Baloubet du Rouet"],
    "Ce petit cheval noir, réputé difficile, a triomphé aux Jeux de Séoul.", "Jappeloup");
  Q('sport', 3, "Quelle station a accueilli les premiers Jeux olympiques d'hiver, en 1924 ?", ["Chamonix", "Grenoble", "Saint-Moritz", "Oslo"],
    "On parlait alors de « Semaine internationale des sports d'hiver » ; elle a ensuite été reconnue comme les premiers Jeux d'hiver.", "Chamonix-Mont-Blanc");
  Q('sport', 3, "Quel coureur a été le premier à gagner trois Tours de France consécutifs, de 1953 à 1955 ?", ["Louison Bobet", "Jean Robic", "André Darrigade", "Roger Rivière"],
    "Ce Breton de Saint-Méen-le-Grand était fils de boulanger.", "Louison Bobet");
  Q('sport', 3, "Quel coureur français a perdu le Tour de France 1989 pour seulement 8 secondes ?", ["Laurent Fignon", "Bernard Hinault", "Charly Mottet", "Jean-François Bernard"],
    "C'est le plus petit écart de l'histoire du Tour. Il l'avait remporté en 1983 et en 1984.", "Laurent Fignon");
  Q('sport', 3, "Quel nageur a offert à la France son premier titre olympique en natation, en 1952 ?", ["Jean Boiteux", "Alain Gottvallès", "Jean Taris", "Michel Rousseau"],
    "Fou de joie, son père a sauté tout habillé dans le bassin pour l'embrasser.", "Jean Boiteux");
  Q('sport', 3, "Comment surnommait-on les tennismen Lacoste, Borotra, Cochet et Brugnon ?", ["Les Mousquetaires", "Les Quatre Fantastiques", "Les Grognards", "Les Invincibles"],
    "Ils ont remporté six Coupes Davis de suite, de 1927 à 1932.");
  Q('sport', 3, "Qui a créé le rallye Paris-Dakar, parti pour la première fois à la fin de 1978 ?", ["Thierry Sabine", "Hubert Auriol", "Jean-Louis Schlesser", "Cyril Neveu"],
    "La toute première édition a pris le départ de Paris le 26 décembre 1978.", "Thierry Sabine");
  Q('sport', 3, "Quel arrière du XV de France, né à Caracas, était surnommé « le Pelé du rugby » ?", ["Serge Blanco", "Philippe Sella", "Jean-Pierre Rives", "Pierre Villepreux"],
    "On se souvient de son essai décisif contre l'Australie, en demi-finale de la Coupe du monde 1987.", "Serge Blanco");
  Q('sport', 3, "Quel directeur du journal « L'Auto » a lancé le Tour de France en 1903 ?", ["Henri Desgrange", "Jacques Goddet", "Jean Bobet", "Félix Lévitan"],
    "Un monument à sa mémoire se dresse au col du Galibier, que le Tour franchit souvent.", "Henri Desgrange");
  Q('sport', 3, "Combien de virages numérotés compte la célèbre montée de l'Alpe d'Huez ?", ["21", "12", "33", "50"],
    "Chaque virage porte le nom d'un ancien vainqueur d'étape.");
  Q('sport', 3, "Quel trotteur a remporté quatre fois le prix d'Amérique, entre 1986 et 1990 ?", ["Ourasi", "Idéal du Gazeau", "Bellino II", "Roquépine"],
    "Surnommé « le roi fainéant », il a passionné bien au-delà des amateurs de courses.", "Ourasi");

  JS.Donnees.quiz = brut.map((q, i) => {
    const decalage = i % 4;
    const choix = q.choix.map((_, k) => q.choix[(k - decalage + 4) % 4]);
    const item = {
      categorie: q.categorie,
      question: q.question,
      choix,
      bonne: decalage,
      difficulte: q.difficulte,
      anecdote: q.anecdote
    };
    if (q.illustration) item.illustration = q.illustration;
    return item;
  });
})();
