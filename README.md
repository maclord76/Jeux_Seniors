# Jeux de mémoire pour seniors

Compilation de 24 jeux de stimulation cognitive en français, pensée pour les seniors, avec de gros textes, un contraste élevé et des parties à jouer à son rythme. La progression de chaque joueur est enregistrée dans le navigateur.

## Utilisation

[Jouer en ligne](https://maclord76.github.io/Jeux_Seniors/)

- **Ouvrir le site** : double-cliquer sur `index.html`. Aucune installation, aucune connexion Internet nécessaire.
- **Pour l'héberger**, copier le contenu du dossier `dist/` sur le serveur web, en conservant l'organisation des fichiers. Le fichier `index.html` doit se trouver à la racine du dossier publié.
- Après une modification du projet, régénérer `dist/` avec `python tools/preparer_dist.py`. Cette commande remplace entièrement l'ancien dossier `dist/` : ne pas y conserver de fichiers personnels.
- Pour développer avec un serveur local : `python -m http.server 8137`, puis ouvrir <http://localhost:8137>.

## Les jeux

| Famille | Jeux |
|---|---|
| Mémoire visuelle | Jeu des paires, Objet manquant, Qu’est-ce qui a changé ?, La liste de courses, Trouver l'intrus, Puzzle |
| Jeux de mots | Mots mêlés, Mots croisés, Mots fléchés, Mot mélangé, La tour des mots, Proverbe à compléter |
| Logique et calcul | Sudoku, Suites logiques, Remettre dans l’ordre, Jeu de Nim, Mastermind, Rendre la monnaie |
| Écoute et culture | Simon mélodie, Le son mystère, Quiz souvenirs et culture, Ça existait déjà ?, Jeu des 7 familles, Qui se cache ? |

Sélection inspirée de [Capretraite](https://www.capretraite.fr/blog/style-de-vie/seniors-7-types-de-jeux-pour-memoire-efficaces-et-gratuits-pour-stimuler-votre-cerveau/), de [France Alzheimer](https://www.francealzheimer.org/10-jeux-pour-stimuler-la-memoire/) et des principes du programme EDITH de Dynseo (« sans chronomètre ni mise en échec »).

## Progression

- Plusieurs joueurs par appareil (prénom + image).
- Chaque jeu a plusieurs niveaux. Le niveau suivant se débloque à partir de **80 % de réussite**. Après deux parties sous 40 %, le site propose (sans l'imposer) de redescendre d'un niveau.
- 1 à 3 étoiles par partie : toujours au moins une.
- Objectif quotidien réglable, série de jours consécutifs, 14 badges.
- Écran « Mes progrès » : activité des deux dernières semaines, courbe de réussite par jeu, tableau jeu par jeu, badges.

## Personnalisation par l'âge

L'année de naissance (facultative, demandée à la création du joueur et modifiable dans les Réglages) personnalise :

- **Ça existait déjà ?** : « Quand vous aviez 20 ans, en 1965, est-ce que la Carte Bleue existait déjà ? », puis la date exacte et l'âge du joueur à ce moment-là. Sans année de naissance, les questions portent sur des années (« En 1970… »).
- **Quiz** : trois questions « Souvenirs de jeunesse » par partie (« En 1976, vous aviez 31 ans : lequel de ces souvenirs date de cette année-là ? », « Le TGV : quel âge aviez-vous l'année de son apparition ? »), choisies de préférence entre 10 et 35 ans, l'âge des souvenirs les plus vifs.

Les 232 repères datés (149 objets, lieux, lois et émissions, 42 événements, 22 films, 19 chansons, de 1943 à 2024) sont dans `js/data/epoque.js`. Chaque partie compte 10 questions ; le jeu évite les 100 derniers repères montrés au joueur, ce qui garantit une dizaine de parties sans répétition. Pour éviter les dates qui varient d'un an selon les sources, les jeux ne comparent jamais deux dates à moins de deux ans d'écart.

## Mode Emojis ou Photos

Sur l'accueil, à côté de la salutation, le sélecteur **Images : Emojis / Photos** est enregistré pour chaque joueur.

- **Emojis** (par défaut) : dessins, sans aucun fichier.
- **Photos** : les jeux qui en ont affichent de vraies photos libres de Wikimedia Commons, créditées sous chaque image (JPEG de 640 px au plus) :
  - « Ça existait déjà ? » : 112 photos (dossier `img/epoque/`, environ 6 Mo) illustrent 119 des 232 repères. Ce mode choisit en priorité les repères qui ont une photo pas encore vue et complète avec des emojis s'il en manque.
  - « Quiz souvenirs et culture » : une photo illustre la bonne réponse, une fois la réponse donnée (323 photos dans `img/quiz/`, environ 17 Mo, pour 346 des 417 questions ; les « Souvenirs de jeunesse » reprennent les photos des repères).
  - Pour un film, une chanson ou un événement, la photo montre souvent l'acteur, le chanteur ou la personnalité : la mention « Sur la photo : … » le précise.

Crédits et licences : voir [CREDITS-PHOTOS.md](CREDITS-PHOTOS.md). Les correspondances sont dans `js/data/epoque-photos.js` (par repère) et `js/data/quiz-photos.js` (par article d'illustration). L'affichage commun est dans `js/core/photos.js`.

## Pas de répétition

« Ça existait déjà ? » et le quiz retiennent, pour chaque joueur, les questions posées récemment (respectivement les 100 et les 200 dernières) et les évitent tant qu'il en reste d'autres. Le quiz compte 417 questions (154 faciles, 161 moyennes, 102 difficiles), réparties sur 8 thèmes : même au niveau le plus difficile, une dizaine de parties s'enchaînent sans revoir une question.

## Réglages d'accessibilité

Taille du texte (3 tailles), contraste élevé, sons, lecture des consignes à voix haute (synthèse vocale du navigateur), affichage facultatif du temps écoulé, objectif quotidien.

## Sauvegarde

Les données sont dans le `localStorage` du navigateur, sous la clé `jeuxSeniors`. Elles restent propres à ce navigateur sur cet appareil : vider les données du navigateur les efface.

Depuis **Réglages → Sauvegarde**, on enregistre un fichier `sauvegarde-<prénom>-<date>.json` (un joueur ou tous) ; on le réimporte depuis les Réglages ou l'écran de choix du joueur. Si le prénom existe déjà, le site demande s'il faut remplacer, ajouter ou ignorer.

Format du fichier :

```json
{
  "format": "jeux-seniors-sauvegarde",
  "version": 1,
  "exporteLe": "2026-11-03T10:00:00.000Z",
  "profils": [{ "id": "…", "prenom": "Marie", "avatar": "👵", "reglages": {}, "jeux": {}, "parties": [], "badges": [], "serie": {} }]
}
```

## À savoir

- Les 417 questions du quiz, les 107 proverbes et les 232 repères datés ont été rédigés sans source en ligne : une relecture humaine est conseillée avant diffusion.
- Les grandes grilles (mots mêlés 14×14, sudoku 9×9) sont confortables sur tablette ou ordinateur, plus serrées sur téléphone.

## Organisation du code

Scripts classiques (pas de modules ES, pour fonctionner en `file://`) partageant l'espace de noms `window.JS`.

```
index.html          charge les scripts dans l'ordre
css/styles.css      thème, composants et classes de jeu (.plateau, .tuile, .choix…)
js/core/            storage (profils, export/import), audio (sons, voix), ui (routeur, modales, utilitaires),
                    registry (catalogue des jeux), progress (niveaux, étoiles, série, badges)
js/data/            mots, proverbes, questions du quiz, repères datés et leurs photos
img/epoque/         photos libres des repères datés (mode Photos)
img/quiz/           photos libres des réponses du quiz (mode Photos)
img/qui-se-cache/   portraits recadrés du jeu « Qui se cache ? »
audio/sons-mysteres/ extraits MP3 du jeu « Le son mystère »
js/games/           un fichier par jeu
js/screens/         profils, accueil, jeu (cadre commun), progres, reglages
js/app.js           démarrage
```

## Ajouter un jeu

1. Créer `js/games/mon-jeu.js` sur le modèle de `js/games/memory.js` :

```js
JS.Jeux.register({
  id: 'mon-jeu',
  nom: 'Mon jeu',
  categorie: 'logique',          // visuelle | mots | logique | auditive
  icone: '🎲',
  description: 'Phrase courte pour la carte de l\'accueil.',
  consigne: 'Explication complète, lue à voix haute si demandé.',
  niveauxMax: 6,
  descriptionNiveau: n => '…',
  start(ctx) {
    // ctx.root, ctx.niveau, ctx.reglages, ctx.audio, ctx.message(texte, type),
    // ctx.plusTard(fn, ms), ctx.repeter(fn, ms), ctx.actif(),
    // ctx.enchainer(fn, ms?) : après une bonne réponse, passe seul à la suite (2 s par défaut),
    // ctx.terminer({ reussite: 0..1, score, details })
    return () => { /* nettoyage facultatif */ };
  }
});
```

2. Ajouter `<script src="js/games/mon-jeu.js"></script>` dans `index.html`, avec les autres jeux.

## Salons par décennie

Dans **Réglages**, choisissez les années 1950, 1960, 1970, 1980 ou 1990. Le sélecteur est disponible uniquement sur cette page ; le thème choisi reste appliqué dans toute l'application. Chaque décennie possède une illustration de salon originale et une palette dédiée. Le mode **Classique** conserve le fond habituel sans décor.

Le choix est propre à chaque joueur, persiste après fermeture et fait partie des sauvegardes JSON. Les anciennes sauvegardes et les thèmes inconnus reviennent au mode Classique. Le mode Photos/Emojis reste indépendant. En contraste élevé, les palettes sont neutralisées et les illustrations masquées pour préserver la lisibilité.

Les cinq PNG locaux sont dans `img/themes/`, avec les prompts de génération dans `img/themes/PROMPTS.md`. Aucune connexion n'est nécessaire. Ces décors sont des évocations illustrées, pas des archives historiques.

Vérification de la persistance et de la compatibilité des sauvegardes : `node tests/themes.cjs`.

## Nouveaux jeux du quotidien

- **La liste de courses** (Mémoire visuelle) : 3 listes par partie, 6 niveaux de 3 à 8 produits à mémoriser. Le joueur choisit quand cacher la liste, compose son panier et peut retirer un produit avant validation.
- **Remettre dans l’ordre** (Logique et calcul) : 3 activités par partie parmi 8 situations du quotidien, 4 niveaux de 3 à 6 étapes. Sélection par clic ou clavier, annulation du dernier choix et remise à zéro avant validation ; aucun glisser-déposer nécessaire.

Les deux jeux utilisent les étoiles, les niveaux et les sauvegardes habituels. Aucun délai imposé. Les corrections restent affichées jusqu’au passage volontaire à la manche suivante. Vérification : `node tests/quotidien.cjs`.

## Le son mystère

« Le son mystère » est jouable sur GitHub Pages, avec les sons intégrés à la version web. Les 36 extraits préparés sont également disponibles dans le dossier [audio/sons-mysteres](audio/sons-mysteres).

- **Le son mystère** (Écoute et culture) : trois sons familiers par partie, sans chronomètre. Le joueur lance lui-même l'écoute (rien ne démarre seul), puis choisit parmi de grands boutons (image + texte). Après chaque réponse, la bonne réponse et une courte phrase s'affichent. Après une bonne réponse, le jeu passe seul au son suivant au bout de 5 secondes (comme les autres jeux) ; après une erreur, il attend « Continuer ».
- Réécouter reste possible sans limite, mais chaque réécoute avant de répondre retire 20 % des points de la manche (une bonne réponse en garde toujours au moins 40 %). Après la réponse, le résultat et l’anecdote remplacent le bouton de réécoute.
- 6 niveaux : 2 choix très différents, 3 choix bien distincts, 3 puis 4 choix d'un même univers, 4 choix parfois proches, 4 choix aux distinctions plus fines. Les niveaux 1 et 2 n'utilisent que les sons les plus reconnaissables. Le niveau suivant s'ouvre à 80 % de réussite, comme ailleurs : les trois sons reconnus, avec trois réécoutes au plus.
- 36 extraits MP3 locaux (`audio/sons-mysteres/`, environ 2,6 Mo) répartis en 6 univers : animaux, maison, objets d'autrefois, nature, transports, vie quotidienne. Les données sont dans `js/data/sons-mysteres.js` : libellé, univers, phrase, sons proches, fausses réponses plausibles et paires à ne jamais proposer ensemble (par exemple la pluie et le tonnerre).
- Une partie ne répète jamais un son, varie les univers et évite les 12 derniers sons entendus par le joueur.
- Si un fichier ne peut pas être lu, le jeu propose de passer à une autre question ; cette manche n'est pas comptée. Après trois échecs, la partie s'arrête sans être enregistrée.
- Le son du jeu ne dépend pas du réglage « Sons » (qui ne coupe que les petits effets de réussite) : le volume reste celui de l'appareil.
- Sources et licence des extraits : [CREDITS-SONS.md](CREDITS-SONS.md). Les extraits ont été choisis d'après leur titre : une écoute humaine de chacun est conseillée avant diffusion.
- Vérification (données, fichiers, tirages, parcours complets, son illisible) : `node tests/son-mystere.cjs`.

## Qui se cache ?

- **Qui se cache ?** (Écoute et culture) : un jeu de déduction. Une personnalité du cinéma, de la chanson ou du sport se cache parmi les portraits ; le joueur choisit des questions fermées (« Cette personne est-elle une femme ? », « Sur son portrait, voit-on des lunettes ? »), l’ordinateur répond oui ou non, et les portraits incompatibles sont écartés. Trois enquêtes par partie, avec un nouveau plateau et un personnage secret différent à chaque fois. Lorsqu’un seul portrait reste après les éliminations validées, la réussite est automatique et la suite arrive après 5 secondes.
- **4 niveaux** : 6 portraits de personnalités familières et questions simples (élimination automatique) ; 9 portraits et toutes les questions (élimination automatique) ; 9 portraits, le joueur écarte lui-même les portraits puis valide ; 12 portraits plus proches les uns des autres, élimination par le joueur.
- **Contrôles** : de vrais boutons, utilisables au toucher, à la souris et au clavier. Trois questions à la fois, « 🔄 Autres questions » pour les suivantes (gratuit). « 🔎 J’ai trouvé » (après au moins une question) : toucher un portrait, puis « Je propose [nom] » — un clic sur un portrait n’est jamais une proposition à lui seul. En élimination manuelle, la sélection se modifie librement avant « Valider mes choix ». « 💡 Aidez-moi » suggère la question qui partage le mieux les portraits restants, ou sélectionne les portraits à écarter, avec un malus de 10 points par utilisation. Chaque portrait a sa « Fiche » (activité, lieu de naissance, réponses à toutes les questions, description du portrait, crédit photo).
- **Erreurs** : une proposition fausse écarte ce portrait (« Ce n’est pas cette personne. Continuons l’enquête. ») et s’ajoute aux indices ; une validation manuelle incorrecte ne modifie pas le plateau et invite à relire la réponse. La dernière réponse et l’historique des indices restent affichés : rien n’est à mémoriser.
Le nombre de questions affiché est indicatif (6 photos → 4 questions, 9 → 6, 12 → 7). Il est possible de poursuivre sans pénalité de dépassement. Chaque enquête vaut 100 points et le seuil de déblocage reste à 80 % sur l’ensemble des trois enquêtes. Pour chaque question, comparer le nombre de portraits qu’elle permet d’écarter à coup sûr à celui du meilleur choix disponible. Le coût par portrait d’écart augmente selon le niveau (40, 45, 50 puis 55 points). Une proposition correcte alors que plusieurs portraits restent possibles retire le même montant qu’un portrait d’écart. Un indice coûte 10 points et une erreur 20 points.
- **Sans voix** : tout est écrit. Les boutons « 🔊 Écouter » lisent la réponse, une fiche ou la présentation avec la synthèse vocale existante ; la lecture automatique des réponses suit le réglage « voix » du joueur. Le jeu ne dépend jamais de la voix.
- **Toujours résoluble** : les plateaux sont construits à partir de groupes de « signatures » distinctes (les réponses d’un personnage à toutes les questions du niveau) ; deux portraits d’un même plateau ne sont donc jamais indiscernables, et il existe toujours une question utile tant qu’il reste plusieurs portraits. Un plateau de secours validé existe pour chaque niveau ; si les données ne permettent aucun plateau, le jeu l’explique et propose de revenir au choix des niveaux, sans enregistrer de partie.
- **Portraits** : 24 personnalités (8 par univers, 10 femmes et 14 hommes, plusieurs générations), avec 16 questions : 10 sur la fiche (activité, lieu de naissance, médaille d’or olympique…) et 6 sur ce que montre le portrait (couleur, lunettes, couvre-chef, moustache, micro ou guitare, nœud papillon). Aucun outil de génération d’images n’étant disponible, les portraits sont des recadrages 3:4 de photos libres de Wikimedia Commons déjà présentes dans le projet (`img/qui-se-cache/`, environ 0,8 Mo, produits par `python tools/preparer_portraits_qui_se_cache.py`). Ils restent affichés en mode Emojis comme en mode Photos, car ils constituent le plateau. Chaque détail du portrait utilisé par une question a été contrôlé à l’œil. Si une image manque, la carte affiche le nom et la description complète du portrait. Crédits : [CREDITS-PHOTOS.md](CREDITS-PHOTOS.md).
- Données : `js/data/qui-se-cache.js` (faits de la fiche et détails du portrait séparés, sources Wikipédia pour chaque personne). Les faits ont été rédigés sans vérification en ligne : une relecture humaine est conseillée avant diffusion.
- Vérification (données, portraits, plateaux et résolubilité pour chaque secret, indépendance des suggestions vis-à-vis du secret, éliminations, propositions, aides, barème, parcours complets) : `node tests/qui-se-cache.cjs`.

## Mots croisés et mots fléchés

- **Mots croisés** (Jeux de mots) : une grille générée à chaque partie sur l'un des 12 thèmes, à partir de 296 mots ayant chacun une définition simple et une définition courte (`js/data/mots-croises.js`). 6 niveaux, de 4 mots courts avec la première lettre donnée à 10 mots dans une grille de 13 × 13 au plus.
- Saisie avec le clavier affiché sous la grille (lettres dans l'ordre alphabétique, pratique sur tablette) ou avec le clavier de l'ordinateur ; les accents ne comptent pas. Flèches pour se déplacer, touche « ⇄ Sens » ou second toucher d'une case pour passer de l'horizontal au vertical.
- Un mot juste devient vert sans rien valider. Aides : « 💡 Une lettre » (retire 3 % de réussite par lettre, 40 % au plus) et « 🔎 Vérifier » (barre les lettres fausses pendant quelques secondes, sans pénalité).
- **Mots fléchés** (Jeux de mots) : mêmes thèmes, mêmes mots, même saisie et mêmes aides, mais les définitions courtes sont écrites dans des cases bleues de la grille, avec une flèche (▶ vers la droite, ▼ vers le bas). Une case peut porter deux définitions. La définition complète n'est pas affichée d'office : c'est un indice, « 📖 Définition détaillée », qui l'affiche en grand au-dessus de la grille pour le mot choisi (et l'y laisse pour ce mot) ; il retire 2 % de réussite. Sur un petit écran, les cases n'affichent plus que la flèche : le bandeau au-dessus de la grille montre alors la définition courte du mot choisi, sans pénalité. 6 niveaux, de 4 à 9 mots, grille de 12 × 12 au plus (cases définition comprises).
- Les deux jeux partagent le même moteur (`js/games/mots-croises.js`, exposé sous `JS.MotsCroises`) ; `js/games/mots-fleches.js` ne fait que le configurer.
- Vérification des deux générateurs (taille, croisements, absence de mot parasite, numérotation, cases définition) : `node tests/mots-croises.cjs`.


## Illustrations du Puzzle

Le jeu choisit aléatoirement ses illustrations dans deux séries de quatre :

- Niveaux 1 à 4 : maison, voilier, fleurs en pot, lac de montagne.
- Niveaux 5 à 8 : jardin du village, port de pêche, marché, jardin botanique.

Les scènes deviennent plus riches en détails dans la seconde série. Les fichiers PNG locaux sont dans `img/puzzle/` et fonctionnent sans connexion. Le nombre de pièces et les aides restent définis par chaque niveau.
