/* Données datées (objets, lieux, événements, films, chansons) et outils de personnalisation selon l'âge.
   Seules des dates bien établies figurent ici ; quand une date varie d'un an selon les sources
   (présentation / commercialisation, sortie à l'étranger / en France), les jeux évitent de
   comparer à moins de deux ans d'écart. */
window.JS = window.JS || {};

(function () {
  'use strict';
  JS.Donnees = JS.Donnees || {};

  // type : 'objet' (existait déjà), 'evenement' (avait déjà eu lieu), 'film', 'chanson' (était déjà sorti·e)
  const E = (type, annee, icone, sujet, detail) => ({ type, annee, icone, sujet, detail });

  JS.Donnees.epoque = [
    /* ---------- Objets et inventions du quotidien ---------- */
    E('objet', 1948, '🚗', 'la 2 CV Citroën', 'La « deux-pattes » a été présentée au Salon de l\'automobile de Paris en 1948.'),
    E('objet', 1949, '🛵', 'la Mobylette', 'Motobécane lance la Mobylette en 1949 ; son nom est devenu un nom commun.'),
    E('objet', 1950, '🖊️', 'le stylo Bic Cristal', 'Marcel Bich lance le célèbre stylo à bille transparent en 1950.'),
    E('objet', 1955, '🚘', 'la Citroën DS', 'La DS fait sensation au Salon de l\'automobile de 1955.'),
    E('objet', 1958, '🧱', 'la brique Lego actuelle', 'La brique à tenons et tubes, toujours compatible aujourd\'hui, date de 1958.'),
    E('objet', 1959, '👱‍♀️', 'la poupée Barbie', 'La poupée Barbie a été présentée à New York en 1959.'),
    E('objet', 1961, '🚙', 'la Renault 4L', 'La 4L est lancée en 1961 ; plus de huit millions d\'exemplaires seront fabriqués.'),
    E('objet', 1963, '📼', 'la cassette audio', 'Philips présente la cassette audio compacte en 1963.'),
    E('objet', 1967, '💳', 'la Carte Bleue', 'Plusieurs banques françaises créent la Carte Bleue en 1967.'),
    E('objet', 1967, '🌈', 'la télévision en couleurs en France', 'Les premières émissions en couleurs sont diffusées sur la deuxième chaîne le 1er octobre 1967.'),
    E('objet', 1972, '🚗', 'la Renault 5', 'La Renault 5 sort en 1972 ; la « Supercinq » ne viendra qu\'en 1984.'),
    E('objet', 1976, '📹', 'le magnétoscope VHS', 'Le format VHS est lancé au Japon en 1976 avant de conquérir les foyers.'),
    E('objet', 1979, '🎧', 'le baladeur Walkman', 'Sony lance le Walkman en 1979 : on peut écouter sa musique en marchant.'),
    E('objet', 1980, '🗒️', 'le Post-it', 'Les petites feuilles jaunes repositionnables sont commercialisées à partir de 1980.'),
    E('objet', 1981, '🚄', 'le TGV', 'Le premier TGV relie Paris à Lyon en septembre 1981.'),
    E('objet', 1982, '💿', 'le disque compact (CD)', 'Le disque compact est commercialisé à partir de 1982.'),
    E('objet', 1982, '📟', 'le Minitel', 'Après des essais en 1980, le Minitel se répand dans les foyers français à partir de 1982.'),
    E('objet', 1984, '🖥️', 'l\'ordinateur Macintosh', 'Apple présente le premier Macintosh en janvier 1984.'),
    E('objet', 1989, '🎮', 'la console Game Boy', 'Nintendo lance la Game Boy en 1989 ; le jeu Tetris l\'accompagne.'),
    E('objet', 1992, '📱', 'le téléphone portable en France', 'Le premier réseau français de téléphonie mobile numérique (GSM) ouvre en 1992.'),
    E('objet', 1993, '🚗', 'la Renault Twingo', 'La petite Twingo aux phares ronds est commercialisée en 1993.'),
    E('objet', 1995, '🪟', 'Windows 95', 'Microsoft lance Windows 95 et son fameux bouton « Démarrer ».'),
    E('objet', 1996, '🐣', 'le Tamagotchi', 'Ce petit animal virtuel à nourrir est né au Japon en 1996.'),
    E('objet', 1996, '☎️', 'les numéros de téléphone à dix chiffres', 'Le 18 octobre 1996, les numéros français passent de huit à dix chiffres.'),
    E('objet', 1998, '🔎', 'le moteur de recherche Google', 'Google est fondé en Californie en 1998.'),
    E('objet', 1998, '💚', 'la carte Vitale', 'La carte Vitale commence à être distribuée en 1998.'),
    E('objet', 2001, '📖', 'l\'encyclopédie Wikipédia', 'L\'encyclopédie en ligne Wikipédia est lancée en 2001.'),
    E('objet', 2002, '💶', 'les pièces et billets en euros', 'Le 1er janvier 2002, l\'euro remplace le franc dans les porte-monnaie.'),
    E('objet', 2004, '👍', 'Facebook', 'Le réseau social Facebook est créé en 2004 par des étudiants américains.'),
    E('objet', 2005, '▶️', 'le site de vidéos YouTube', 'YouTube est créé en 2005.'),
    E('objet', 2007, '📲', 'l\'iPhone', 'Apple présente l\'iPhone en janvier 2007.'),
    E('objet', 2007, '🚲', 'le Vélib\' à Paris', 'Les vélos en libre-service Vélib\' arrivent à Paris en juillet 2007.'),

    /* ---------- Vie quotidienne et société ---------- */
    E('objet', 1945, '🏥', 'la Sécurité sociale', 'La Sécurité sociale est créée par les ordonnances d\'octobre 1945.'),
    E('objet', 1950, '🏖️', 'le Club Méditerranée', 'Le Club Med ouvre son premier village de vacances, aux Baléares, en 1950.'),
    E('objet', 1954, '🐎', 'le Tiercé', 'Le PMU lance le Tiercé en 1954 ; il devient un rendez-vous du dimanche.'),
    E('objet', 1956, '🌞', 'la troisième semaine de congés payés', 'La loi de 1956 accorde une troisième semaine de congés payés.'),
    E('objet', 1958, '🏛️', 'la Ve République', 'La Constitution de la Ve République est adoptée en 1958.'),
    E('objet', 1960, '🪙', 'le nouveau franc', 'Le 1er janvier 1960, cent anciens francs deviennent un nouveau franc.'),
    E('objet', 1963, '🛒', 'le premier hypermarché en France', 'Le premier hypermarché français ouvre à Sainte-Geneviève-des-Bois en 1963.'),
    E('objet', 1964, '📺', 'la deuxième chaîne de télévision', 'La deuxième chaîne de l\'ORTF commence à émettre en 1964.'),
    E('objet', 1969, '🌴', 'la quatrième semaine de congés payés', 'La quatrième semaine de congés payés est généralisée en 1969.'),
    E('objet', 1970, '💰', 'le Smic', 'Le Smic remplace le Smig en 1970.'),
    E('objet', 1972, '✉️', 'le code postal à cinq chiffres', 'Le code postal à cinq chiffres est mis en place en 1972.'),
    E('objet', 1973, '🔒', 'la ceinture de sécurité obligatoire', 'Le port de la ceinture à l\'avant devient obligatoire hors agglomération en 1973.'),
    E('objet', 1974, '🗳️', 'la majorité à 18 ans', 'En 1974, l\'âge de la majorité passe de 21 à 18 ans.'),
    E('objet', 1975, '1️⃣', 'la chaîne TF1, sous ce nom', 'La première chaîne prend le nom de TF1 en 1975, à l\'éclatement de l\'ORTF.'),
    E('objet', 1976, '🎱', 'le Loto national', 'Le premier tirage du Loto a lieu en 1976.'),
    E('objet', 1982, '🏝️', 'la cinquième semaine de congés payés', 'La cinquième semaine de congés payés est accordée en 1982.'),
    E('objet', 1984, '📡', 'la chaîne Canal+', 'Canal+, première chaîne payante française, est lancée en novembre 1984.'),
    E('objet', 1987, '📺', 'la chaîne M6', 'M6 commence à émettre en 1987.'),
    E('objet', 1992, '🪪', 'le permis à points', 'Le permis à points entre en vigueur en 1992.'),
    E('objet', 1992, '🎭', 'la chaîne Arte', 'La chaîne culturelle franco-allemande Arte est lancée en 1992.'),

    /* ---------- Lieux et grands ouvrages ---------- */
    E('objet', 1962, '🚢', 'le paquebot France en service', 'Le paquebot France effectue sa première traversée vers New York en 1962.'),
    E('objet', 1973, '🏢', 'la tour Montparnasse', 'La tour Montparnasse est achevée en 1973.'),
    E('objet', 1973, '🛣️', 'le boulevard périphérique de Paris complet', 'La boucle du périphérique parisien est achevée en 1973.'),
    E('objet', 1977, '🎨', 'le Centre Pompidou', 'Le Centre Pompidou, avec ses tuyaux colorés, ouvre en 1977.'),
    E('objet', 1989, '🔺', 'la pyramide du Louvre', 'La pyramide de verre de l\'architecte Ieoh Ming Pei est inaugurée en 1989.'),
    E('objet', 1992, '🏰', 'Euro Disney (Disneyland Paris)', 'Le parc ouvre à Marne-la-Vallée en avril 1992 sous le nom d\'Euro Disney.'),
    E('objet', 1994, '🚇', 'le tunnel sous la Manche', 'Le tunnel sous la Manche est inauguré en 1994.'),
    E('objet', 1995, '🌉', 'le pont de Normandie', 'Le pont de Normandie, entre Le Havre et Honfleur, ouvre en 1995.'),
    E('objet', 1998, '🏟️', 'le Stade de France', 'Le Stade de France est inauguré en 1998, juste avant la Coupe du monde.'),
    E('objet', 2004, '🌁', 'le viaduc de Millau', 'Le viaduc de Millau, le plus haut pont de France, ouvre en décembre 2004.'),

    /* ---------- Événements ---------- */
    E('evenement', 1944, '🇫🇷', 'la libération de Paris', 'Paris est libéré le 25 août 1944.'),
    E('evenement', 1953, '👑', 'le couronnement de la reine Élisabeth II', 'Élisabeth II est couronnée à Londres le 2 juin 1953.'),
    E('evenement', 1956, '💍', 'le mariage de Grace Kelly et du prince Rainier', 'L\'actrice américaine épouse le prince de Monaco en avril 1956.'),
    E('evenement', 1957, '🛰️', 'le lancement du satellite Spoutnik', 'Spoutnik, le premier satellite artificiel, est lancé par l\'URSS en octobre 1957.'),
    E('evenement', 1961, '👨‍🚀', 'le premier vol d\'un homme dans l\'espace', 'Youri Gagarine fait le tour de la Terre le 12 avril 1961.'),
    E('evenement', 1968, '⛷️', 'les Jeux olympiques d\'hiver de Grenoble', 'Jean-Claude Killy y remporte trois médailles d\'or en 1968.'),
    E('evenement', 1968, '✊', 'les événements de Mai 68', 'Étudiants puis ouvriers se mobilisent en mai 1968.'),
    E('evenement', 1969, '🌕', 'le premier pas sur la Lune', 'Neil Armstrong pose le pied sur la Lune en juillet 1969.'),
    E('evenement', 1969, '✈️', 'le premier vol du Concorde', 'Le Concorde effectue son premier vol à Toulouse le 2 mars 1969.'),
    E('evenement', 1974, '🗳️', 'l\'élection de Valéry Giscard d\'Estaing', 'Valéry Giscard d\'Estaing est élu président de la République en mai 1974.'),
    E('evenement', 1976, '🛫', 'les premiers vols commerciaux du Concorde', 'Le Concorde transporte ses premiers passagers en janvier 1976.'),
    E('evenement', 1978, '🚴', 'la première victoire de Bernard Hinault au Tour de France', 'Bernard Hinault remporte son premier Tour de France en 1978 ; il en gagnera cinq.'),
    E('evenement', 1981, '🗳️', 'l\'élection de François Mitterrand', 'François Mitterrand est élu président de la République en mai 1981.'),
    E('evenement', 1981, '⚖️', 'l\'abolition de la peine de mort en France', 'La loi portée par Robert Badinter est adoptée en 1981.'),
    E('evenement', 1989, '🧱', 'la chute du mur de Berlin', 'Le mur de Berlin tombe le 9 novembre 1989.'),
    E('evenement', 1992, '🏔️', 'les Jeux olympiques d\'hiver d\'Albertville', 'La Savoie accueille les Jeux olympiques d\'hiver en 1992.'),
    E('evenement', 1995, '🗳️', 'l\'élection de Jacques Chirac', 'Jacques Chirac est élu président de la République en mai 1995.'),
    E('evenement', 1998, '⚽', 'la victoire de la France à la Coupe du monde de football', 'Le 12 juillet 1998, la France bat le Brésil 3 à 0 au Stade de France.'),
    E('evenement', 2000, '🎆', 'le passage à l\'an 2000', 'Le monde entier fête le passage à l\'an 2000.'),

    /* ---------- Films ---------- */
    E('film', 1956, '🎬', 'le film « Et Dieu… créa la femme »', 'Ce film de Roger Vadim, sorti en 1956, fait de Brigitte Bardot une star.'),
    E('film', 1963, '🎬', 'le film « Les Tontons flingueurs »', 'Le film de Georges Lautner, sorti en 1963, est célèbre pour ses dialogues signés Michel Audiard.'),
    E('film', 1965, '🎬', 'le film « Le Corniaud »', 'Bourvil et Louis de Funès partagent l\'affiche de ce film de Gérard Oury en 1965.'),
    E('film', 1966, '🎬', 'le film « La Grande Vadrouille »', 'Sorti en 1966, ce film de Gérard Oury avec Bourvil et Louis de Funès a attiré plus de 17 millions de spectateurs.'),
    E('film', 1977, '🎬', 'le film « La Guerre des étoiles »', 'Le premier film de la saga de George Lucas sort en 1977.'),
    E('film', 1978, '🎬', 'le film « Les Bronzés »', 'La troupe du Splendid part en vacances au Club : le film sort en 1978.'),
    E('film', 1988, '🎬', 'le film « Le Grand Bleu »', 'Le film de Luc Besson sur la plongée en apnée sort en 1988.'),
    E('film', 1993, '🎬', 'le film « Les Visiteurs »', 'Jean Reno et Christian Clavier voyagent du Moyen Âge à nos jours en 1993.'),
    E('film', 2008, '🎬', 'le film « Bienvenue chez les Ch\'tis »', 'Le film de Dany Boon, sorti en 2008, attire plus de 20 millions de spectateurs.'),

    /* ---------- Chansons et émissions ---------- */
    E('chanson', 1959, '🎵', 'la chanson « Ne me quitte pas » de Jacques Brel', 'Jacques Brel enregistre « Ne me quitte pas » en 1959.'),
    E('objet', 1959, '📻', 'l\'émission de radio « Salut les copains »', 'L\'émission d\'Europe n° 1, lancée en 1959, accompagne la vague des yé-yé.'),
    E('objet', 1962, '🌙', 'l\'émission « Bonne nuit les petits »', 'Nounours, Nicolas et Pimprenelle apparaissent à la télévision en 1962.'),
    E('objet', 1962, '🐂', 'l\'émission « Intervilles »', 'Le jeu où les villes s\'affrontent avec des vachettes commence en 1962.'),
    E('chanson', 1964, '🎵', 'la chanson « Les Copains d\'abord » de Georges Brassens', 'Georges Brassens l\'écrit pour le film « Les Copains », sorti en 1964.'),
    E('chanson', 1967, '🎵', 'la chanson « Comme d\'habitude » de Claude François', 'Créée en 1967, elle deviendra « My Way » en anglais.'),
    E('chanson', 1969, '🎵', 'la chanson « Les Champs-Élysées » de Joe Dassin', 'Joe Dassin la chante en 1969.'),
    E('objet', 1959, '📚', 'le personnage d\'Astérix', 'Astérix apparaît pour la première fois en 1959, dans le journal Pilote.'),

    /* ---------- Automobiles et deux-roues ---------- */
    E('objet', 1946, '🛵', 'la Vespa', 'Le scooter italien Vespa est lancé par Piaggio en 1946.'),
    E('objet', 1946, '🚲', 'le VéloSoleX', 'Le VéloSoleX, bicyclette à moteur, est commercialisé à partir de 1946.'),
    E('objet', 1956, '🚗', 'la Renault Dauphine', 'La Renault Dauphine est présentée en 1956.'),
    E('objet', 1957, '🚗', 'la Fiat 500', 'La « Nuova 500 » de Fiat sort en 1957.'),
    E('objet', 1959, '🚗', 'la Mini', 'La petite Mini britannique est lancée en 1959.'),
    E('objet', 1960, '🚘', 'la Peugeot 404', 'La Peugeot 404 est lancée en 1960.'),
    E('objet', 1961, '🚗', 'la Simca 1000', 'La Simca 1000 est présentée en 1961.'),
    E('objet', 1968, '🏖️', 'la Citroën Méhari', 'La Méhari, voiture de plage à carrosserie en plastique, sort en 1968.'),
    E('objet', 1974, '🚗', 'la Volkswagen Golf', 'La première Golf est lancée en 1974.'),
    E('objet', 1983, '🚗', 'la Peugeot 205', 'La Peugeot 205 est lancée en 1983.'),
    E('objet', 1984, '🚐', 'la Renault Espace', 'La Renault Espace, premier monospace européen, sort en 1984.'),
    E('objet', 1990, '🚗', 'la Renault Clio', 'La première Renault Clio sort en 1990.'),

    /* ---------- Appareils, jeux et Internet ---------- */
    E('objet', 1948, '📸', 'l\'appareil photo instantané Polaroid', 'Le premier appareil Polaroid est vendu aux États-Unis en 1948.'),
    E('objet', 1953, '🍲', 'la Super Cocotte SEB', 'SEB lance sa célèbre cocotte-minute en 1953.'),
    E('objet', 1954, '📻', 'le poste de radio à transistors', 'Le premier poste de radio à transistors est commercialisé en 1954.'),
    E('objet', 1963, '📷', 'l\'appareil photo Kodak Instamatic', 'L\'Instamatic, avec sa cartouche de film facile à charger, sort en 1963.'),
    E('objet', 1970, '🔴', 'le jeu Mastermind', 'Le jeu Mastermind est inventé en 1970 par Mordecai Meirowitz.'),
    E('objet', 1972, '🏓', 'le jeu vidéo Pong', 'Pong, l\'un des premiers jeux vidéo, apparaît en 1972.'),
    E('objet', 1980, '🟡', 'le jeu vidéo Pac-Man', 'Pac-Man arrive dans les salles de jeux en 1980.'),
    E('objet', 1984, '🧩', 'le jeu Tetris', 'Tetris est créé en 1984 par le Russe Alexeï Pajitnov.'),
    E('objet', 1985, '🍄', 'le jeu vidéo Super Mario Bros.', 'Super Mario Bros. sort au Japon en 1985.'),
    E('objet', 1991, '🌐', 'le World Wide Web', 'Tim Berners-Lee rend le Web accessible au public en 1991.'),
    E('objet', 1994, '🎮', 'la console PlayStation', 'Sony lance la PlayStation au Japon en décembre 1994.'),
    E('objet', 1994, '📦', 'le site Amazon', 'Amazon est fondé en 1994 ; il vend d\'abord des livres.'),
    E('objet', 1995, '🛍️', 'le site eBay', 'Le site d\'enchères eBay est créé en 1995.'),
    E('objet', 2001, '🎶', 'le baladeur iPod', 'Apple présente l\'iPod en octobre 2001.'),
    E('objet', 2002, '📦', 'la Freebox', 'Free lance la Freebox en 2002.'),
    E('objet', 2003, '📞', 'le logiciel Skype', 'Skype, pour téléphoner par Internet, est lancé en 2003.'),
    E('objet', 2004, '📧', 'la messagerie Gmail', 'Google lance sa messagerie Gmail en 2004.'),
    E('objet', 2006, '🐦', 'le réseau social Twitter', 'Twitter est créé en 2006.'),
    E('objet', 2009, '💬', 'l\'application WhatsApp', 'WhatsApp est créé en 2009.'),
    E('objet', 2010, '📷', 'l\'application Instagram', 'Instagram est lancé en octobre 2010.'),
    E('objet', 2010, '📱', 'la tablette iPad', 'Apple présente l\'iPad en 2010.'),

    /* ---------- Lois et vie sociale ---------- */
    E('objet', 1944, '🗳️', 'le droit de vote des femmes en France', 'Les Françaises obtiennent le droit de vote en 1944 et votent pour la première fois en 1945.'),
    E('objet', 1950, '💶', 'le Smig (salaire minimum)', 'Le salaire minimum interprofessionnel garanti, le Smig, est créé en 1950.'),
    E('objet', 1954, '🧾', 'la TVA', 'La taxe sur la valeur ajoutée est inventée en France par Maurice Lauré en 1954.'),
    E('objet', 1956, '🚘', 'la vignette automobile', 'La vignette automobile est créée en 1956.'),
    E('objet', 1975, '💍', 'le divorce par consentement mutuel', 'La loi de 1975 permet le divorce par consentement mutuel.'),
    E('objet', 1976, '🕐', 'l\'heure d\'été en France', 'L\'heure d\'été est rétablie en France en 1976.'),
    E('objet', 1982, '👴', 'la retraite à 60 ans', 'L\'ordonnance de 1982 abaisse l\'âge de la retraite à 60 ans.'),
    E('objet', 1988, '🤝', 'le RMI', 'Le revenu minimum d\'insertion est créé en 1988.'),
    E('objet', 1991, '🧾', 'la CSG', 'La contribution sociale généralisée est créée en 1991.'),
    E('objet', 1992, '🔧', 'le contrôle technique automobile obligatoire', 'Le contrôle technique des voitures devient obligatoire en 1992.'),
    E('objet', 1999, '🤝', 'le Pacs', 'Le pacte civil de solidarité est créé en 1999.'),
    E('objet', 2000, '⏰', 'la semaine de 35 heures', 'La loi Aubry instaure les 35 heures à partir de 2000 dans les grandes entreprises.'),
    E('objet', 2008, '🚭', 'l\'interdiction de fumer dans les cafés et restaurants', 'Depuis le 1er janvier 2008, on ne fume plus dans les cafés et les restaurants.'),
    E('objet', 2009, '🤝', 'le RSA', 'Le revenu de solidarité active remplace le RMI en 2009.'),

    /* ---------- Transports et lieux ---------- */
    E('objet', 1959, '🌉', 'le pont de Tancarville', 'Le pont de Tancarville, sur la Seine, est inauguré en 1959.'),
    E('objet', 1963, '📻', 'la Maison de la Radio', 'La Maison de la Radio, à Paris, est inaugurée en 1963.'),
    E('objet', 1965, '⛰️', 'le tunnel du Mont-Blanc', 'Le tunnel du Mont-Blanc relie la France et l\'Italie depuis 1965.'),
    E('objet', 1966, '🌊', 'l\'usine marémotrice de la Rance', 'L\'usine marémotrice de la Rance, en Bretagne, est inaugurée en 1966.'),
    E('objet', 1972, '⚽', 'le Parc des Princes actuel', 'Le stade actuel du Parc des Princes est inauguré en 1972.'),
    E('objet', 1974, '✈️', 'l\'aéroport Charles-de-Gaulle', 'L\'aéroport de Roissy-Charles-de-Gaulle ouvre en 1974.'),
    E('objet', 1977, '🚇', 'le métro de Marseille', 'La première ligne du métro de Marseille ouvre en 1977.'),
    E('objet', 1978, '🚇', 'le métro de Lyon', 'Le métro de Lyon ouvre en 1978.'),
    E('objet', 1983, '🚇', 'le métro automatique VAL de Lille', 'Le VAL de Lille, premier métro automatique, ouvre en 1983.'),
    E('objet', 1985, '🚋', 'le retour du tramway à Nantes', 'Nantes est la première ville française à rouvrir un tramway, en 1985.'),
    E('objet', 1986, '🖼️', 'le musée d\'Orsay', 'Le musée d\'Orsay ouvre dans l\'ancienne gare d\'Orsay en 1986.'),
    E('objet', 1986, '🔬', 'la Cité des sciences de la Villette', 'La Cité des sciences et de l\'industrie ouvre en 1986.'),
    E('objet', 1987, '🎢', 'le Futuroscope', 'Le parc du Futuroscope, près de Poitiers, ouvre en 1987.'),
    E('objet', 1988, '🌉', 'le pont de l\'île de Ré', 'Le pont de l\'île de Ré est ouvert en 1988.'),
    E('objet', 1989, '🚄', 'le TGV Atlantique', 'Le TGV Atlantique est mis en service en 1989.'),
    E('objet', 1989, '🎭', 'l\'Opéra Bastille', 'L\'Opéra Bastille est inauguré en 1989.'),
    E('objet', 1989, '🏛️', 'la Grande Arche de la Défense', 'La Grande Arche est inaugurée en 1989, pour le bicentenaire de la Révolution.'),
    E('objet', 1989, '🛡️', 'le Parc Astérix', 'Le Parc Astérix ouvre en 1989.'),
    E('objet', 1994, '🚅', 'l\'Eurostar', 'L\'Eurostar relie Paris à Londres à partir de novembre 1994.'),
    E('objet', 1996, '📚', 'la Bibliothèque nationale François-Mitterrand', 'La grande bibliothèque ouvre au public en décembre 1996.'),
    E('objet', 2001, '🚄', 'le TGV Méditerranée', 'La ligne TGV Méditerranée met Marseille à trois heures de Paris en 2001.'),

    /* ---------- Télévision, bandes dessinées, livres ---------- */
    E('objet', 1943, '🌹', 'le livre « Le Petit Prince »', 'Le Petit Prince d\'Antoine de Saint-Exupéry est publié en 1943.'),
    E('objet', 1957, '📮', 'le personnage de Gaston Lagaffe', 'Gaston Lagaffe apparaît dans le journal Spirou en 1957.'),
    E('objet', 1958, '🔵', 'les Schtroumpfs', 'Les Schtroumpfs apparaissent en 1958 dans une aventure de Johan et Pirlouit.'),
    E('objet', 1960, '🦵', 'l\'émission « La Tête et les Jambes »', 'Ce jeu télévisé, où un candidat répond et un autre fait un exploit sportif, commence en 1960.'),
    E('objet', 1963, '🏹', 'la série « Thierry la Fronde »', 'Les aventures de Thierry la Fronde sont diffusées à partir de 1963.'),
    E('objet', 1968, '🐦', 'les Shadoks', 'Les Shadoks, qui pompaient, pompaient, arrivent à la télévision en 1968.'),
    E('objet', 1972, '🔢', 'l\'émission « Des chiffres et des lettres »', 'Le jeu prend ce nom en 1972 ; il s\'appelait auparavant « Le mot le plus long ».'),
    E('objet', 1974, '🏝️', 'l\'émission « L\'Île aux enfants »', 'Casimir et ses amis arrivent à la télévision en 1974.'),
    E('objet', 1975, '📚', 'l\'émission « Apostrophes »', 'Bernard Pivot présente « Apostrophes » à partir de 1975.'),
    E('objet', 1978, '🤖', 'le dessin animé « Goldorak » en France', 'Goldorak arrive à la télévision française en 1978.'),
    E('objet', 1981, '🤠', 'la série « Dallas » en France', 'Les Français découvrent « Dallas » et J.R. en 1981.'),
    E('objet', 1987, '💰', 'l\'émission « Le Juste Prix »', 'Le jeu « Le Juste Prix » commence en 1987.'),
    E('objet', 1988, '🏆', 'l\'émission « Questions pour un champion »', 'Julien Lepers présente « Questions pour un champion » à partir de 1988.'),
    E('objet', 1990, '🏰', 'l\'émission « Fort Boyard »', '« Fort Boyard » est diffusé pour la première fois en 1990.'),
    E('objet', 2004, '📺', 'la série « Plus belle la vie »', 'Le feuilleton marseillais commence en 2004.'),

    /* ---------- Autres événements ---------- */
    E('evenement', 1944, '🪖', 'le débarquement en Normandie', 'Les Alliés débarquent en Normandie le 6 juin 1944.'),
    E('evenement', 1946, '🎬', 'le premier Festival de Cannes', 'Le premier Festival de Cannes a lieu en 1946.'),
    E('evenement', 1953, '🏔️', 'la première ascension de l\'Everest', 'Edmund Hillary et Tenzing Norgay atteignent le sommet de l\'Everest en 1953.'),
    E('evenement', 1957, '🇪🇺', 'la signature du traité de Rome', 'Le traité de Rome crée la Communauté économique européenne en 1957.'),
    E('evenement', 1957, '🚴', 'la première victoire de Jacques Anquetil au Tour de France', 'Jacques Anquetil gagne son premier Tour de France en 1957.'),
    E('evenement', 1967, '❤️', 'la première greffe du cœur', 'Le docteur Christiaan Barnard réalise la première greffe du cœur en 1967.'),
    E('evenement', 1969, '🗳️', 'l\'élection de Georges Pompidou', 'Georges Pompidou est élu président de la République en juin 1969.'),
    E('evenement', 1969, '🚴', 'la première victoire d\'Eddy Merckx au Tour de France', 'Eddy Merckx gagne son premier Tour de France en 1969.'),
    E('evenement', 1977, '🎤', 'la victoire de Marie Myriam à l\'Eurovision', 'Marie Myriam gagne l\'Eurovision pour la France en 1977 avec « L\'Oiseau et l\'Enfant ».'),
    E('evenement', 1979, '🚀', 'le premier lancement de la fusée Ariane', 'La fusée européenne Ariane décolle pour la première fois de Kourou le 24 décembre 1979.'),
    E('evenement', 1981, '💒', 'le mariage du prince Charles et de Lady Diana', 'Charles et Diana se marient à Londres en juillet 1981.'),
    E('evenement', 1982, '🎶', 'la première Fête de la musique', 'La première Fête de la musique a lieu le 21 juin 1982.'),
    E('evenement', 1982, '👨‍🚀', 'le vol du premier Français dans l\'espace', 'Jean-Loup Chrétien devient le premier Français dans l\'espace en 1982.'),
    E('evenement', 1983, '🎾', 'la victoire de Yannick Noah à Roland-Garros', 'Yannick Noah remporte Roland-Garros en 1983.'),
    E('evenement', 1984, '⚽', 'la victoire de la France à l\'Euro de football', 'Menée par Michel Platini, la France gagne l\'Euro en 1984.'),
    E('evenement', 1985, '❤️', 'la création des Restos du cœur', 'Coluche lance les Restos du cœur en 1985.'),
    E('evenement', 1986, '☄️', 'le passage de la comète de Halley', 'La comète de Halley est revenue près de la Terre en 1986.'),
    E('evenement', 1987, '📞', 'le premier Téléthon en France', 'Le premier Téléthon français a lieu en décembre 1987.'),
    E('evenement', 1992, '🇪🇺', 'la signature du traité de Maastricht', 'Le traité de Maastricht, qui crée l\'Union européenne, est signé en 1992.'),
    E('evenement', 1996, '🏃‍♀️', 'la double victoire olympique de Marie-José Pérec à Atlanta', 'Marie-José Pérec gagne le 200 m et le 400 m aux Jeux d\'Atlanta en 1996.'),
    E('evenement', 1999, '🌑', 'l\'éclipse totale de soleil en France', 'Le 11 août 1999, une éclipse totale de soleil traverse le nord de la France.'),
    E('evenement', 2007, '🗳️', 'l\'élection de Nicolas Sarkozy', 'Nicolas Sarkozy est élu président de la République en mai 2007.'),
    E('evenement', 2024, '🏅', 'les Jeux olympiques de Paris', 'Paris accueille les Jeux olympiques à l\'été 2024.'),

    /* ---------- Autres films ---------- */
    E('film', 1953, '🎬', 'le film « Les Vacances de M. Hulot »', 'Jacques Tati invente M. Hulot dans ce film sorti en 1953.'),
    E('film', 1958, '🎬', 'le film « Mon oncle »', 'Jacques Tati sort « Mon oncle » en 1958.'),
    E('film', 1964, '🎬', 'le film « Les Parapluies de Cherbourg »', 'Le film de Jacques Demy, entièrement chanté, avec Catherine Deneuve, sort en 1964.'),
    E('film', 1964, '🎬', 'le film « Le Gendarme de Saint-Tropez »', 'Louis de Funès devient le gendarme Cruchot en 1964.'),
    E('film', 1966, '🎬', 'le film « Un homme et une femme »', 'Le film de Claude Lelouch remporte la Palme d\'or en 1966.'),
    E('film', 1973, '🎬', 'le film « Les Aventures de Rabbi Jacob »', 'Louis de Funès danse dans ce film de Gérard Oury sorti en 1973.'),
    E('film', 1982, '🎬', 'le film « E.T. l\'extra-terrestre »', 'Le film de Steven Spielberg sort en 1982.'),
    E('film', 1982, '🎬', 'le film « Le père Noël est une ordure »', 'La troupe du Splendid adapte sa pièce au cinéma en 1982.'),
    E('film', 1985, '🎬', 'le film « Trois hommes et un couffin »', 'Le film de Coline Serreau sort en 1985.'),
    E('film', 1986, '🎬', 'le film « Jean de Florette »', 'Le film de Claude Berri, d\'après Marcel Pagnol, sort en 1986.'),
    E('film', 1998, '🎬', 'le film « Le Dîner de cons »', 'Jacques Villeret est François Pignon dans ce film sorti en 1998.'),
    E('film', 2001, '🎬', 'le film « Le Fabuleux Destin d\'Amélie Poulain »', 'Audrey Tautou est Amélie dans ce film sorti en 2001.'),
    E('film', 2011, '🎬', 'le film « Intouchables »', 'Omar Sy et François Cluzet partagent l\'affiche de ce film sorti en 2011.'),

    /* ---------- Autres chansons ---------- */
    E('chanson', 1946, '🎵', 'la chanson « La Mer » de Charles Trenet', 'Charles Trenet enregistre « La Mer » en 1946.'),
    E('chanson', 1959, '🎵', 'la chanson « Milord » d\'Édith Piaf', 'Édith Piaf chante « Milord » en 1959.'),
    E('chanson', 1960, '🎵', 'la chanson « Non, je ne regrette rien » d\'Édith Piaf', 'Édith Piaf la chante pour la première fois en 1960.'),
    E('chanson', 1962, '🎵', 'la chanson « Tous les garçons et les filles » de Françoise Hardy', 'Cette chanson fait connaître Françoise Hardy en 1962.'),
    E('chanson', 1964, '🎵', 'la chanson « La Montagne » de Jean Ferrat', 'Jean Ferrat chante « La Montagne » en 1964.'),
    E('chanson', 1965, '🎵', 'la chanson « Poupée de cire, poupée de son » de France Gall', 'Avec cette chanson de Serge Gainsbourg, France Gall gagne l\'Eurovision en 1965 pour le Luxembourg.'),
    E('chanson', 1965, '🎵', 'la chanson « Aline » de Christophe', 'Christophe chante « Aline » en 1965.'),
    E('chanson', 1965, '🎵', 'la chanson « Yesterday » des Beatles', 'Paul McCartney chante « Yesterday » en 1965.'),
    E('chanson', 1973, '🎵', 'la chanson « Il venait d\'avoir 18 ans » de Dalida', 'Dalida chante « Il venait d\'avoir 18 ans » en 1973.'),
    E('chanson', 1975, '🎵', 'la chanson « Le Sud » de Nino Ferrer', 'Nino Ferrer chante « Le Sud » en 1975.'),
    E('chanson', 1978, '🎵', 'la chanson « Alexandrie Alexandra » de Claude François', 'La chanson sort en 1978.'),
    E('chanson', 1981, '🎵', 'la chanson « Les Lacs du Connemara » de Michel Sardou', 'Michel Sardou chante « Les Lacs du Connemara » en 1981.'),
    E('chanson', 1984, '🎵', 'la chanson « Femme libérée » de Cookie Dingler', 'Cookie Dingler chante « Femme libérée » en 1984.'),
    E('chanson', 1985, '🎵', 'la chanson « Mistral gagnant » de Renaud', 'Renaud chante « Mistral gagnant » en 1985.'),
    E('chanson', 1987, '🎵', 'la chanson « Ella, elle l\'a » de France Gall', 'France Gall rend hommage à Ella Fitzgerald en 1987.')
  ];

  // Catégorie supplémentaire du quiz pour les questions personnalisées.
  JS.Donnees.quizCategories = JS.Donnees.quizCategories || {};
  JS.Donnees.quizCategories.jeunesse = { nom: 'Souvenirs de jeunesse', icone: '📅' };

  /* ---------- Outils de personnalisation ---------- */

  const VERBES = {
    objet: 'existait déjà',
    evenement: 'avait déjà eu lieu',
    film: 'était déjà sorti au cinéma',
    chanson: 'était déjà sortie'
  };

  const MOMENTS = {
    objet: 'son apparition',
    evenement: 'cet événement',
    film: 'sa sortie',
    chanson: 'sa sortie'
  };

  function majuscule(texte) {
    return texte.charAt(0).toUpperCase() + texte.slice(1);
  }

  /** Année de naissance du joueur courant, ou null. */
  function anneeNaissance() {
    const p = JS.Stockage.profilActif();
    return p && p.anneeNaissance ? p.anneeNaissance : null;
  }

  /** Âge du joueur l'année donnée (peut être négatif), ou null si l'année de naissance est inconnue. */
  function age(annee) {
    const n = anneeNaissance();
    return n ? annee - n : null;
  }

  /** « vous aviez 20 ans », « l'année de votre naissance », « avant votre naissance »… ou '' si inconnu. */
  function texteAge(annee) {
    const a = age(annee);
    if (a === null) return '';
    if (a < 0) return 'c\'était avant votre naissance';
    if (a === 0) return 'c\'était l\'année de votre naissance';
    return 'vous aviez ' + a + ' an' + (a > 1 ? 's' : '');
  }

  JS.Epoque = {
    majuscule,
    anneeNaissance,
    age,
    texteAge,
    /** « Est-ce que la Carte Bleue existait déjà ? » */
    question: item => 'Est-ce que ' + item.sujet + ' ' + VERBES[item.type] + ' ?',
    /** « La Carte Bleue » */
    titre: item => majuscule(item.sujet),
    /** « son apparition », « cet événement », « sa sortie » */
    moment: item => MOMENTS[item.type]
  };
})();
