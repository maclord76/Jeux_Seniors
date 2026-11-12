/* Cliquer les étapes dans l'ordre : aucune manipulation par glisser-déposer. */
(function () {
  'use strict';
  const {el,melanger}=JS.UI;
  const SCENARIOS=[
    {titre:'Poster une carte',etapes:['Écrire un message sur la carte','Glisser la carte dans une enveloppe','Fermer l’enveloppe','Écrire l’adresse sur l’enveloppe fermée','Coller un timbre sur l’enveloppe adressée','Déposer l’enveloppe affranchie dans une boîte aux lettres']},
    {titre:'Faire pousser des radis',etapes:['Préparer la terre pour les graines','Semer les graines dans la terre préparée','Recouvrir les graines semées de terre fine','Arroser doucement le semis recouvert','Laisser pousser les radis en les entretenant','Récolter les radis lorsqu’ils sont prêts']},
    {titre:'Faire un puzzle',etapes:['Choisir une boîte de puzzle fermée','Ouvrir la boîte choisie','Sortir les pièces de la boîte ouverte','Assembler les pièces sorties','Admirer le puzzle terminé','Ranger les pièces après avoir admiré le puzzle']},
    {titre:'Laver du linge en machine',etapes:['Trier le linge sale','Mettre le linge trié dans le tambour vide','Fermer le tambour rempli et ajouter la lessive dans le bac','Lancer le programme adapté au linge','Sortir le linge lorsque le programme est terminé','Étendre le linge sorti de la machine']},
    {titre:'Lire un livre emprunté',etapes:['Choisir un livre à la bibliothèque','Emprunter le livre choisi','Emporter le livre emprunté chez soi','Commencer la lecture à la maison','Terminer la lecture du livre','Rapporter le livre lu à la bibliothèque']},
    {titre:'Préparer une tartine de confiture',etapes:['Prendre un pain entier','Couper une tranche dans le pain','Poser la tranche coupée sur une assiette','Étaler de la confiture sur la tranche posée','Manger la tartine préparée','Laver l’assiette après avoir mangé']},
    {titre:'Encadrer une photo',etapes:['Choisir une photo à encadrer','Choisir un cadre adapté à cette photo','Ouvrir le dos du cadre choisi','Placer la photo dans le cadre ouvert','Refermer le dos du cadre contenant la photo','Poser le cadre refermé sur un meuble']},
    {titre:'Faire un dessin',etapes:['Prendre une feuille vierge','Tracer les contours du dessin sur la feuille','Colorier les formes tracées','Signer le dessin colorié','Placer le dessin signé dans une pochette','Ranger la pochette contenant le dessin']}
  ];
  function generer(n){return melanger(SCENARIOS).slice(0,3).map(s=>({titre:s.titre,etapes:s.etapes.slice(0,n+2)}));}
  JS.Jeux.register({
    id:'remettre-ordre',nom:'Remettre dans l’ordre',categorie:'logique',icone:'📋',
    description:'Replacez les étapes d’une activité quotidienne dans le bon ordre.',
    consigne:'Touchez les étapes dans l’ordre où elles se déroulent. Elles apparaissent dans une liste numérotée. Vous pouvez annuler le dernier choix ou recommencer avant de valider. Après validation, découvrez l’ordre attendu. Trois activités par partie, sans limite de temps.',
    niveauxMax:4,descriptionNiveau:n=>(n+2)+' étapes par activité',logique:{generer,SCENARIOS},
    start(ctx){
      const tours=generer(ctx.niveau);let numero=0,points=0,termine=false;
      const zone=el('div',{class:'quotidien-jeu'});ctx.root.append(zone);
      function afficher(){
        if(termine || !ctx.actif())return;
        if(numero===tours.length){termine=true;ctx.terminer({reussite:points/3,score:Math.round(points/3*100*ctx.niveau),details:'Trois activités complétées. Réussite calculée sur les étapes placées à la bonne position.'});return;}
        const tour=tours[numero],selection=[];
        let valide=false,propositions=melanger(tour.etapes);
        if(propositions.every((s,i)=>s===tour.etapes[i]))propositions.push(propositions.shift());
        const liste=el('ol',{class:'ordre-liste','aria-label':'Votre ordre'});
        const boutons=propositions.map(texte=>el('button',{class:'btn btn-choix',onclick:()=>{if(valide||selection.includes(texte))return;selection.push(texte);maj();}},texte));
        const annuler=el('button',{class:'btn',onclick:()=>{selection.pop();maj();}},'Annuler le dernier choix');
        const reset=el('button',{class:'btn',onclick:()=>{selection.length=0;maj();}},'Recommencer cet ordre');
        const verifier=el('button',{class:'btn btn-primaire',onclick:bilan},'Valider cet ordre');
        const actions=el('div',{class:'ligne-boutons'},annuler,reset,verifier);
        function maj(){
          liste.replaceChildren(...selection.map(s=>el('li',null,s)));
          boutons.forEach((b,i)=>{b.disabled=selection.includes(propositions[i]);});
          annuler.disabled=reset.disabled=selection.length===0;verifier.disabled=selection.length!==tour.etapes.length;
          ctx.message(selection.length+' étape(s) placée(s) sur '+tour.etapes.length+'.','info');
          (selection.length===tour.etapes.length?verifier:boutons.find(b=>!b.disabled)).focus();
        }
        function bilan(){
          if(valide||selection.length!==tour.etapes.length)return;valide=true;
          const bons=selection.filter((s,i)=>s===tour.etapes[i]).length;points+=bons/tour.etapes.length;
          boutons.forEach(b=>{b.disabled=true;});actions.replaceChildren();
          ctx.message(bons===tour.etapes.length?'Bravo, toutes les étapes sont dans l’ordre !':'Vous avez placé '+bons+' étape(s) au bon endroit. Regardons ensemble l’ordre attendu.',bons===tour.etapes.length?'succes':'info');
          // Tout est dans l'ordre : on enchaîne seul. Sinon, on montre l'ordre attendu avec un bouton.
          if(bons===tour.etapes.length){ctx.audio.succes();ctx.enchainer(()=>{numero++;afficher();});return;}
          const suite=el('button',{class:'btn btn-primaire',onclick:()=>{suite.disabled=true;numero++;afficher();}},numero===2?'Voir le résultat':'Activité suivante');
          zone.append(el('h3',null,'L’ordre attendu'),el('ol',{class:'ordre-liste'},tour.etapes.map(s=>el('li',null,s))),suite);suite.focus();
        }
        zone.replaceChildren(el('h2',null,'Activité '+(numero+1)+' sur 3 : '+tour.titre),el('p',null,'Choisissez d’abord la première étape, puis les suivantes.'),el('div',{class:'choix ordre-choix'},boutons),liste,actions);maj();
      }
      afficher();
    }
  });
})();
