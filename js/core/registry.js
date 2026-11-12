/* Registre des jeux et des catégories. Chaque fichier de js/games/ appelle JS.Jeux.register(...). */
window.JS = window.JS || {};

(function () {
  'use strict';

  const CATEGORIES = [
    { id: 'visuelle', nom: 'Mémoire visuelle', icone: '👁️', description: 'Observer, retenir, retrouver.' },
    { id: 'mots', nom: 'Jeux de mots', icone: '📝', description: 'Vocabulaire, orthographe, expressions.' },
    { id: 'logique', nom: 'Logique et calcul', icone: '🧩', description: 'Réfléchir, déduire, compter.' },
    { id: 'auditive', nom: 'Écoute et culture', icone: '🎵', description: 'Sons, souvenirs, culture générale.' }
  ];

  const jeux = [];

  /**
   * Définition attendue :
   * { id, nom, categorie, icone, description, consigne, niveauxMax,
   *   descriptionNiveau(n) (facultatif), start(ctx) → fonction de nettoyage (facultative) }
   */
  function register(def) {
    const manquants = ['id', 'nom', 'categorie', 'icone', 'consigne', 'niveauxMax', 'start'].filter(c => def[c] == null);
    if (manquants.length) {
      console.error('Jeu incomplet', def.id, manquants);
      return;
    }
    if (jeux.some(j => j.id === def.id)) {
      console.error('Jeu déjà enregistré', def.id);
      return;
    }
    jeux.push(def);
  }

  JS.Jeux = {
    CATEGORIES,
    register,
    liste: () => jeux.slice(),
    get: id => jeux.find(j => j.id === id) || null,
    parCategorie: categorie => jeux.filter(j => j.categorie === categorie),
    categorie: id => CATEGORIES.find(c => c.id === id) || null
  };
})();
