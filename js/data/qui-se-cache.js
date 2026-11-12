/* Données du jeu « Qui se cache ? » : personnalités, attributs et questions fermées.
 *
 * Deux familles d'informations, volontairement séparées :
 * - les faits de la FICHE (activité, lieu de naissance, médaille…), vérifiés dans les sources citées ;
 * - les détails du PORTRAIT (lunettes, couvre-chef, micro…), qui décrivent seulement cette image.
 * Chaque personnage renseigne TOUS les attributs par un booléen explicite : une valeur absente est
 * une erreur de données (contrôlée au lancement et par tests/qui-se-cache.cjs), jamais un « non ».
 *
 * Portraits : recadrages 3:4 de photos libres déjà créditées (voir CREDITS-PHOTOS.md), produits par
 * tools/preparer_portraits_qui_se_cache.py dans img/qui-se-cache/.
 */
window.JS = window.JS || {};
JS.Donnees = JS.Donnees || {};

(function () {
  'use strict';

  const W = 'https://fr.wikipedia.org/wiki/';

  const questions = [
    /* ----- La personne (fiche) ----- */
    {
      id: 'femme', attribut: 'femme', nature: 'fiche', libelle: 'Une femme',
      texte: 'Cette personne est-elle une femme ?',
      oui: 'Oui, cette personne est une femme.',
      non: 'Non, cette personne est un homme.',
      aide: 'Cette question sépare les femmes et les hommes du plateau.'
    },
    {
      id: 'cinema', attribut: 'cinema', nature: 'fiche', libelle: 'Surtout connue pour le cinéma',
      texte: 'Cette personne est-elle surtout connue pour le cinéma ?',
      oui: 'Oui, elle est surtout connue pour le cinéma.',
      non: 'Non, elle n’est pas surtout connue pour le cinéma.',
      aide: 'L’activité principale est écrite sous chaque portrait.'
    },
    {
      id: 'chanson', attribut: 'chanson', nature: 'fiche', libelle: 'Surtout connue pour la chanson',
      texte: 'Cette personne est-elle surtout connue pour la chanson ?',
      oui: 'Oui, elle est surtout connue pour la chanson.',
      non: 'Non, elle n’est pas surtout connue pour la chanson.',
      aide: 'L’activité principale est écrite sous chaque portrait.'
    },
    {
      id: 'sport', attribut: 'sport', nature: 'fiche', libelle: 'Surtout connue pour le sport',
      texte: 'Cette personne est-elle surtout connue pour le sport ?',
      oui: 'Oui, elle est surtout connue pour le sport.',
      non: 'Non, elle n’est pas surtout connue pour le sport.',
      aide: 'L’activité principale est écrite sous chaque portrait.'
    },
    {
      id: 'deux-activites', attribut: 'deuxActivites', nature: 'fiche', niveaux: [2, 3, 4],
      libelle: 'Deux activités indiquées sur la fiche',
      texte: 'Sa fiche indique-t-elle deux activités (par exemple le cinéma et la chanson) ?',
      oui: 'Oui, sa fiche indique deux activités.',
      non: 'Non, sa fiche n’indique qu’une seule activité.',
      aide: 'Regardez la ligne d’activité sous chaque portrait : certaines en indiquent deux, reliées par « et ».'
    },
    {
      id: 'nee-paris', attribut: 'neeParis', nature: 'fiche', niveaux: [2, 3, 4],
      libelle: 'Née à Paris',
      texte: 'Cette personne est-elle née à Paris ?',
      oui: 'Oui, elle est née à Paris.',
      non: 'Non, elle n’est pas née à Paris.',
      aide: 'Le lieu de naissance figure dans chaque fiche.'
    },
    {
      id: 'nee-etranger', attribut: 'neeEtranger', nature: 'fiche', niveaux: [2, 3, 4],
      libelle: 'Née hors de France',
      texte: 'Cette personne est-elle née hors de France ?',
      oui: 'Oui, elle est née hors de France.',
      non: 'Non, elle est née en France.',
      aide: 'Le lieu de naissance figure dans chaque fiche, avec le pays lorsqu’il ne s’agit pas de la France.'
    },
    {
      id: 'sport-balle', attribut: 'sportBalle', nature: 'fiche', niveaux: [2, 3, 4],
      libelle: 'Connue pour un sport de balle ou de ballon',
      texte: 'Est-elle connue pour un sport de balle ou de ballon (football, tennis…) ?',
      oui: 'Oui, elle est connue pour un sport de balle ou de ballon.',
      non: 'Non, elle n’est pas connue pour un sport de balle ou de ballon.',
      aide: 'Le sport pratiqué est écrit sous le portrait des sportifs.'
    },
    {
      id: 'cyclisme', attribut: 'cyclisme', nature: 'fiche', niveaux: [2, 3, 4],
      libelle: 'Connue pour le cyclisme',
      texte: 'Est-elle connue pour le cyclisme ?',
      oui: 'Oui, elle est connue pour le cyclisme.',
      non: 'Non, elle n’est pas connue pour le cyclisme.',
      aide: 'Le sport pratiqué est écrit sous le portrait des sportifs.'
    },
    {
      id: 'or-olympique', attribut: 'orOlympique', nature: 'fiche', niveaux: [2, 3, 4],
      libelle: 'Médaille d’or olympique sur la fiche',
      texte: 'Sa fiche mentionne-t-elle une médaille d’or aux Jeux olympiques ?',
      oui: 'Oui, sa fiche mentionne une médaille d’or olympique.',
      non: 'Non, sa fiche ne mentionne pas de médaille d’or olympique.',
      aide: 'Les médailles d’or olympiques sont indiquées dans la fiche.'
    },

    /* ----- Le portrait (cette image seulement) ----- */
    {
      id: 'couleur', attribut: 'couleur', nature: 'portrait', libelle: 'Portrait en couleur',
      texte: 'Son portrait est-il en couleur ?',
      oui: 'Oui, son portrait est en couleur.',
      non: 'Non, son portrait est en noir et blanc.',
      aide: 'Il suffit de regarder les portraits : certains sont en couleur, d’autres en noir et blanc.'
    },
    {
      id: 'lunettes', attribut: 'lunettes', nature: 'portrait', libelle: 'Des lunettes sur le portrait',
      texte: 'Sur son portrait, voit-on des lunettes ?',
      oui: 'Oui, on voit des lunettes sur son portrait.',
      non: 'Non, on ne voit pas de lunettes sur son portrait.',
      aide: 'Seuls quelques portraits montrent des lunettes.'
    },
    {
      id: 'tete-couverte', attribut: 'teteCouverte', nature: 'portrait', libelle: 'Tête couverte sur le portrait',
      texte: 'Sur son portrait, la tête est-elle couverte (chapeau, casquette ou bandeau) ?',
      oui: 'Oui, sur son portrait, la tête est couverte.',
      non: 'Non, sur son portrait, la tête n’est pas couverte.',
      aide: 'Cherchez un chapeau, une casquette ou un bandeau sur les portraits.'
    },
    {
      id: 'moustache', attribut: 'moustache', nature: 'portrait', libelle: 'Une moustache sur le portrait',
      texte: 'Sur son portrait, voit-on une moustache ?',
      oui: 'Oui, on voit une moustache sur son portrait.',
      non: 'Non, on ne voit pas de moustache sur son portrait.',
      aide: 'Seuls quelques portraits montrent une moustache bien visible.'
    },
    {
      id: 'micro-guitare', attribut: 'microGuitare', nature: 'portrait', libelle: 'Un micro ou une guitare en main',
      texte: 'Sur son portrait, tient-on un micro ou une guitare à la main ?',
      oui: 'Oui, sur son portrait, on tient un micro ou une guitare.',
      non: 'Non, sur son portrait, on ne tient ni micro ni guitare.',
      aide: 'Cherchez un micro ou une guitare tenus à la main.'
    },
    {
      id: 'noeud-papillon', attribut: 'noeudPapillon', nature: 'portrait', libelle: 'Un nœud papillon sur le portrait',
      texte: 'Sur son portrait, voit-on un nœud papillon ?',
      oui: 'Oui, on voit un nœud papillon sur son portrait.',
      non: 'Non, on ne voit pas de nœud papillon sur son portrait.',
      aide: 'Cherchez un nœud papillon au col de la chemise.'
    }
  ];

  /* Ordre des attributs (même ordre que ci-dessous, pour la relecture) :
     femme, cinema, chanson, sport, deuxActivites, neeParis, neeEtranger, sportBalle, cyclisme, orOlympique,
     couleur, lunettes, teteCouverte, moustache, microGuitare, noeudPapillon */
  const personnages = [
    /* ---------- Cinéma ---------- */
    {
      id: 'bourvil', nom: 'Bourvil', activite: 'Acteur et chanteur', familier: true,
      ficheCourte: 'Acteur et chanteur, né en Normandie (Prétot-Vicquemare).',
      descriptionPortrait: 'Photo en noir et blanc. Un homme au crâne dégarni, en veste et cravate, regarde sur le côté. Pas de lunettes, tête nue, pas de moustache, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Bourvil a fait rire la France entière, notamment avec Louis de Funès dans « Le Corniaud » et « La Grande Vadrouille ». Il chantait aussi : « La Tactique du gendarme » ou « Salade de fruits » sont restées célèbres.',
      attributs: { femme: false, cinema: true, chanson: false, sport: false, deuxActivites: true, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: false, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Studio Harcourt', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Bourvil-StudioHarcourt-1958-2.png' },
      sources: [W + 'Bourvil']
    },
    {
      id: 'brigitte-bardot', nom: 'Brigitte Bardot', activite: 'Actrice et chanteuse', familier: true,
      ficheCourte: 'Actrice et chanteuse, née à Paris.',
      descriptionPortrait: 'Photo en noir et blanc. Une femme aux longs cheveux clairs coiffés en volume sourit. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Brigitte Bardot devient une star mondiale avec « Et Dieu… créa la femme », puis tourne « Le Mépris ». Elle a aussi enregistré des chansons, dont plusieurs écrites par Serge Gainsbourg, avant de se consacrer à la protection des animaux.',
      attributs: { femme: true, cinema: true, chanson: false, sport: false, deuxActivites: true, neeParis: true, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: false, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'MGM', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Brigitte_Bardot_-_1962.jpg' },
      sources: [W + 'Brigitte_Bardot']
    },
    {
      id: 'louis-de-funes', nom: 'Louis de Funès', activite: 'Acteur', familier: true,
      ficheCourte: 'Acteur, né à Courbevoie (Hauts-de-Seine).',
      descriptionPortrait: 'Photo en noir et blanc. Un homme aux cheveux gris, une écharpe à carreaux autour du cou, parle en regardant sur le côté. Pas de lunettes, tête nue, pas de moustache, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Louis de Funès est l’un des acteurs comiques les plus populaires du cinéma français : « Le Gendarme de Saint-Tropez », « La Grande Vadrouille », « Les Aventures de Rabbi Jacob » ou « Fantômas ».',
      attributs: { femme: false, cinema: true, chanson: false, sport: false, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: false, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Marisa Rastellini (Mondadori Publishers)', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Louis_de_Fun%C3%A8s_%E2%80%94_L%27Homme_orchestre_(1970)_(recadr%C3%A9).jpg' },
      sources: [W + 'Louis_de_Fun%C3%A8s']
    },
    {
      id: 'jean-gabin', nom: 'Jean Gabin', activite: 'Acteur', familier: true,
      ficheCourte: 'Acteur, né à Paris.',
      descriptionPortrait: 'Photo en noir et blanc. Un homme coiffé d’une casquette, le menton appuyé sur la main, a l’air pensif. Pas de lunettes, pas de moustache, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Jean Gabin a marqué plusieurs générations de spectateurs, de « La Grande Illusion » et « Quai des brumes » jusqu’au « Clan des Siciliens » et « Le Chat ».',
      attributs: { femme: false, cinema: true, chanson: false, sport: false, deuxActivites: false, neeParis: true, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: false, lunettes: false, teteCouverte: true, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Studio Harcourt', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Gabin_Harcourt_1948.jpg' },
      sources: [W + 'Jean_Gabin']
    },
    {
      id: 'jean-reno', nom: 'Jean Reno', activite: 'Acteur', familier: false,
      ficheCourte: 'Acteur, né à Casablanca (Maroc).',
      descriptionPortrait: 'Photo en couleur. Un homme à lunettes rondes, avec barbe et moustache grisonnantes, porte un smoking et un nœud papillon noir. Tête nue, ni micro ni guitare.',
      presentation: 'Jean Reno s’est fait connaître dans « Le Grand Bleu », puis « Léon ». Il a fait rire le public en chevalier Godefroy dans « Les Visiteurs ».',
      attributs: { femme: false, cinema: true, chanson: false, sport: false, deuxActivites: false, neeParis: false, neeEtranger: true, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: true, teteCouverte: false, moustache: true, microGuitare: false, noeudPapillon: true },
      photo: { auteur: 'Georges Biard', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Jean_Reno_Cannes_2016.jpg' },
      sources: [W + 'Jean_Reno']
    },
    {
      id: 'sophie-marceau', nom: 'Sophie Marceau', activite: 'Actrice', familier: true,
      ficheCourte: 'Actrice, née à Paris.',
      descriptionPortrait: 'Photo en couleur. Une femme aux cheveux bruns mi-longs, avec une frange, sourit en robe à fines bretelles. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Sophie Marceau est révélée très jeune par « La Boum ». Elle a ensuite mené une longue carrière, en France comme à l’étranger, par exemple dans « Braveheart ».',
      attributs: { femme: true, cinema: true, chanson: false, sport: false, deuxActivites: false, neeParis: true, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Georges Biard', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Sophie_Marceau_Cannes_2015_2.jpg' },
      sources: [W + 'Sophie_Marceau']
    },
    {
      id: 'omar-sy', nom: 'Omar Sy', activite: 'Acteur', familier: true,
      ficheCourte: 'Acteur, né à Trappes (Yvelines).',
      descriptionPortrait: 'Photo en couleur. Un homme aux cheveux très courts, une petite boucle à l’oreille, en manteau sombre sur un fond clair. Pas de lunettes, tête nue, pas de moustache, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Omar Sy s’est d’abord fait connaître à la télévision. Le film « Intouchables » lui vaut le César du meilleur acteur ; il a ensuite joué le rôle principal de la série « Lupin ».',
      attributs: { femme: false, cinema: true, chanson: false, sport: false, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Harald Krichel', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Omar_Sy_(2020).jpg' },
      sources: [W + 'Omar_Sy']
    },
    {
      id: 'audrey-tautou', nom: 'Audrey Tautou', activite: 'Actrice', familier: false,
      ficheCourte: 'Actrice, née à Beaumont (Puy-de-Dôme).',
      descriptionPortrait: 'Photo en couleur. Une femme aux cheveux bruns bouclés et courts sourit largement. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Audrey Tautou est devenue célèbre dans le monde entier grâce au « Fabuleux Destin d’Amélie Poulain ». Elle a aussi incarné Coco Chanel au cinéma.',
      attributs: { femme: true, cinema: true, chanson: false, sport: false, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Georges Biard', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Audrey_Tautou_janvier_2016.jpg' },
      sources: [W + 'Audrey_Tautou']
    },

    /* ---------- Chanson ---------- */
    {
      id: 'charles-aznavour', nom: 'Charles Aznavour', activite: 'Chanteur et acteur', familier: true,
      ficheCourte: 'Chanteur et acteur, né à Paris.',
      descriptionPortrait: 'Photo en couleur. Un homme aux cheveux blancs chante, un micro noir à la main, devant un fond rouge. Pas de lunettes, tête nue, pas de moustache, pas de nœud papillon.',
      presentation: 'Charles Aznavour a écrit et chanté des centaines de chansons, comme « La Bohème », « Emmenez-moi » ou « Hier encore ». Il a aussi joué au cinéma, notamment dans « Tirez sur le pianiste ».',
      attributs: { femme: false, cinema: false, chanson: true, sport: false, deuxActivites: true, neeParis: true, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: true, noeudPapillon: false },
      photo: { auteur: 'Mariusz Kubik', licence: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:2014.06.23._Charles_Aznavour_Fot_Mariusz_Kubik_01.jpg' },
      sources: [W + 'Charles_Aznavour']
    },
    {
      id: 'johnny-hallyday', nom: 'Johnny Hallyday', activite: 'Chanteur et acteur', familier: true,
      ficheCourte: 'Chanteur et acteur, né à Paris.',
      descriptionPortrait: 'Photo en couleur. Un homme aux cheveux châtains coiffés en arrière, avec moustache et bouc, regarde l’objectif. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Johnny Hallyday a fait découvrir le rock à des millions de Français. De « Que je t’aime » à « Allumer le feu », il a rempli les salles pendant plus de cinquante ans et a aussi tourné au cinéma, par exemple dans « L’Homme du train ».',
      attributs: { femme: false, cinema: false, chanson: true, sport: false, deuxActivites: true, neeParis: true, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: true, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Georges Biard', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Johnny_Hallyday_avp_2014_(cropped).jpg' },
      sources: [W + 'Johnny_Hallyday']
    },
    {
      id: 'edith-piaf', nom: 'Édith Piaf', activite: 'Chanteuse', familier: true,
      ficheCourte: 'Chanteuse, née à Paris.',
      descriptionPortrait: 'Photo en noir et blanc. Une femme aux cheveux bruns frisés sourit en levant les yeux, avec un grand col blanc. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Surnommée « la Môme », Édith Piaf reste une voix inoubliable de la chanson française : « La Vie en rose », « L’Hymne à l’amour », « Non, je ne regrette rien ».',
      attributs: { femme: true, cinema: false, chanson: true, sport: false, deuxActivites: false, neeParis: true, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: false, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Studio Harcourt', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Piaf_Harcourt_1946_2.jpg' },
      sources: [W + '%C3%89dith_Piaf']
    },
    {
      id: 'dalida', nom: 'Dalida', activite: 'Chanteuse et actrice', familier: true,
      ficheCourte: 'Chanteuse et actrice, née au Caire (Égypte).',
      descriptionPortrait: 'Photo en couleur. Une femme aux cheveux auburn, en manteau bleu marine à boutons blancs et foulard, regarde au loin. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Dalida a chanté en plusieurs langues des succès comme « Bambino », « Gigi l’amoroso » ou « Paroles, paroles » avec Alain Delon. Elle a aussi été actrice, notamment dans « Le Sixième Jour ».',
      attributs: { femme: true, cinema: false, chanson: true, sport: false, deuxActivites: true, neeParis: false, neeEtranger: true, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Auteur inconnu', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Dalida19673_(cropped).jpg' },
      sources: [W + 'Dalida']
    },
    {
      id: 'nana-mouskouri', nom: 'Nana Mouskouri', activite: 'Chanteuse', familier: true,
      ficheCourte: 'Chanteuse, née à La Canée, en Crète (Grèce).',
      descriptionPortrait: 'Photo en noir et blanc. Une femme aux cheveux bruns raides, coupés au carré, porte de grandes lunettes noires et sourit. Tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Avec ses lunettes devenues célèbres, Nana Mouskouri a chanté dans de nombreuses langues et vendu des disques dans le monde entier, avec des chansons comme « Plaisir d’amour » ou « L’Enfant au tambour ».',
      attributs: { femme: true, cinema: false, chanson: true, sport: false, deuxActivites: false, neeParis: false, neeEtranger: true, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: false, lunettes: true, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Ron Kroon pour Anefo', licence: 'CC BY-SA 3.0 nl', source: 'https://commons.wikimedia.org/wiki/File:Nana_Mouskouri_1966.jpg' },
      sources: [W + 'Nana_Mouskouri']
    },
    {
      id: 'maurice-chevalier', nom: 'Maurice Chevalier', activite: 'Chanteur et acteur', familier: false,
      ficheCourte: 'Chanteur et acteur, né à Paris.',
      descriptionPortrait: 'Photo en noir et blanc. Un homme âgé, coiffé d’un chapeau canotier, sourit en tenant un micro ; il porte un smoking et un nœud papillon. Pas de lunettes, pas de moustache.',
      presentation: 'Avec son canotier, Maurice Chevalier a incarné le music-hall parisien, de « Ma pomme » à « Prosper ». Il a aussi fait carrière à Hollywood, par exemple dans « Gigi ».',
      attributs: { femme: false, cinema: false, chanson: true, sport: false, deuxActivites: true, neeParis: true, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: false, lunettes: false, teteCouverte: true, moustache: false, microGuitare: true, noeudPapillon: true },
      photo: { auteur: 'Eric Koch pour Anefo', licence: 'CC0', source: 'https://commons.wikimedia.org/wiki/File:MauriceChevalier1968Adam_(cropped).jpg' },
      sources: [W + 'Maurice_Chevalier']
    },
    {
      id: 'georges-brassens', nom: 'Georges Brassens', activite: 'Chanteur', familier: true,
      ficheCourte: 'Chanteur, né à Sète (Hérault).',
      descriptionPortrait: 'Photo en noir et blanc. Un homme à l’épaisse moustache, une pipe à la bouche, joue de la guitare. Pas de lunettes, tête nue, pas de nœud papillon.',
      presentation: 'Avec sa guitare, sa pipe et sa moustache, Georges Brassens a écrit des chansons devenues des classiques : « Les Copains d’abord », « La Mauvaise Réputation », « Chanson pour l’Auvergnat ».',
      attributs: { femme: false, cinema: false, chanson: true, sport: false, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: false, lunettes: false, teteCouverte: false, moustache: true, microGuitare: true, noeudPapillon: false },
      photo: { auteur: 'Studio Harcourt', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Brassens-StudioHarcourt-1957.png' },
      sources: [W + 'Georges_Brassens']
    },
    {
      id: 'sylvie-vartan', nom: 'Sylvie Vartan', activite: 'Chanteuse', familier: false,
      ficheCourte: 'Chanteuse, née en Bulgarie.',
      descriptionPortrait: 'Photo en couleur. Une femme aux longs cheveux blonds, en pull bleu marine à col roulé, regarde l’objectif. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Sylvie Vartan devient une vedette de la vague « yé-yé » au début des années 1960. « La plus belle pour aller danser » et « Comme un garçon » font partie de ses grands succès.',
      attributs: { femme: true, cinema: false, chanson: true, sport: false, deuxActivites: false, neeParis: false, neeEtranger: true, sportBalle: false, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Philippe Quaisse', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Vartan-Quaisse0847.jpg' },
      sources: [W + 'Sylvie_Vartan']
    },

    /* ---------- Sport ---------- */
    {
      id: 'zinedine-zidane', nom: 'Zinedine Zidane', activite: 'Footballeur', familier: true,
      ficheCourte: 'Footballeur, né à Marseille.',
      descriptionPortrait: 'Photo en couleur. Un homme au crâne rasé, en veste de survêtement noire, écoute lors d’une conférence de presse ; un micro est posé devant lui, il ne le tient pas. Pas de lunettes, tête nue, pas de moustache, pas de nœud papillon.',
      presentation: 'Zinedine Zidane a marqué deux buts de la tête en finale de la Coupe du monde 1998, remportée par la France. Il est ensuite devenu un entraîneur couronné de succès au Real Madrid.',
      attributs: { femme: false, cinema: false, chanson: false, sport: true, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: true, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Hadi Abyar', licence: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Zinedine_Zidane_by_Tasnim_03.jpg' },
      sources: [W + 'Zinedine_Zidane']
    },
    {
      id: 'yannick-noah', nom: 'Yannick Noah', activite: 'Joueur de tennis et chanteur', familier: true,
      ficheCourte: 'Joueur de tennis et chanteur, né à Sedan (Ardennes).',
      descriptionPortrait: 'Photo en couleur. Un homme coiffé d’un chapeau gris chante sur scène, un micro à la main. Pas de lunettes, pas de moustache visible, pas de nœud papillon.',
      presentation: 'Yannick Noah a remporté Roland-Garros en 1983, une victoire restée dans les mémoires. Il est ensuite devenu un chanteur populaire, avec des titres comme « Saga Africa ».',
      attributs: { femme: false, cinema: false, chanson: false, sport: true, deuxActivites: true, neeParis: false, neeEtranger: false, sportBalle: true, cyclisme: false, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: true, moustache: false, microGuitare: true, noeudPapillon: false },
      photo: { auteur: 'Gyrostat', licence: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Pause_Guitare_2015_ven_0331.jpg' },
      sources: [W + 'Yannick_Noah']
    },
    {
      id: 'suzanne-lenglen', nom: 'Suzanne Lenglen', activite: 'Joueuse de tennis', familier: false,
      ficheCourte: 'Joueuse de tennis, née à Paris. Médaille d’or olympique.',
      descriptionPortrait: 'Photo ancienne en noir et blanc. Une femme aux cheveux courts porte un large bandeau sur la tête et un haut blanc. Pas de lunettes, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Suzanne Lenglen a dominé le tennis féminin dans les années 1920 : six victoires à Wimbledon et des médailles d’or aux Jeux olympiques d’Anvers. Un court de Roland-Garros porte son nom.',
      attributs: { femme: true, cinema: false, chanson: false, sport: true, deuxActivites: false, neeParis: true, neeEtranger: false, sportBalle: true, cyclisme: false, orOlympique: true,
        couleur: false, lunettes: false, teteCouverte: true, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Auteur inconnu', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Suzanne_Lenglen_02.jpg' },
      sources: [W + 'Suzanne_Lenglen']
    },
    {
      id: 'teddy-riner', nom: 'Teddy Riner', activite: 'Judoka', familier: true,
      ficheCourte: 'Judoka, né aux Abymes (Guadeloupe). Médailles d’or olympiques.',
      descriptionPortrait: 'Photo en couleur. Un homme au crâne rasé sourit largement, en smoking avec un nœud papillon noir. Pas de lunettes, tête nue, pas de moustache, ni micro ni guitare.',
      presentation: 'Teddy Riner est l’un des plus grands judokas de l’histoire, avec de nombreux titres de champion du monde et plusieurs médailles d’or olympiques, notamment à Londres, Rio et Paris.',
      attributs: { femme: false, cinema: false, chanson: false, sport: true, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: true,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: true },
      photo: { auteur: 'Georges Biard', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Teddy_Riner_Cannes_2016.jpg' },
      sources: [W + 'Teddy_Riner']
    },
    {
      id: 'marie-jose-perec', nom: 'Marie-José Pérec', activite: 'Athlète', familier: true,
      ficheCourte: 'Athlète (course à pied), née à Basse-Terre (Guadeloupe). Médailles d’or olympiques.',
      descriptionPortrait: 'Photo en couleur. Une femme aux cheveux courts tirés en arrière sourit, en robe bustier grise, avec de grandes boucles d’oreilles. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Marie-José Pérec a remporté trois médailles d’or olympiques : le 400 mètres à Barcelone en 1992, puis le 200 et le 400 mètres à Atlanta en 1996.',
      attributs: { femme: true, cinema: false, chanson: false, sport: true, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: false, orOlympique: true,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Georges Biard', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Marie-Jos%C3%A9_P%C3%A9rec_Cannes_2016.jpg' },
      sources: [W + 'Marie-Jos%C3%A9_P%C3%A9rec']
    },
    {
      id: 'raymond-poulidor', nom: 'Raymond Poulidor', activite: 'Cycliste', familier: true,
      ficheCourte: 'Cycliste, né dans la Creuse (Masbaraud-Mérignat).',
      descriptionPortrait: 'Photo en couleur. Un homme aux cheveux bruns sourit, en maillot de cycliste violet portant l’inscription « Mercier ». Pas de lunettes, tête nue, pas de moustache, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Surnommé « Poupou », Raymond Poulidor est monté huit fois sur le podium du Tour de France sans jamais porter le maillot jaune. Sa persévérance l’a rendu immensément populaire.',
      attributs: { femme: false, cinema: false, chanson: false, sport: true, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: true, orOlympique: false,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Panini', licence: 'Domaine public', source: 'https://commons.wikimedia.org/wiki/File:Raymond_Poulidor_en_1968.jpg' },
      sources: [W + 'Raymond_Poulidor']
    },
    {
      id: 'jeannie-longo', nom: 'Jeannie Longo', activite: 'Cycliste', familier: true,
      ficheCourte: 'Cycliste, née à Annecy (Haute-Savoie). Médaille d’or olympique.',
      descriptionPortrait: 'Photo en couleur. Une femme aux cheveux bruns bouclés et courts, en gilet gris, sourit légèrement. Pas de lunettes, tête nue, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Jeannie Longo possède l’un des plus beaux palmarès du cyclisme, avec de très nombreux titres de championne du monde et de France, et la médaille d’or olympique de la course sur route à Atlanta en 1996.',
      attributs: { femme: true, cinema: false, chanson: false, sport: true, deuxActivites: false, neeParis: false, neeEtranger: false, sportBalle: false, cyclisme: true, orOlympique: true,
        couleur: true, lunettes: false, teteCouverte: false, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Matthieu Riegler', licence: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:Jeannie_Longo_-_6_jours_de_Grenoble_2011.jpg' },
      sources: [W + 'Jeannie_Longo']
    },
    {
      id: 'laurent-fignon', nom: 'Laurent Fignon', activite: 'Cycliste', familier: false,
      ficheCourte: 'Cycliste, né à Paris.',
      descriptionPortrait: 'Photo en couleur. Un homme à lunettes, coiffé d’une casquette de cycliste verte, sourit au milieu de la foule. Pas de moustache, ni micro ni guitare, pas de nœud papillon.',
      presentation: 'Reconnaissable à ses lunettes, Laurent Fignon a gagné le Tour de France en 1983 et en 1984. Il a perdu celui de 1989 pour seulement huit secondes, l’écart le plus faible de l’histoire de l’épreuve.',
      attributs: { femme: false, cinema: false, chanson: false, sport: true, deuxActivites: false, neeParis: true, neeEtranger: false, sportBalle: false, cyclisme: true, orOlympique: false,
        couleur: true, lunettes: true, teteCouverte: true, moustache: false, microGuitare: false, noeudPapillon: false },
      photo: { auteur: 'Eric Houdas', licence: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Laurent_FIGNON.jpg' },
      sources: [W + 'Laurent_Fignon']
    }
  ];

  // Univers principal (pour équilibrer les plateaux) et chemin du portrait local.
  personnages.forEach(p => {
    p.univers = p.attributs.cinema ? 'cinema' : (p.attributs.chanson ? 'chanson' : 'sport');
    p.portrait = 'img/qui-se-cache/' + p.id + '.jpg';
  });

  /* Plateaux de secours, déjà validés par les tests : utilisés si le tirage ne trouve pas de plateau. */
  const plateauxSecours = {
    1: ['bourvil', 'edith-piaf', 'zinedine-zidane', 'brigitte-bardot', 'georges-brassens', 'marie-jose-perec'],
    2: ['louis-de-funes', 'sophie-marceau', 'jean-reno', 'charles-aznavour', 'dalida', 'nana-mouskouri', 'yannick-noah', 'teddy-riner', 'jeannie-longo'],
    3: ['bourvil', 'audrey-tautou', 'omar-sy', 'johnny-hallyday', 'edith-piaf', 'sylvie-vartan', 'zinedine-zidane', 'raymond-poulidor', 'marie-jose-perec'],
    4: ['bourvil', 'louis-de-funes', 'sophie-marceau', 'audrey-tautou', 'charles-aznavour', 'johnny-hallyday', 'dalida', 'sylvie-vartan',
      'raymond-poulidor', 'laurent-fignon', 'marie-jose-perec', 'jeannie-longo']
  };

  JS.Donnees.quiSeCache = { personnages, questions, plateauxSecours };
})();
