# Plan de réalisation — « Qui se cache ? »

Date : 10 novembre 2026. Projet : `Jeux_Seniors`.

## 1. Mission de l’agent

Programmer et intégrer un jeu de déduction intitulé **« Qui se cache ? »** dans la catégorie **Écoute et culture**. Le joueur interroge l’ordinateur pour identifier une personnalité cachée parmi plusieurs portraits. Il choisit ses questions, écarte des portraits et fait une proposition.

Ce document fixe le périmètre de la première version. Réaliser les données, les illustrations, le moteur, l’interface, l’intégration, les vérifications et l’export `dist`. Lire les éventuelles instructions `AGENTS.md` applicables avant de modifier les fichiers et vérifier l’état actuel du code : les références ci-dessous correspondent à l’inspection du 10 novembre 2026.

### Intentions à préserver

- Un jeu de plateau et de déduction, avec des choix à faire, plutôt qu’une suite de questions de culture générale.
- Un public âgé, avec ou sans difficultés de mémoire : consignes courtes, grandes cartes, aucune limite de temps, aides toujours accessibles.
- Des personnalités du cinéma, de la chanson et du sport ; aucune connaissance biographique obligatoire pour réussir.
- Les informations utiles restent consultables. Ne pas demander de mémoriser les réponses précédentes.
- Aucun extrait de chanson ni fichier audio à rechercher. La lecture facultative utilise la synthèse vocale existante.
- Une application statique utilisable par ouverture de `index.html`, sans serveur obligatoire, API distante ni bibliothèque supplémentaire.

## 2. Règles et niveaux

### Une partie

1. La partie comprend **trois enquêtes**.
2. Au début de chaque enquête, constituer un plateau, puis choisir uniformément son personnage secret parmi les portraits affichés qui n’ont pas déjà été secrets dans cette partie. Le secret reste fixe jusqu’à la fin de l’enquête.
3. Afficher les portraits avec le nom et une courte fiche. Les positions ne changent plus pendant l’enquête.
4. Proposer des questions fermées. Exemples : « La chanson fait-elle partie de ses activités ? » ou « Porte-t-elle des lunettes sur ce portrait ? ».
5. Le joueur choisit une question ; l’ordinateur répond oui ou non. La réponse et la question sont ajoutées à un historique visible.
6. Les portraits incompatibles sont écartés automatiquement ou par le joueur, selon le niveau.
7. Après au moins une question, le bouton **« J’ai trouvé »** permet de choisir un portrait et de confirmer sa proposition.
8. Une proposition exacte révèle le personnage, avec une courte présentation culturelle. Un bouton **« Enquête suivante »** lance la suite ; après la troisième, **« Voir mon bilan »** appelle l’écran de fin commun. En cas de validation automatique du dernier portrait, ce passage se déclenche aussi après 5 secondes.

Changer de plateau entre les enquêtes, sans répéter le personnage secret au cours d’une même partie. Les autres portraits peuvent réapparaître. Ne pas implémenter de mémoire interparties supplémentaire dans cette première version.

| Niveau | Portraits | Élimination | Présentation |
| --- | ---: | --- | --- |
| 1 | 6 | Automatique | Personnalités et portraits bien distincts, questions simples |
| 2 | 9 | Automatique | Davantage de portraits et de traits partagés |
| 3 | 9 | Manuelle avec validation | Le joueur sélectionne les portraits à écarter |
| 4 | 12 | Manuelle avec validation | Plus de personnages proches, toujours distinguables |

Les quatre niveaux utilisent les mêmes règles de base. Ne pas ajouter un adversaire qui joue à son tour : l’ordinateur tient seulement le rôle du personnage interrogé. Ne pas créer de second sélecteur de difficulté en plus des niveaux existants.

### Erreurs et aides

- Un clic sur un portrait ne constitue jamais à lui seul une proposition définitive.
- Une proposition fausse ne termine pas l’enquête. Afficher « Ce n’est pas cette personne. Continuons l’enquête. », écarter ce portrait et conserver cette nouvelle information dans l’historique.
- Une sélection manuelle peut être modifiée librement avant validation.
- Une validation incorrecte ne modifie pas le plateau définitif ; inviter à relire la réponse. Une aide peut montrer puis appliquer les éliminations attendues.
- **« Aidez-moi »**, disponible avec un malus de 10 points par utilisation, suggère une question utile ou aide à terminer les éliminations de la réponse en cours.
- Lire, réécouter et consulter une fiche ne coûte aucun point.
- Lorsqu’un seul portrait reste après les éliminations validées, valider automatiquement la réussite, afficher le résultat puis passer à l’enquête suivante ou au bilan après 5 secondes. Suspendre ce délai pendant la pause et annuler son effet si le joueur passe déjà à la suite ou quitte la partie.

## 3. Données et portraits

### Banque initiale

Préparer **24 personnalités**, en recherchant une diversité de figures familières du cinéma, de la chanson et du sport. Viser environ huit personnalités par univers, avec des femmes et des hommes et plusieurs générations. Les activités peuvent se recouper : une personne peut être à la fois actrice et chanteuse.

Choisir les identités après vérification des sources et des possibilités d’illustration. Ne pas affirmer qu’une personne n’a jamais chanté ou joué au cinéma parce qu’elle est surtout connue pour une autre activité. Pour la première version, exclure les questions sur des dates précises, la vie privée ou des jugements subjectifs.

Créer `js/data/qui-se-cache.js`, exposant les données via `JS.Donnees.quiSeCache`. Prévoir :

- `personnages` : `id`, `nom`, `portrait`, `descriptionPortrait`, `ficheCourte`, `presentation`, indicateur de familiarité pour le niveau 1, attributs et références des sources.
- `questions` : `id`, texte interrogatif, clé d’attribut, réponse positive rédigée, réponse négative rédigée et courte explication pour l’aide. Une liste facultative `niveaux` peut réserver certaines formulations aux niveaux avancés ; par défaut, une question est disponible à tous les niveaux.
- Des attributs booléens explicites pour **toutes** les questions et **tous** les personnages. Une valeur absente est une erreur de données, jamais un « non » implicite.

Séparer les faits culturels vérifiés des détails propres à l’illustration. Ainsi « Porte-t-elle un chapeau sur ce portrait ? » décrit cette image, pas une habitude réelle de la personne. Les questions doivent être formulées en conséquence.

### Informations accessibles

Chaque attribut utilisé pour éliminer une carte doit pouvoir être retrouvé dans sa fiche ou dans la description de son portrait. Le joueur doit pouvoir raisonner même s’il ne reconnaît pas la personnalité ou ne voit pas bien l’image.

Le nom et l’activité restent visibles sous le portrait. Le détail est accessible par une commande « Fiche de [nom] ». Ne pas encombrer chaque carte avec une biographie complète.

### Illustrations

- Créer ou sélectionner des portraits distincts et respectueux, adaptés à un public adulte, avec un cadrage et des dimensions homogènes.
- Préférer des illustrations créées pour le jeu ; si l’outil de génération d’images est disponible, suivre la compétence `imagegen` applicable. Conserver les prompts dans `img/qui-se-cache/PROMPTS.md`.
- Stocker les fichiers localement dans `img/qui-se-cache/`. Aucune URL d’image distante au moment de jouer.
- Si des photographies sont retenues, vérifier leur licence et consigner précisément source, auteur et licence dans `CREDITS-PHOTOS.md`. Ne pas supposer que la célébrité du sujet rend une photographie librement réutilisable.
- Contrôler visuellement chaque portrait avant de saisir ses attributs. Des lunettes, un chapeau ou une moustache doivent être nets et cohérents avec les réponses du jeu.
- Les portraits du jeu sont conservés dans les deux réglages globaux « Emojis / Photos », car ils constituent le matériel du plateau. Documenter ce choix, sans ajouter une seconde banque de visuels.
- Prévoir un remplacement lisible en cas d’image manquante : nom et description complète. La disparition d’un fichier ne doit pas empêcher la déduction.

Les dessins provisoires peuvent servir au développement, mais ne constituent pas les portraits finaux. Si un outil ou une ressource manque, livrer le travail réalisable et signaler précisément le reste à produire, sans présenter une banque incomplète comme terminée.

## 4. Garantir des enquêtes toujours résolubles

Ce point est obligatoire, avant de travailler les animations.

### Signature d’un personnage

La signature est la liste de ses réponses aux questions disponibles au niveau joué. Deux portraits d’un même plateau ne doivent jamais avoir une signature identique.

Construire les plateaux à partir de groupes de signatures distinctes, plutôt qu’avec une boucle de tirage sans limite. Prévoir au moins un plateau de secours validé pour chaque niveau. Si les données ne permettent pas un plateau valide, afficher un message explicite et permettre de revenir au choix des niveaux, sans enregistrer une partie artificiellement perdue.

### État logique et état d’affichage

Conserver séparément :

- Le plateau initial et l’identifiant secret.
- Les questions déjà posées et leurs réponses.
- Les personnages encore compatibles avec **toutes** les informations reçues, y compris les propositions fausses.
- Les cartes définitivement écartées.
- La sélection manuelle temporaire, qui n’a aucun effet sur la vérité du jeu.
- La phase actuelle, les compteurs et les résultats des enquêtes précédentes.

Après chaque information, le secret doit toujours appartenir aux personnages compatibles. Ne jamais recalculer le secret à partir des cartes restantes.

### Questions proposées

Une question est utile si elle partage les personnages compatibles en deux groupes non vides, « oui » et « non ». Ne pas proposer une question déjà posée, ni une question dont la réponse est déjà déduite.

Afficher au maximum trois questions à la fois, avec **« Autres questions »** si nécessaire. Ce bouton ne consomme aucune question. L’ensemble accessible doit couvrir les questions utiles restantes. Leur choix et leur ordre ne doivent pas dépendre du personnage secret : éviter de donner involontairement un indice.

L’aide suggère la question dont le plus grand des deux groupes est le plus petit ; départager les égalités aléatoirement. Ce calcul utilise les candidats, pas l’identité cachée.

S’il reste plusieurs candidats, au moins une question utile doit toujours exister. Sinon, traiter cela comme une anomalie de données. Lorsqu’il ne reste qu’un portrait après validation des éliminations, afficher automatiquement la réussite puis passer à la suite après 5 secondes.

### Élimination manuelle

Après une réponse, figer temporairement les questions et les propositions. Demander de sélectionner les nouvelles cartes incompatibles, puis de cliquer sur **« Valider mes choix »**.

Comparer l’ensemble sélectionné à l’ensemble attendu. Une erreur ne modifie pas les exclusions définitives. Appliquer exactement la même règle à **toute carte compatible**, y compris au secret : refuser seulement le secret donnerait sa réponse par essais successifs.

Après une validation correcte, écarter les cartes et revenir aux questions. L’aide permet d’appliquer la bonne sélection et de continuer. Les cartes écartées gardent leur emplacement et leur nom, avec un état « Écarté » explicite ; ne pas réorganiser la grille.

## 5. Interface et accessibilité

Dans la zone de jeu commune, prévoir :

1. « Enquête 1 sur 3 », nombre de portraits restants et nombre de questions posées.
2. La question et la réponse les plus récentes, toujours en texte, avec un bouton de lecture.
3. Le plateau des portraits.
4. Les actions de la phase : questions, validation d’élimination ou confirmation d’une proposition.
5. L’historique des indices, consultable sans quitter le plateau.

Utiliser des libellés explicites : « Choisir une question », « Écarter ces portraits », « Je propose [nom] », « Revenir à l’enquête ». Ne pas faire dépendre l’action d’un double clic ou d’un appui long.

- Chaque action est utilisable au toucher, à la souris et au clavier, avec de vrais boutons et un focus visible.
- Ne pas imbriquer les boutons de fiche dans un autre bouton de carte.
- Préserver le focus lors des mises à jour ; déplacer le focus vers la prochaine action lorsqu’un contrôle disparaît.
- Respecter les tailles de texte, les thèmes et le contraste élevé existants. Viser des zones tactiles d’au moins 48 px, et des cartes nettement plus grandes.
- Distinguer les états par du texte ou un symbole en plus de la couleur. Rendre la sélection manuelle compréhensible avec `aria-pressed`.
- Sur petit écran, laisser défiler la page verticalement plutôt que réduire excessivement les portraits. Aucun débordement horizontal à 360 px avec la plus grande taille de texte.
- Annoncer les réponses et les corrections avec `ctx.message` / une zone `aria-live` adaptée, sans relire tout le plateau.
- Respecter `prefers-reduced-motion`. Une animation de retournement est facultative et ne doit pas conditionner la logique.

### Lecture vocale

Réutiliser `JS.UI.boutonLecture` et `ctx.audio`, qui existent déjà. Le bouton explicite peut lancer la voix même si la lecture automatique des consignes est désactivée, conformément au comportement actuel.

Ne pas lire automatiquement chaque carte. Une lecture automatique d’une réponse doit respecter le réglage de voix du profil. Arrêter la lecture au changement d’enquête, à la sortie et lors d’une interruption appropriée. Le socle coupe déjà la voix à la pause et au changement d’écran.

La présence de `speechSynthesis` ne garantit pas qu’une voix française fonctionnera hors ligne. Le texte et les actions doivent rester utilisables si la voix est absente, échoue ou ne se termine pas ; ne jamais attendre un événement vocal pour débloquer le jeu.

## 6. Réussite, score et progression

Chaque enquête vaut 100 points. Avant chaque réponse, comparer le nombre minimal de portraits que la question permet d’écarter à celui du meilleur partage disponible. Pour chaque portrait d’écart, retirer 40 points au niveau 1, 45 au niveau 2, 50 au niveau 3 et 55 au niveau 4. Une proposition correcte alors que plusieurs portraits restent possibles retire le même montant qu’un portrait d’écart. Un indice coûte 10 points, une erreur 20 points, avec un minimum de zéro par enquête.

Le repère vaut `Math.ceil(nombrePortraits / 2 + 1)` (4 questions pour 6 photos, 6 pour 9 et 7 pour 12). Il reste affiché à titre indicatif. Continuer à poser les questions utiles est toujours permis, sans pénalité de dépassement.

La réussite est la somme des points obtenus divisée par 300. Le niveau suivant se débloque à partir de 80 %. Les premiers niveaux écartent les portraits automatiquement. Les suivants demandent au joueur de vérifier les éliminations et présentent des plateaux plus difficiles à départager.

Les fiches, l’historique et les lectures vocales sont gratuits. Tous les boutons d’aide aux questions, aux éliminations et aux propositions comptent comme un indice.

Appeler `ctx.terminer({ reussite, score, details })` une seule fois, avec `reussite` compris entre zéro et un.

## 7. Intégration dans le code existant

### Fichiers à créer

| Fichier | Rôle |
| --- | --- |
| `js/data/qui-se-cache.js` | Personnages, attributs, questions et sources |
| `js/games/qui-se-cache.js` | Logique pure, état de partie, rendu et inscription au registre |
| `img/qui-se-cache/` | Portraits et prompts éventuels |
| `tests/qui-se-cache.cjs` | Validations des données, déduction, parcours et barème |

### Fichiers à modifier

- `index.html` : charger les données avec les autres fichiers de données, puis le jeu dans « Jeux : écoute et culture », avant les scripts d’écrans.
- `css/styles.css` : styles préfixés `qsc-`, réutilisant les variables et composants communs.
- `README.md` : ajouter les règles, niveaux, contrôles, fonctionnement sans voix, choix des portraits et commande de test. Recompter les jeux réellement chargés : le tableau actuel ne contient pas tous les jeux présents dans les scripts.
- `CREDITS-PHOTOS.md` : documenter les ressources du nouveau jeu si nécessaire.

Enregistrement : `id: 'qui-se-cache'`, `nom: 'Qui se cache ?'`, `categorie: 'auditive'`, `icone: '🔎'`, `niveauxMax: 4`, avec description, consigne, `descriptionNiveau(n)` et `start(ctx)`.

Le projet utilise des scripts classiques et `window.JS`. Ne pas introduire de modules ES, de `fetch` pour les données locales, de framework ou de chaîne de compilation.

L’accueil, les progrès et plusieurs badges se basent sur `JS.Jeux.liste()` : l’enregistrement suffit normalement. L’état du nouveau jeu est créé par `JS.Progres.etatJeu`. Ne pas ajouter de migration de sauvegarde ou de liste de jeux parallèle sans nécessité constatée.

### Organisation interne recommandée

- Fonctions pures : validation des signatures, constitution du plateau, candidats compatibles, questions utiles, éliminations attendues, question conseillée, calcul du résultat.
- Exposer ces fonctions via `logique` sur la définition du jeu, comme dans `son-mystere.js`, pour les tester sans navigateur.
- Injecter une source de hasard dans les fonctions de tirage afin de permettre des tests reproductibles ; `Math.random` peut rester la valeur par défaut.
- Phases explicites : `question`, `reponse`, `elimination`, `proposition`, `resultat`, `termine`.
- Toute action vérifie la phase, `ctx.actif()` et la pause. Ignorer les doubles clics et les rappels d’une ancienne enquête.
- `start(ctx)` renvoie une fonction de nettoyage. Utiliser les minuteries du contexte si nécessaire, retirer les écouteurs ajoutés et annuler les effets encore actifs. Ne pas attendre d’une animation qu’elle termine une action logique.

Sources locales à consulter : `js/core/registry.js`, `js/screens/jeu.js`, `js/core/progress.js`, `js/core/audio.js`, `js/core/ui.js`, `js/games/son-mystere.js`, `tests/son-mystere.cjs` et `tools/preparer_dist.py`.

## 8. Ordre de réalisation

1. **Données et règles** : préparer les personnalités et questions, vérifier les faits, définir les signatures et valider les possibilités de plateaux aux quatre niveaux.
2. **Moteur testable** : programmer le tirage, les réponses, les exclusions, les questions utiles, l’aide, les propositions et le barème. Prouver la résolubilité avant l’intégration visuelle.
3. **Parcours accompagné** : intégrer une enquête complète à six portraits, avec élimination automatique, historique, lecture facultative et proposition confirmée.
4. **Parcours complet** : ajouter les trois enquêtes, les quatre niveaux, l’élimination manuelle réversible avant validation et le bilan commun.
5. **Portraits définitifs et finition** : finaliser les images, vérifier leurs attributs, ajuster l’affichage mobile, le clavier, les thèmes et les états de focus.
6. **Vérification et livraison** : effectuer les contrôles ci-dessous, mettre à jour la documentation et régénérer la distribution.

## 9. Vérifications attendues

### Tests automatisés ciblés

Dans `tests/qui-se-cache.cjs`, reprendre le style Node / `vm` / `assert` déjà utilisé, sans dépendance obligatoire supplémentaire.

- Identifiants uniques, attributs complets et booléens, sources renseignées, portraits locaux présents.
- Pour chaque niveau, tester de nombreux tirages reproductibles et **chaque secret possible de chaque plateau testé** : taille correcte, signatures distinctes, secret présent, question utile tant qu’il reste plusieurs candidats.
- Vérifier que les deux branches de chaque question donnent exactement les exclusions attendues et qu’une suite de questions utiles isole toujours le secret en au plus `N - 1` questions.
- Vérifier que les suggestions et l’ordre des questions ne changent pas lorsque seul le secret change, à candidats et graine de hasard identiques.
- Une mauvaise sélection manuelle ne touche pas les exclusions définitives ; la règle est identique pour le secret et les autres cartes compatibles.
- Une proposition fausse met à jour les candidats et l’historique ; aucune proposition déjà écartée ne peut être recomptée.
- L’aide permet de poursuivre avec le malus prévu et sans blocage, y compris en phase manuelle.
- Parcours complets aux quatre niveaux : sans erreur, avec erreurs, avec aides et sans voix.
- Barème : trois enquêtes sans erreur ni indice, avec les questions les plus équilibrées  donnent `reussite = 1` ; trois erreurs seules donnent `0.8` ; bornes correctes ; dépassement du repère gratuit, mauvais partages et indices pénalisés ; aucun malus pour lecture ou consultation.
- Nettoyage et garde des phases : doubles clics, sortie en cours d’enquête et anciens rappels ne déclenchent pas une seconde fin de partie.
- Données insuffisantes ou plateau invalide : sortie compréhensible, sans boucle infinie ni faux résultat.

Commandes minimales depuis la racine :

```powershell
node --check js/data/qui-se-cache.js
node --check js/games/qui-se-cache.js
node tests/qui-se-cache.cjs
```

### Vérification dans un vrai navigateur

- Jouer une partie accompagnée complète et une partie manuelle, comprenant erreur puis correction.
- Vérifier le parcours uniquement au clavier, la lecture vocale et son absence, ainsi que le remplacement d’une image défaillante.
- Tester à 360 px, sur tablette et sur ordinateur, avec texte agrandi, contraste élevé et mouvement réduit.
- Vérifier la pause si le chronomètre facultatif est activé, l’arrêt de partie, le changement de profil et le retour à l’accueil pendant une lecture.
- Vérifier l’apparition dans la catégorie, le déblocage des niveaux, les étoiles, les records, la persistance après rechargement et l’export/import d’un profil contenant ce jeu.
- Ouvrir directement `index.html` pour vérifier la compatibilité `file://`, puis tester aussi via un serveur local. Aucune ressource du jeu ne doit nécessiter une connexion extérieure.
- Contrôler l’absence d’erreurs console. Ne pas assimiler les tests du faux DOM à cette vérification visuelle et interactive.

Comme `index.html` et les styles partagés évoluent, lancer les tests existants pertinents pour les jeux affectés et vérifier visuellement l’accueil et au moins un autre jeu. Si aucun test n’est exécutable dans l’environnement, donner la cause exacte et la vérification de remplacement effectuée.

### Distribution

Une fois les contrôles réussis, exécuter `python tools/preparer_dist.py`. Le script prépare une nouvelle distribution puis remplace entièrement le dossier `dist` : ne pas modifier ses fichiers à la main. Vérifier que la destination est bien celle du projet et qu’elle ne contient pas de fichiers personnels.

Contrôler les références des scripts et portraits dans `dist`, puis ouvrir son `index.html` et jouer une enquête. Le script copie déjà les dossiers `js`, `css` et `img` ; aucune nouvelle règle de copie ne devrait être nécessaire.

## 10. Livrable et critères de fin

La réalisation est terminée lorsque le jeu est accessible depuis l’accueil, que les quatre niveaux et les trois enquêtes fonctionnent, que tous les plateaux sont distinguables, que les aides ne bloquent jamais la partie et que les résultats rejoignent le suivi habituel.

Livrer les fichiers source, la banque de portraits et ses références, les tests, la documentation et `dist` régénéré. Dans le compte rendu, citer les fichiers principaux, résumer les contrôles réellement exécutés et signaler les limites restantes, notamment sur les portraits ou la disponibilité des voix.
