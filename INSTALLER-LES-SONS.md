# Installer « Le son mystère » en local

Les 24 jeux sont disponibles sur [GitHub Pages](https://maclord76.github.io/Jeux_Seniors/). Ce guide sert à activer « Le son mystère » dans une copie locale de la branche source. Les extraits Mixkit sont intégrés à la version jouable en ligne. [Licence Mixkit](https://mixkit.co/license/modal/sfxFree/)

1. [Téléchargez le projet](https://github.com/maclord76/Jeux_Seniors/archive/refs/heads/main.zip) et décompressez-le.
2. Ouvrez la page Mixkit de chaque son et utilisez le bouton de téléchargement près du titre anglais.
3. Créez le sous-dossier `sons-mysteres` dans `audio` et placez-y les MP3. Renommez chaque fichier comme indiqué dans le tableau. Si le téléchargement est dans un autre format, convertissez-le en MP3 avant de le renommer.
4. Dans `index.html`, ajoutez les deux lignes suivantes juste avant le commentaire `<!-- Écrans -->`, puis enregistrez.

```html
<script src="js/data/sons-mysteres.js"></script>
<script src="js/games/son-mystere.js"></script>
```

5. Ouvrez `index.html` dans votre navigateur. « Le son mystère » apparaît dans « Écoute et culture ».

Les sons d’origine peuvent être plus longs que les extraits préparés pour le jeu. Les [crédits et durées](CREDITS-SONS.md#sources) donnent les repères de découpe. Gardez les MP3 dans votre copie locale.

| Nom du fichier | Titre sur Mixkit | Lien |
| --- | --- | --- |
| `chien.mp3` | Annoyed big dog barking | [Mixkit](https://mixkit.co/free-sound-effects/dog/#:~:text=Annoyed%20big%20dog%20barking) |
| `chat.mp3` | Domestic cat hungry meow | [Mixkit](https://mixkit.co/free-sound-effects/cat/#:~:text=Domestic%20cat%20hungry%20meow) |
| `coq.mp3` | Rooster crowing in the morning | [Mixkit](https://mixkit.co/free-sound-effects/chicken/#:~:text=Rooster%20crowing%20in%20the%20morning) |
| `oiseaux.mp3` | Little birds singing in the trees | [Mixkit](https://mixkit.co/free-sound-effects/bird/#:~:text=Little%20birds%20singing%20in%20the%20trees) |
| `oies.mp3` | Flock of wild geese | [Mixkit](https://mixkit.co/free-sound-effects/animals/#:~:text=Flock%20of%20wild%20geese) |
| `chouette.mp3` | Owl in a forest | [Mixkit](https://mixkit.co/free-sound-effects/animals/#:~:text=Owl%20in%20a%20forest) |
| `horloge.mp3` | Wall clock tick tock | [Mixkit](https://mixkit.co/free-sound-effects/clock/#:~:text=Wall%20clock%20tick%20tock) |
| `pendule.mp3` | Clock bells hour signal | [Mixkit](https://mixkit.co/free-sound-effects/clock/#:~:text=Clock%20bells%20hour%20signal) |
| `sonnette.mp3` | Home standard ding dong | [Mixkit](https://mixkit.co/free-sound-effects/doorbell/#:~:text=Home%20standard%20ding%20dong) |
| `aspirateur.mp3` | Home vacuum engine hum | [Mixkit](https://mixkit.co/free-sound-effects/appliances/#:~:text=Home%20vacuum%20engine%20hum) |
| `robinet.mp3` | Filling sink with water | [Mixkit](https://mixkit.co/free-sound-effects/water/#:~:text=Filling%20sink%20with%20water) |
| `douche.mp3` | Shower water | [Mixkit](https://mixkit.co/free-sound-effects/bathroom/#:~:text=Shower%20water) |
| `verre-eau.mp3` | Pouring water in a glass | [Mixkit](https://mixkit.co/free-sound-effects/drink/#:~:text=Pouring%20water%20in%20a%20glass) |
| `cle-serrure.mp3` | Door key in door lock | [Mixkit](https://mixkit.co/free-sound-effects/key/#:~:text=Door%20key%20in%20door%20lock) |
| `porte-grince.mp3` | Creaking door open and close | [Mixkit](https://mixkit.co/free-sound-effects/doors/#:~:text=Creaking%20door%20open%20and%20close) |
| `toc-toc.mp3` | Knocking on a thick wooden door | [Mixkit](https://mixkit.co/free-sound-effects/doors/#:~:text=Knocking%20on%20a%20thick%20wooden%20door) |
| `telephone.mp3` | Old telephone ring | [Mixkit](https://mixkit.co/free-sound-effects/phone-ring/#:~:text=Old%20telephone%20ring) |
| `tonalite.mp3` | Telephone dial tone | [Mixkit](https://mixkit.co/free-sound-effects/phone/#:~:text=Telephone%20dial%20tone) |
| `machine-a-ecrire.mp3` | Old typewriter typing | [Mixkit](https://mixkit.co/free-sound-effects/typewriter/#:~:text=Old%20typewriter%20typing) |
| `reveil.mp3` | Morning clock alarm | [Mixkit](https://mixkit.co/free-sound-effects/alarm/#:~:text=Morning%20clock%20alarm) |
| `pluie.mp3` | Heavy rain | [Mixkit](https://mixkit.co/free-sound-effects/rain/#:~:text=Heavy%20rain) |
| `tonnerre.mp3` | Thunder strike in storm | [Mixkit](https://mixkit.co/free-sound-effects/rain/#:~:text=Thunder%20strike%20in%20storm) |
| `vent.mp3` | Wind in the top of the mountain | [Mixkit](https://mixkit.co/free-sound-effects/wind/#:~:text=Wind%20in%20the%20top%20of%20the%20mountain) |
| `vagues.mp3` | Close sea waves loop | [Mixkit](https://mixkit.co/free-sound-effects/waves/#:~:text=Close%20sea%20waves%20loop) |
| `riviere.mp3` | River water flowing | [Mixkit](https://mixkit.co/free-sound-effects/rivers/#:~:text=River%20water%20flowing) |
| `train.mp3` | Passenger train passing by | [Mixkit](https://mixkit.co/free-sound-effects/train/#:~:text=Passenger%20train%20passing%20by) |
| `train-vapeur.mp3` | Steam train passing | [Mixkit](https://mixkit.co/free-sound-effects/train/#:~:text=Steam%20train%20passing) |
| `sonnette-velo.mp3` | Bike bell ring | [Mixkit](https://mixkit.co/free-sound-effects/bike/#:~:text=Bike%20bell%20ring) |
| `voiture.mp3` | Car start ignition | [Mixkit](https://mixkit.co/free-sound-effects/car/#:~:text=Car%20start%20ignition) |
| `klaxon.mp3` | Classic car horn | [Mixkit](https://mixkit.co/free-sound-effects/car-horn/#:~:text=Classic%20car%20horn) |
| `moto.mp3` | Motorcycle starts the ride | [Mixkit](https://mixkit.co/free-sound-effects/motorcycle/#:~:text=Motorcycle%20starts%20the%20ride) |
| `applaudissements.mp3` | Medium size crowd applause | [Mixkit](https://mixkit.co/free-sound-effects/applause/#:~:text=Medium%20size%20crowd%20applause) |
| `cloche.mp3` | Church bell calling | [Mixkit](https://mixkit.co/free-sound-effects/church-bell/#:~:text=Church%20bell%20calling) |
| `couverts.mp3` | Stirring cutlery in ceramic plate | [Mixkit](https://mixkit.co/free-sound-effects/kitchen/#:~:text=Stirring%20cutlery%20in%20ceramic%20plate) |
| `verres.mp3` | Glasses clinking | [Mixkit](https://mixkit.co/free-sound-effects/glass/#:~:text=Glasses%20clinking) |
| `clavier.mp3` | Keyboard typing | [Mixkit](https://mixkit.co/free-sound-effects/keyboard/#:~:text=Keyboard%20typing) |
