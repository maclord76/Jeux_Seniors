const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
let saved;
const ctx = {window: {}, document: {documentElement: {dataset:{}}}, localStorage: {getItem: () => saved, setItem: (_, value) => {saved=value;}}};
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['storage', 'themes']) vm.runInContext(fs.readFileSync('js/core/'+f+'.js','utf8'),ctx);
const s=ctx.JS.Stockage;
s.charger(); const a=s.creerProfil('A','🙂');
assert.equal(a.reglages.theme,'classique');
s.modifierReglages({theme:'1970'}); s.charger();
assert.equal(s.reglages().theme,'1970');
const b=s.creerProfil('B','🙂'); assert.equal(b.reglages.theme,'classique');
s.choisirProfil(a.id); assert.equal(s.reglages().theme,'1970');
const data=s.exporter([a.id]);
assert.equal(s.lireSauvegarde(JSON.stringify(data))[0].reglages.theme,'1970');
data.profils[0].reglages.theme='inconnu';
assert.equal(s.lireSauvegarde(JSON.stringify(data))[0].reglages.theme,'classique');
delete data.profils[0].reglages.theme;
assert.equal(s.lireSauvegarde(JSON.stringify(data))[0].reglages.theme,'classique');
for (const id of ['classique','1950','1960','1970','1980','1990']) {
 ctx.JS.Themes.appliquer(id); assert.equal(ctx.document.documentElement.dataset.theme,id);
}
s.deconnecter(); assert.equal(s.reglages().theme,'classique');
console.log('OK : profils, persistance, export/import, ancienne sauvegarde, thème inconnu et déconnexion.');
