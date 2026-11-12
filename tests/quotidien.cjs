const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class E {
 constructor(tag,attrs,...children){this.tag=tag;this.attrs=attrs||{};this.disabled=!!this.attrs.disabled;this.children=children.flat().filter(x=>x!=null);}
 append(...x){this.children.push(...x.flat());} replaceChildren(...x){this.children=x.flat();}
 setAttribute(k,v){this.attrs[k]=v;} focus(){} remove(){} querySelector(){return this.find(e=>e.tag==='button')[0];}
 find(fn){return [this,...this.children.flatMap(c=>c instanceof E?c.find(fn):[])].filter(fn);}
 get text(){return this.children.map(c=>c instanceof E?c.text:c).join('');}
 click(){if(!this.disabled)this.attrs.onclick({currentTarget:this});}
}
const games={};const context={JS:{UI:{el:(...a)=>new E(...a),melanger:a=>a.slice().reverse()},Jeux:{register:g=>games[g.id]=g}}};vm.createContext(context);
for(const f of ['liste-courses','remettre-ordre'])vm.runInContext(fs.readFileSync('js/games/'+f+'.js','utf8'),context);
for(const g of Object.values(games))for(let n=1;n<=g.niveauxMax;n++)for(const correct of [true,false]){
 const root=new E('div');let result,calls=0,suite=null,succes=0;
 g.start({root,niveau:n,actif:()=>!result,message(){},audio:{succes(){succes++;}},terminer:r=>{result=r;calls++;},
  enchainer:fn=>{assert.equal(suite,null,'un seul enchaînement en attente');suite=fn;}});
 const button=t=>root.find(e=>e.tag==='button'&&e.text===t).at(-1);
 // Bonne réponse : enchaînement automatique, sans bouton. Erreur : bouton pour relire, sans enchaînement.
 const continuer=t=>{
  if(correct){assert.equal(button(t),undefined);assert.equal(typeof suite,'function');const fn=suite;suite=null;fn();}
  else{assert.equal(suite,null);button(t).click();}
 };
 for(let tour=0;tour<3;tour++){
  if(g.id==='liste-courses'){
   const answers=root.find(e=>e.tag==='li').map(e=>e.text);
   button('Aller au magasin').click();
   const choices=root.find(e=>e.tag==='button'&&e.attrs['aria-pressed']);
   assert.equal(button('Valider mon panier').disabled,true);
   const picked=correct?choices.filter(e=>answers.includes(e.text)):choices.filter(e=>!answers.includes(e.text)).slice(0,answers.length);
   picked.forEach(b=>b.click());button('Valider mon panier').click();
   continuer(tour===2?'Voir le résultat':'Liste suivante');
  }else{
   const expected=g.logique.generer(n)[tour].etapes;
   const order=correct?expected:expected.slice().reverse();
   button(order[0]).click();button('Annuler le dernier choix').click();
   assert.equal(button(order[0]).disabled,false);
   order.forEach(t=>button(t).click());button('Valider cet ordre').click();
   continuer(tour===2?'Voir le résultat':'Activité suivante');
  }
 }
 assert.equal(calls,1);assert.equal(suite,null);assert.equal(succes,correct?3:0);assert(result.reussite>=0&&result.reussite<=1);
 if(correct)assert.equal(result.reussite,1);else assert(result.reussite<0.8);
}
console.log('OK : 20 parcours complets, tous niveaux, bonnes et mauvaises réponses, annulation, score et fin unique.');
