/* Données : proverbes et expressions françaises à compléter. */
window.JS = window.JS || {};

(function () {
  'use strict';
  JS.Donnees = JS.Donnees || {};

  /**
   * Chaque entrée : { texte, reponse, leurres, difficulte, second }.
   * « ___ » marque l'emplacement du mot à trouver ; leurres : 3 réponses plausibles mais fausses ;
   * difficulte : 1 (très connu) à 3 (moins courant).
   * second (niveaux à deux mots) : { mot, leurres } — un mot présent une seule fois dans le texte,
   * caché lui aussi, avec 3 leurres. Absent pour les proverbes trop courts ou aux mots répétés.
   */
  const P = (texte, reponse, leurres, difficulte, mot2, leurres2) =>
    ({ texte, reponse, leurres, difficulte, second: mot2 ? { mot: mot2, leurres: leurres2 } : null });

  JS.Donnees.proverbes = [
    /* ---------- Très connus ---------- */
    P("Petit à petit, l'oiseau fait son ___.", "nid", ["chant", "vol", "chemin"], 1, "oiseau", ["écureuil", "artisan", "aigle"]),
    P("Qui vole un œuf vole un ___.", "bœuf", ["poulet", "mouton", "cochon"], 1, "œuf", ["sou", "clou", "fruit"]),
    P("Il ne faut pas vendre la peau de l'ours avant de l'avoir ___.", "tué", ["vu", "attrapé", "chassé"], 1, "ours", ["âne", "agneau", "élan"]),
    P("Après la pluie, le beau ___.", "temps", ["soleil", "jour", "ciel"], 1, "pluie", ["neige", "nuit", "tempête"]),
    P("L'habit ne fait pas le ___.", "moine", ["prêtre", "roi", "tailleur"], 1, "habit", ["argent", "uniforme", "âge"]),
    P("Qui sème le vent récolte la ___.", "tempête", ["pluie", "foudre", "grêle"], 1, "vent", ["blé", "froid", "feu"]),
    P("Pierre qui roule n'amasse pas ___.", "mousse", ["poussière", "sable", "terre"], 1, "roule", ["tombe", "court", "glisse"]),
    P("La nuit, tous les chats sont ___.", "gris", ["noirs", "invisibles", "silencieux"], 1, "chats", ["loups", "chiens", "oiseaux"]),
    P("Il n'y a pas de fumée sans ___.", "feu", ["bois", "flamme", "raison"], 1, "fumée", ["lumière", "cendre", "fête"]),
    P("Mieux vaut tard que ___.", "jamais", ["rien", "demain", "tôt"], 1, "tard", ["peu", "bien", "lentement"]),
    P("Rien ne sert de courir, il faut partir à ___.", "point", ["temps", "l'heure", "l'aube"], 1, "courir", ["marcher", "crier", "pleurer"]),
    P("Tel père, tel ___.", "fils", ["frère", "enfant", "fille"], 1, "père", ["oncle", "roi", "maire"]),
    P("Loin des yeux, loin du ___.", "cœur", ["corps", "esprit", "nez"], 1, "yeux", ["mains", "pieds", "bras"]),
    P("Les bons comptes font les bons ___.", "amis", ["voisins", "marchands", "clients"], 1, "comptes", ["repas", "vins", "outils"]),
    P("Quand le chat n'est pas là, les souris ___.", "dansent", ["dorment", "mangent", "chantent"], 1, "chat", ["chien", "maître", "loup"]),
    P("L'appétit vient en ___.", "mangeant", ["cuisinant", "marchant", "parlant"], 1, "appétit", ["amour", "esprit", "ennui"]),
    P("Qui va à la chasse perd sa ___.", "place", ["chaise", "maison", "tour"], 1, "chasse", ["pêche", "messe", "foire"]),
    P("Il faut battre le fer pendant qu'il est ___.", "chaud", ["rouge", "tendre", "neuf"], 1, "fer", ["blé", "linge", "tapis"]),
    P("On ne fait pas d'omelette sans casser des ___.", "œufs", ["assiettes", "coquilles", "poêles"], 1, "omelette", ["affaire", "entrée", "erreur"]),
    P("Paris ne s'est pas fait en un ___.", "jour", ["an", "mois", "siècle"], 1, "Paris", ["Lyon", "Marseille", "Londres"]),
    P("La parole est d'argent, mais le silence est d'___.", "or", ["bronze", "platine", "diamant"], 1, "silence", ["sommeil", "savoir", "regard"]),
    P("Il ne faut pas mettre la charrue avant les ___.", "bœufs", ["chevaux", "roues", "vaches"], 1, "charrue", ["charrette", "brouette", "herse"]),
    P("L'union fait la ___.", "force", ["paix", "joie", "loi"], 1, "union", ["amitié", "entente", "envie"]),
    P("Vouloir, c'est ___.", "pouvoir", ["savoir", "réussir", "faire"], 1),
    P("Il faut tourner sept fois sa langue dans sa bouche avant de ___.", "parler", ["répondre", "manger", "crier"], 1, "sept", ["trois", "dix", "deux"]),
    P("C'est en forgeant qu'on devient ___.", "forgeron", ["savant", "maître", "artisan"], 1, "forgeant", ["travaillant", "cherchant", "lisant"]),
    P("L'argent ne fait pas le ___.", "bonheur", ["malheur", "riche", "plaisir"], 1, "argent", ["or", "amour", "esprit"]),
    P("Le temps, c'est de l'___.", "argent", ["or", "histoire", "amour"], 1, "temps", ["travail", "savoir", "sport"]),
    P("Mieux vaut prévenir que ___.", "guérir", ["soigner", "punir", "regretter"], 1, "prévenir", ["attendre", "partir", "courir"]),
    P("Plus on est de fous, plus on ___.", "rit", ["chante", "s'amuse", "crie"], 1, "fous", ["amis", "gens", "enfants"]),
    P("Les murs ont des ___.", "oreilles", ["yeux", "fenêtres", "fissures"], 1, "murs", ["portes", "arbres", "voisins"]),
    P("Tous les chemins mènent à ___.", "Rome", ["Paris", "la mer", "Lyon"], 1, "chemins", ["routes", "rivières", "trains"]),
    P("Un homme averti en vaut ___.", "deux", ["trois", "mille", "dix"], 1, "averti", ["armé", "pressé", "honnête"]),
    P("Œil pour œil, dent pour ___.", "dent", ["œil", "nez", "main"], 1),
    P("Jamais deux sans ___.", "trois", ["quatre", "toi", "un"], 1, "deux", ["cinq", "dix", "huit"]),
    P("Pas de nouvelles, bonnes ___.", "nouvelles", ["affaires", "choses", "lettres"], 1),
    P("Il faut le voir pour le ___.", "croire", ["savoir", "dire", "comprendre"], 1, "voir", ["lire", "faire", "boire"]),
    P("Quand on parle du loup, on en voit la ___.", "queue", ["tête", "patte", "trace"], 1, "loup", ["diable", "renard", "chien"]),
    P("Rira bien qui rira le ___.", "dernier", ["premier", "plus fort", "plus longtemps"], 1),
    P("Les grands esprits se ___.", "rencontrent", ["ressemblent", "comprennent", "retrouvent"], 1, "grands", ["beaux", "petits", "vieux"]),

    /* ---------- Expressions imagées ---------- */
    P("Être comme un poisson dans l'___.", "eau", ["océan", "aquarium", "bocal"], 1, "poisson", ["oiseau", "chat", "roi"]),
    P("Coûter les yeux de la ___.", "tête", ["figure", "main", "face"], 1, "yeux", ["dents", "oreilles", "cheveux"]),
    P("Avoir la tête dans les ___.", "nuages", ["étoiles", "mains", "cieux"], 1, "tête", ["main", "bouche", "jambe"]),
    P("Mettre les pieds dans le ___.", "plat", ["bol", "seau", "tapis"], 1, "pieds", ["mains", "doigts", "bras"]),
    P("Avoir un poil dans la ___.", "main", ["soupe", "barbe", "poche"], 1, "poil", ["cheveu", "doigt", "fil"]),
    P("Les carottes sont ___.", "cuites", ["râpées", "crues", "mûres"], 1, "carottes", ["pommes", "patates", "pâtes"]),
    P("Faire d'une pierre deux ___.", "coups", ["murs", "trous", "tas"], 1, "pierre", ["main", "balle", "flèche"]),
    P("Prendre le taureau par les ___.", "cornes", ["pattes", "oreilles", "sabots"], 1, "taureau", ["cheval", "bœuf", "mouton"]),
    P("Donner sa langue au ___.", "chat", ["chien", "loup", "perroquet"], 1, "langue", ["main", "tête", "part"]),
    P("Être sur son trente et ___.", "un", ["deux", "trois", "quatre"], 1, "trente", ["vingt", "quarante", "cinquante"]),
    P("Il y a anguille sous ___.", "roche", ["pierre", "l'eau", "terre"], 2, "anguille", ["poisson", "truite", "grenouille"]),
    P("Tirer les vers du ___.", "nez", ["sol", "fruit", "sac"], 2, "vers", ["fils", "clous", "mots"]),
    P("Revenons à nos ___.", "moutons", ["affaires", "brebis", "oignons"], 2, "Revenons", ["Pensons", "Passons", "Courons"]),
    P("Appeler un chat un ___.", "chat", ["chien", "matou", "minou"], 2),
    P("Avoir d'autres chats à ___.", "fouetter", ["nourrir", "caresser", "garder"], 2, "chats", ["chiens", "poissons", "soucis"]),
    P("Mettre la main à la ___.", "pâte", ["poche", "tâche", "poêle"], 2, "main", ["tête", "patte", "bouche"]),
    P("Chercher une aiguille dans une botte de ___.", "foin", ["laine", "blé", "fil"], 2, "aiguille", ["épingle", "perle", "bague"]),
    P("Il ne faut pas jeter le bébé avec l'eau du ___.", "bain", ["puits", "seau", "lavoir"], 2, "bébé", ["chat", "linge", "savon"]),

    /* ---------- Moyennement connus ---------- */
    P("Chat échaudé craint l'eau ___.", "froide", ["chaude", "bouillante", "claire"], 2, "échaudé", ["mouillé", "perdu", "blessé"]),
    P("À cœur vaillant, rien d'___.", "impossible", ["interdit", "inconnu", "difficile"], 2, "vaillant", ["joyeux", "ouvert", "sincère"]),
    P("Un « tiens » vaut mieux que deux « tu l'___ ».", "auras", ["avais", "aurais", "as"], 2, "deux", ["trois", "cent", "dix"]),
    P("Les chiens aboient, la caravane ___.", "passe", ["avance", "s'arrête", "repart"], 2, "aboient", ["grognent", "courent", "dorment"]),
    P("Une hirondelle ne fait pas le ___.", "printemps", ["été", "nid", "beau temps"], 2, "hirondelle", ["abeille", "fleur", "cigale"]),
    P("Qui se ressemble s'___.", "assemble", ["entend", "aime", "attire"], 2),
    P("Tout vient à point à qui sait ___.", "attendre", ["patienter", "espérer", "chercher"], 2, "point", ["temps", "propos", "bout"]),
    P("Qui ne risque rien n'a ___.", "rien", ["tout", "peu", "jamais"], 2, "risque", ["donne", "cherche", "perd"]),
    P("Les petits ruisseaux font les grandes ___.", "rivières", ["fleuves", "mers", "eaux"], 2, "ruisseaux", ["torrents", "nuages", "sentiers"]),
    P("Aide-toi, le ciel t'___.", "aidera", ["écoutera", "pardonnera", "sauvera"], 2, "ciel", ["monde", "sort", "roi"]),
    P("Bien mal acquis ne profite ___.", "jamais", ["guère", "longtemps", "toujours"], 2, "acquis", ["gagné", "payé", "caché"]),
    P("Qui aime bien châtie ___.", "bien", ["mal", "souvent", "peu"], 2),
    P("À chaque jour suffit sa ___.", "peine", ["joie", "tâche", "chance"], 2, "jour", ["mois", "soir", "an"]),
    P("Il ne faut jamais dire : « Fontaine, je ne boirai pas de ton ___. »", "eau", ["vin", "puits", "source"], 2, "Fontaine", ["Rivière", "Ruisseau", "Torrent"]),
    P("Ce sont les cordonniers les plus mal ___.", "chaussés", ["habillés", "payés", "logés"], 2, "cordonniers", ["boulangers", "tailleurs", "forgerons"]),
    P("En avril, ne te découvre pas d'un ___.", "fil", ["pas", "cheveu", "bouton"], 2, "avril", ["mars", "mai", "hiver"]),
    P("Les absents ont toujours ___.", "tort", ["raison", "froid", "peur"], 2, "absents", ["présents", "anciens", "enfants"]),
    P("La fortune sourit aux ___.", "audacieux", ["courageux", "patients", "honnêtes"], 2, "fortune", ["chance", "vie", "gloire"]),
    P("Chose promise, chose ___.", "due", ["faite", "tenue", "dite"], 2),
    P("Comme on fait son lit, on se ___.", "couche", ["repose", "réveille", "lève"], 2, "lit", ["nid", "pain", "feu"]),
    P("Il ne faut pas réveiller le chat qui ___.", "dort", ["ronronne", "mange", "rêve"], 2, "réveiller", ["caresser", "nourrir", "appeler"]),
    P("La raison du plus fort est toujours la ___.", "meilleure", ["bonne", "seule", "plus juste"], 2, "raison", ["loi", "parole", "volonté"]),
    P("On a souvent besoin d'un plus petit que ___.", "soi", ["lui", "moi", "nous"], 2, "petit", ["grand", "fort", "jeune"]),
    P("Il faut laisser le temps au ___.", "temps", ["hasard", "destin", "monde"], 2),
    P("Qui veut voyager loin ménage sa ___.", "monture", ["santé", "valise", "bourse"], 2, "voyager", ["marcher", "partir", "courir"]),
    P("On ne prête qu'aux ___.", "riches", ["amis", "sages", "pauvres"], 2, "prête", ["donne", "parle", "vend"]),
    P("Il ne faut pas courir deux lièvres à la ___.", "fois", ["chasse", "course", "suite"], 2, "lièvres", ["lapins", "renards", "cerfs"]),
    P("Le mieux est l'ennemi du ___.", "bien", ["mal", "pire", "bon"], 2, "mieux", ["trop", "doute", "luxe"]),
    P("Les chiens ne font pas des ___.", "chats", ["loups", "renards", "lions"], 2, "chiens", ["oiseaux", "poules", "vaches"]),
    P("Qui veut la fin veut les ___.", "moyens", ["efforts", "risques", "outils"], 2, "fin", ["paix", "gloire", "route"]),
    P("Ce n'est pas à un vieux singe qu'on apprend à faire la ___.", "grimace", ["sieste", "cuisine", "fête"], 2, "singe", ["chat", "loup", "renard"]),
    P("Qui ne dit mot ___.", "consent", ["se tait", "comprend", "réfléchit"], 2, "mot", ["rien", "non", "oui"]),
    P("Mains froides, cœur ___.", "chaud", ["froid", "tendre", "grand"], 2, "froides", ["chaudes", "sales", "gelées"]),

    /* ---------- Moins courants ---------- */
    P("Noël au balcon, Pâques au ___.", "tison", ["jardin", "salon", "grenier"], 3, "balcon", ["perron", "soleil", "marché"]),
    P("Qui dort ___.", "dîne", ["rêve", "oublie", "guérit"], 3),
    P("À bon chat, bon ___.", "rat", ["chien", "maître", "souris"], 3, "chat", ["coq", "renard", "matou"]),
    P("Qui trop embrasse mal ___.", "étreint", ["aime", "serre", "dort"], 3, "embrasse", ["parle", "promet", "mange"]),
    P("Il faut que jeunesse se ___.", "passe", ["fasse", "amuse", "forme"], 3, "jeunesse", ["vieillesse", "sagesse", "enfance"]),
    P("Les conseilleurs ne sont pas les ___.", "payeurs", ["meilleurs", "acteurs", "sages"], 3, "conseilleurs", ["vendeurs", "prêteurs", "donneurs"]),
    P("Ventre affamé n'a point d'___.", "oreilles", ["appétit", "patience", "raison"], 3, "affamé", ["rassasié", "vide", "plein"]),
    P("Abondance de biens ne ___ pas.", "nuit", ["suffit", "dure", "sert"], 3, "biens", ["mots", "maux", "fruits"]),
    P("Faute de grives, on mange des ___.", "merles", ["pigeons", "moineaux", "poulets"], 3, "grives", ["perdrix", "cailles", "faisans"]),
    P("L'occasion fait le ___.", "larron", ["voleur", "bonheur", "malin"], 3, "occasion", ["habitude", "envie", "ambition"]),
    P("Chacun voit midi à sa ___.", "porte", ["fenêtre", "montre", "horloge"], 3, "midi", ["minuit", "matin", "soir"]),
    P("À l'impossible, nul n'est ___.", "tenu", ["obligé", "capable", "prêt"], 3, "impossible", ["inconnu", "incroyable", "absurde"]),
    P("Il n'est pire eau que l'eau qui ___.", "dort", ["coule", "stagne", "gèle"], 3, "pire", ["belle", "douce", "froide"]),
    P("Autres temps, autres ___.", "mœurs", ["gens", "lieux", "modes"], 3, "temps", ["jours", "pays", "siècles"]),
    P("Il y a loin de la coupe aux ___.", "lèvres", ["mains", "dents", "verres"], 3, "coupe", ["bouteille", "tasse", "cruche"]),
    P("Ne pas être dans son ___.", "assiette", ["fauteuil", "bol", "plat"], 1, "être", ["dormir", "manger", "rester"])
  ];
})();
