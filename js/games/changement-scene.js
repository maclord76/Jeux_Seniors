/* Qu'est-ce qui a changé ? — zones contextualisées recollées sur une scène fixe. */
(function () {
  'use strict';
  const { el } = JS.UI;
  const MANCHES = 3;
  const SCENES = [
    {
      nom: 'Cuisine', fond: 'img/scene-cuisine-exemple-v3.png', repertoire: 'changement-cuisine',
      objets: [
        { nom: 'Le fruit', fichier: 'fruit', cadre: [620, 455, 755, 610] },
        { nom: 'La tasse', fichier: 'tasse', cadre: [745, 425, 915, 565] },
        { nom: 'L’assiette', fichier: 'assiette', cadre: [355, 465, 635, 610] },
        { nom: 'Le torchon', fichier: 'torchon', cadre: [900, 325, 1185, 630] },
        { nom: 'L’arrosoir', fichier: 'arrosoir', cadre: [1250, 585, 1536, 835] }
      ]
    },
    {
      nom: 'Salon de lecture', fond: 'img/changement-salon/reference.png', repertoire: 'changement-salon',
      objets: [
        { nom: 'Le coussin', fichier: 'coussin', cadre: [30, 450, 310, 700] },
        { nom: 'Le livre', fichier: 'livre', cadre: [455, 665, 705, 810] },
        { nom: 'La théière', fichier: 'theiere', cadre: [785, 610, 1015, 830] },
        { nom: 'Le vase', fichier: 'vase', cadre: [1285, 325, 1515, 595] },
        { nom: 'L’horloge', fichier: 'horloge', cadre: [895, 25, 1145, 260] }
      ]
    },
    {
      nom: 'Véranda', fond: 'img/changement-veranda/reference.png', repertoire: 'changement-veranda',
      objets: [
        { nom: 'Les bottes', fichier: 'bottes', cadre: [30, 670, 290, 965] },
        { nom: 'Le pot de lavande', fichier: 'lavande', cadre: [260, 220, 490, 520] },
        { nom: 'L’arrosoir', fichier: 'arrosoir', cadre: [620, 640, 960, 930] },
        { nom: 'Le chapeau', fichier: 'chapeau', cadre: [940, 340, 1180, 575] },
        { nom: 'Le nichoir', fichier: 'nichoir', cadre: [1350, 40, 1520, 245] }
      ]
    },
    {
      nom: 'Chambre de campagne', fond: 'img/changement-chambre/reference.png', repertoire: 'changement-chambre',
      objets: [
        { nom: 'La lampe', fichier: 'lampe', cadre: [285, 290, 470, 540] },
        { nom: 'Le tableau', fichier: 'tableau', cadre: [580, 75, 1015, 355] },
        { nom: 'Le plaid', fichier: 'plaid', cadre: [470, 555, 1070, 750] },
        { nom: 'Le réveil', fichier: 'reveil', cadre: [1090, 410, 1220, 550] },
        { nom: 'Les chaussons', fichier: 'chaussons', cadre: [1250, 805, 1510, 975] }
      ]
    },
    {
      nom: 'Salle de bain', fond: 'img/changement-salle-bain/reference.png', repertoire: 'changement-salle-bain',
      objets: [
        { nom: 'La serviette au mur', fichier: 'serviette', cadre: [0, 155, 245, 650] },
        { nom: 'Le miroir', fichier: 'miroir', cadre: [285, 60, 600, 420] },
        { nom: 'Le distributeur de savon', fichier: 'savon', cadre: [525, 400, 655, 540] },
        { nom: 'Le tapis de bain', fichier: 'tapis', cadre: [475, 790, 1120, 1000] },
        { nom: 'La fougère', fichier: 'fougere', cadre: [1240, 300, 1536, 570] }
      ]
    }
  ];
  const VARIANTES = 5;
  const LARGEUR = 1536;
  const HAUTEUR = 1024;
  // Durée du fondu enchaîné entre la scène observée et la scène modifiée.
  const FONDU = 1600;
  const CSS = `
    .changement-scene { position: relative; width: 100%; max-width: 54rem; aspect-ratio: 3 / 2;
      background-position: center; background-size: 100% 100%; background-repeat: no-repeat;
      border: 3px solid var(--primaire); border-radius: var(--rayon); overflow: hidden; }
    .changement-objet { position: absolute; background-size: 100% 100%; background-repeat: no-repeat;
      pointer-events: none; }
    .changement-objet.fondu-entrant { animation: changement-fondu-entree ${FONDU}ms ease-in-out both; }
    .changement-objet.fondu-sortant { animation: changement-fondu-sortie ${FONDU}ms ease-in-out both; }
    @keyframes changement-fondu-entree { from { opacity: 0; } to { opacity: 1; } }
    @keyframes changement-fondu-sortie { from { opacity: 1; } to { opacity: 0; } }
    .changement-choix { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem; max-width: 54rem; }
    .changement-choix .btn[aria-pressed="true"] { background: var(--primaire); color: var(--sur-primaire); }
    .changement-choix .btn { min-height: 3.5rem; }
    .changement-consigne { max-width: 54rem; text-align: center; }
  `;
  function injecterStyle() {
    if (document.getElementById('style-changement-scene')) return;
    document.head.append(el('style', { id: 'style-changement-scene' }, CSS));
  }
  function creerManche(niveau, numero, scene) {
    const changeables = JS.UI.melanger(scene.objets);
    const changements = changeables.slice(0, niveau).map(o => scene.objets.indexOf(o));
    const initial = scene.objets.map(() => Math.floor(Math.random() * VARIANTES));
    const apres = initial.map((variante, i) => changements.includes(i)
      ? (variante + 1 + Math.floor(Math.random() * (VARIANTES - 1))) % VARIANTES : variante);
    return { numero, scene, changements, initial, apres, choix: new Set(), phase: 'observation' };
  }
  JS.Jeux.register({
    id: 'quest-ce-qui-a-change',
    nom: 'Qu’est-ce qui a changé ?',
    categorie: 'visuelle',
    icone: '🖼️',
    description: 'Observez une scène, puis retrouvez les objets qui ont changé.',
    consigne: 'Observez bien la scène, sans vous presser. Appuyez sur « J’ai bien regardé » quand vous êtes prêt : la jauge du bouton montre le temps qu’il reste avant que la scène change d’elle-même. Sélectionnez ensuite les objets qui ont changé, puis validez. Vous pouvez retirer un choix avant de valider. Trois scènes par partie.',
    niveauxMax: 4,
    descriptionNiveau: n => n + (n === 1 ? ' objet change' : ' objets changent') + ' dans la scène',
    start(ctx) {
      injecterStyle();
      const zone = el('div', { class: 'zone-jeu' });
      const compteur = el('p', { class: 'compteur', 'aria-live': 'polite' });
      const instruction = el('p', { class: 'changement-consigne' });
      const scene = el('div', { class: 'changement-scene', role: 'img' });
      const actions = el('div', { class: 'ligne-boutons centre' });
      const choix = el('div', { class: 'changement-choix', role: 'group', 'aria-label': 'Objets qui ont changé' });
      zone.append(compteur, instruction, scene, choix, actions);
      ctx.root.append(zone);
      let manche = 0;
      let total = 0;
      let terminee = false;
      let tour;
      const autresScenes = JS.UI.melanger(SCENES.slice(0, -1)).slice(0, MANCHES - 1);
      const decors = JS.UI.melanger([SCENES[SCENES.length - 1], ...autresScenes]);
      const urlObjet = (objet, variante) => 'img/' + tour.scene.repertoire + '/' + objet.fichier + '-' + variante + '.png';
      const sansAnimation = () => typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches;
      function zoneObjet(objet, variante, classe) {
        const [x0, y0, x1, y1] = objet.cadre;
        return el('span', {
          class: 'changement-objet' + (classe ? ' ' + classe : ''), 'aria-hidden': 'true',
          style: 'left:' + (x0 / LARGEUR * 100) + '%;top:' + (y0 / HAUTEUR * 100) +
            '%;width:' + ((x1 - x0) / LARGEUR * 100) + '%;height:' +
            ((y1 - y0) / HAUTEUR * 100) + '%;background-image:url("' + urlObjet(objet, variante) + '")'
        });
      }
      function afficherScene(modifiee) {
        scene.setAttribute('style', 'background-image:url("' + tour.scene.fond + '")');
        const fondu = modifiee && !sansAnimation() && typeof ctx.plusTard === 'function';
        // Fondu enchaîné : seuls les objets modifiés s'estompent pendant que leur nouvelle version
        // apparaît par-dessus ; les objets inchangés restent fixes (pas de clignotement).
        const sortants = fondu ? tour.changements.map(i => zoneObjet(tour.scene.objets[i], tour.initial[i], 'fondu-sortant')) : [];
        scene.replaceChildren(...sortants, ...tour.scene.objets.map((objet, i) => zoneObjet(objet,
          modifiee ? tour.apres[i] : tour.initial[i],
          fondu && tour.changements.includes(i) ? 'fondu-entrant' : '')));
        if (sortants.length) {
          ctx.plusTard(() => sortants.forEach(s => { if (s.parentNode === scene) s.remove(); }), FONDU + 100);
        }
        scene.setAttribute('aria-label', modifiee
          ? tour.scene.nom + ' après les changements. Comparez avec la scène observée.'
          : tour.scene.nom + ' à observer : ' + tour.scene.objets.map(o => o.nom.toLowerCase()).join(', ') + '.');
      }
      function nouvelleManche() {
        if (terminee || !ctx.actif()) return;
        manche++;
        tour = creerManche(ctx.niveau, manche, decors[manche - 1]);
        compteur.textContent = 'Scène ' + manche + ' sur ' + MANCHES;
        instruction.textContent = 'Observez ' + tour.scene.nom.toLowerCase() + '. Retenez les objets et leur aspect.';
        choix.replaceChildren();
        afficherScene(false);
        // Précharge les nouvelles versions pour que le fondu ne démarre pas sur une image vide.
        if (typeof Image === 'function') {
          tour.changements.forEach(i => { new Image().src = urlObjet(tour.scene.objets[i], tour.apres[i]); });
        }
        const ceTour = tour;
        const passerALaQuestion = () => {
          if (tour !== ceTour || tour.phase !== 'observation' || !ctx.actif()) return;
          tour.phase = 'question';
          afficherScene(true);
          instruction.textContent = 'Qu’est-ce qui a changé ? Choisissez ' + ctx.niveau +
            (ctx.niveau === 1 ? ' objet.' : ' objets.');
          const valider = el('button', { class: 'btn btn-primaire btn-grand', disabled: true, onclick: () => {
            if (tour.phase !== 'question' || tour.choix.size !== ctx.niveau || !ctx.actif()) return;
            tour.phase = 'resultat';
            const justes = tour.changements.filter(i => tour.choix.has(i)).length;
            total += Math.max(0, (2 * justes - ctx.niveau) / ctx.niveau);
            choix.querySelectorAll('button').forEach(b => { b.disabled = true; });
            const noms = tour.changements.map(i => tour.scene.objets[i].nom.toLowerCase()).join(', ');
            instruction.textContent = (justes === ctx.niveau ? 'Bravo, vous avez tout retrouvé ! ' :
              'Les objets modifiés étaient : ') + noms + '.';
            ctx.message(justes === ctx.niveau ? 'Bravo, vous avez tout retrouvé !' : 'Voici les changements. Prenez le temps de les observer.',
              justes === ctx.niveau ? 'succes' : 'info');
            const continuer = () => {
              if (tour.phase !== 'resultat' || !ctx.actif()) return;
              tour.phase = 'terminee';
              if (manche < MANCHES) nouvelleManche();
              else {
                terminee = true;
                ctx.terminer({ reussite: total / MANCHES,
                  score: Math.round(total / MANCHES * 100 * ctx.niveau),
                  details: MANCHES + ' scènes observées, ' + ctx.niveau +
                    (ctx.niveau === 1 ? ' changement' : ' changements') + ' par scène.' });
              }
            };
            // Tout retrouvé : on enchaîne seul. Sinon, on laisse observer les changements à son rythme.
            if (justes === ctx.niveau) {
              ctx.audio.succes();
              actions.replaceChildren();
              ctx.enchainer(continuer);
              return;
            }
            const suite = el('button', { class: 'btn btn-primaire btn-grand', onclick: continuer },
              manche < MANCHES ? 'Scène suivante ▶' : 'Voir le résultat ▶');
            actions.replaceChildren(suite);
            suite.focus();
          } }, 'Valider mes choix');
          choix.replaceChildren(...tour.scene.objets.map((objet, i) => el('button', {
            class: 'btn', 'aria-pressed': 'false', onclick(e) {
              if (tour.phase !== 'question') return;
              if (tour.choix.has(i)) tour.choix.delete(i);
              else if (tour.choix.size < ctx.niveau) tour.choix.add(i);
              else { ctx.message('Retirez un choix avant d’en sélectionner un autre.', 'info'); return; }
              e.currentTarget.setAttribute('aria-pressed', String(tour.choix.has(i)));
              valider.disabled = tour.choix.size !== ctx.niveau;
            }
          }, objet.nom)));
          actions.replaceChildren(valider);
          ctx.message('La scène a changé. Retrouvez les objets modifiés, sans vous presser.', 'info');
          choix.querySelector('button').focus();
        };
        // Passage automatique après un temps généreux ; la jauge du bouton montre le temps restant.
        const duree = 6000 + 2000 * tour.scene.objets.length;
        const pret = JS.UI.boutonJauge('👍 J’ai bien regardé', duree, passerALaQuestion);
        actions.replaceChildren(pret);
        ctx.message('Observez bien la scène. Prenez votre temps.', 'info');
        pret.focus();
        ctx.plusTard(passerALaQuestion, duree);
      }
      nouvelleManche();
      return () => { terminee = true; };
    }
  });
})();
