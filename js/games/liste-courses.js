/* Mémoriser une liste, puis remplir son panier sans limite de temps. */
(function () {
  'use strict';
  const { el, melanger } = JS.UI;
  const PRODUITS = [['🍎','Pommes'],['🍌','Bananes'],['🍐','Poires'],['🥕','Carottes'],['🥔','Pommes de terre'],['🍅','Tomates'],['🥬','Salade'],['🍞','Pain'],['🧀','Fromage'],['🥚','Œufs'],['🥛','Lait'],['🧈','Beurre'],['🍚','Riz'],['🍝','Pâtes'],['☕','Café'],['🍯','Miel'],['🧼','Savon'],['🧻','Papier toilette']];
  const NIVEAUX = [[3,6],[4,8],[5,10],[6,12],[7,14],[8,16]];
  function generer(n) {
    const [nombre, choix] = NIVEAUX[n-1];
    const produits = melanger(PRODUITS).slice(0,choix);
    return { liste: produits.slice(0,nombre), choix: melanger(produits) };
  }
  JS.Jeux.register({
    id:'liste-courses', nom:'La liste de courses', categorie:'visuelle', icone:'🛒',
    description:'Retenez votre liste, puis retrouvez les produits dans les rayons.',
    consigne:'Prenez tout le temps nécessaire pour mémoriser la liste. Appuyez sur « Aller au magasin », puis choisissez les produits à acheter. Touchez à nouveau un produit pour le retirer. Validez lorsque votre panier est prêt. Trois listes par partie, sans limite de temps.',
    niveauxMax:NIVEAUX.length,
    descriptionNiveau:n => NIVEAUX[n-1][0]+' produits à retenir parmi '+NIVEAUX[n-1][1]+' propositions',
    logique:{generer,NIVEAUX},
    start(ctx) {
      let manche=0, points=0, termine=false;
      const zone=el('div',{class:'quotidien-jeu'}); ctx.root.append(zone);
      function suivante() {
        if(termine || !ctx.actif()) return;
        if(manche===3) {
          termine=true;
          ctx.terminer({reussite:points/3,score:Math.round(points/3*100*ctx.niveau),details:'Trois listes de courses complétées. Réussite calculée sur les produits correctement retrouvés.'}); return;
        }
        manche++;
        const tour=generer(ctx.niveau), panier=new Set();
        let valide=false;
        zone.replaceChildren(el('h2',null,'Liste '+manche+' sur 3'),
          el('p',null,'Mémorisez ces '+tour.liste.length+' produits, à votre rythme.'),
          el('ul',{class:'courses-liste'},tour.liste.map(p=>el('li',null,p.join(' ')))),
          el('button',{class:'btn btn-primaire',onclick:magasin},'Aller au magasin'));
        ctx.message('Prenez votre temps : la liste reste visible jusqu’à votre départ.','info');
        zone.querySelector('button').focus();
        function magasin() {
          if(valide) return;
          const compteur=el('p',{'aria-live':'polite'});
          const valider=el('button',{class:'btn btn-primaire',disabled:true,onclick:bilan},'Valider mon panier');
          const boutons=tour.choix.map(p=>el('button',{class:'btn btn-choix courses-produit','aria-label':p.join(' '),'aria-pressed':'false',onclick:e=>{
            if(valide) return;
            if(panier.has(p)) panier.delete(p);
            else if(panier.size<tour.liste.length) panier.add(p);
            else {ctx.message('Votre panier est plein. Retirez un produit avant d’en choisir un autre.','info');return;}
            e.currentTarget.setAttribute('aria-pressed',String(panier.has(p)));
            e.currentTarget.replaceChildren(p.join(' '), panier.has(p) ? el('span',{class:'courses-selection'},'✓ Dans le panier') : null);
            maj();
          }},p.join(' ')));
          function maj(){compteur.textContent=panier.size+' produit(s) dans le panier sur '+tour.liste.length;valider.disabled=panier.size!==tour.liste.length;}
          const actions=el('div',{class:'ligne-boutons centre courses-actions'},valider);
          zone.replaceChildren(el('h2',null,'Au magasin — liste '+manche+' sur 3'),compteur,el('div',{class:'choix',role:'group','aria-label':'Produits du magasin'},boutons),actions);
          maj();ctx.message('Retrouvez les produits de votre liste. Vous pouvez modifier votre panier avant de valider.','info');boutons[0].focus();
          function bilan(){
            if(valide || panier.size!==tour.liste.length) return; valide=true;
            const bons=tour.liste.filter(p=>panier.has(p)).length;points+=bons/tour.liste.length;
            boutons.forEach((b,i)=>{b.disabled=true;const attendu=tour.liste.includes(tour.choix[i]);b.append(attendu?' — ✓ Sur la liste':panier.has(tour.choix[i])?' — À laisser au magasin':'');});
            actions.remove();
            ctx.message(bons===tour.liste.length?'Bravo, votre panier est complet !':bons+' produit(s) retrouvé(s) sur '+tour.liste.length+'. Voici la liste pour vous aider à la retenir.',bons===tour.liste.length?'succes':'info');
            // Panier complet : on enchaîne seul. Sinon, bouton pour relire la liste à son rythme.
            if(bons===tour.liste.length){ctx.audio.succes();ctx.enchainer(suivante);return;}
            const suite=el('button',{class:'btn btn-primaire',onclick:()=>{suite.disabled=true;suivante();}},manche===3?'Voir le résultat':'Liste suivante');
            zone.append(el('p',null,'La liste : '+tour.liste.map(p=>p.join(' ')).join(', ')),suite);suite.focus();
          }
        }
      }
      suivante();
    }
  });
})();
