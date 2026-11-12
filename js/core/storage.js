/* Stockage local des profils et de leur progression (localStorage, versionné). */
window.JS = window.JS || {};

(function () {
  'use strict';

  const CLE = 'jeuxSeniors';
  const VERSION = 1;
  const FORMAT_EXPORT = 'jeux-seniors-sauvegarde';

  const REGLAGES_DEFAUT = {
    taille: 1,          // 1 = normal, 2 = grand, 3 = très grand
    contraste: false,   // thème contraste élevé
    sons: true,
    voix: false,        // lecture automatique des consignes
    chrono: false,      // afficher le temps écoulé pendant les parties
    objectifJour: 3,    // nombre de parties visé chaque jour
    visuels: 'emojis',  // 'emojis' ou 'photos' (dans les jeux qui ont des photos)
    theme: 'classique' // décor et palette, indépendants des images dans les jeux
  };

  let etat = null;
  let disponible = true;

  function etatVide() {
    return { version: VERSION, profilActif: null, profils: [] };
  }

  function normaliserProfil(p) {
    p.reglages = Object.assign({}, REGLAGES_DEFAUT, p.reglages);
    p.reglages.theme = JS.Themes.obtenir(p.reglages.theme).id;
    p.jeux = p.jeux || {};
    p.parties = Array.isArray(p.parties) ? p.parties : [];
    p.badges = Array.isArray(p.badges) ? p.badges : [];
    p.serie = p.serie || { actuelle: 0, meilleure: 0, dernierJour: null };
    p.totalParties = p.totalParties || p.parties.length;
    p.avatar = p.avatar || '🙂';
    p.anneeNaissance = Number.isInteger(p.anneeNaissance) ? p.anneeNaissance : null;
    return p;
  }

  function migrer(donnees) {
    if (!donnees || !Array.isArray(donnees.profils)) return etatVide();
    // Version 1 : aucune migration nécessaire pour l'instant.
    donnees.profils.forEach(normaliserProfil);
    donnees.version = VERSION;
    if (!donnees.profils.some(p => p.id === donnees.profilActif)) donnees.profilActif = null;
    return donnees;
  }

  function charger() {
    try {
      const texte = localStorage.getItem(CLE);
      etat = texte ? migrer(JSON.parse(texte)) : etatVide();
    } catch (e) {
      disponible = false;
      etat = etatVide();
    }
    return etat;
  }

  function sauver() {
    if (!disponible) return;
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch (e) {
      disponible = false;
      const bandeau = document.getElementById('bandeau-stockage');
      if (bandeau) bandeau.hidden = false;
    }
  }

  function nouvelId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function prenomUnique(prenom, ignorerId) {
    let candidat = prenom;
    let n = 2;
    while (etat.profils.some(p => p.id !== ignorerId && p.prenom.toLowerCase() === candidat.toLowerCase())) {
      candidat = prenom + ' (' + n++ + ')';
    }
    return candidat;
  }

  function creerProfil(prenom, avatar, anneeNaissance) {
    const profil = normaliserProfil({
      id: nouvelId(),
      prenom: prenomUnique(prenom.trim() || 'Joueur'),
      avatar: avatar,
      anneeNaissance: anneeNaissance || null,
      creeLe: Date.now()
    });
    etat.profils.push(profil);
    etat.profilActif = profil.id;
    sauver();
    return profil;
  }

  function modifierProfil(id, changements) {
    const p = trouver(id);
    if (!p) return null;
    if (changements.prenom != null) p.prenom = prenomUnique(changements.prenom.trim() || p.prenom, id);
    if (changements.avatar) p.avatar = changements.avatar;
    if (changements.anneeNaissance !== undefined) p.anneeNaissance = changements.anneeNaissance || null;
    sauver();
    return p;
  }

  function supprimerProfil(id) {
    etat.profils = etat.profils.filter(p => p.id !== id);
    if (etat.profilActif === id) etat.profilActif = null;
    sauver();
  }

  function trouver(id) {
    return etat.profils.find(p => p.id === id) || null;
  }

  function choisirProfil(id) {
    etat.profilActif = trouver(id) ? id : null;
    sauver();
  }

  function deconnecter() {
    etat.profilActif = null;
    sauver();
  }

  function profilActif() {
    return etat && etat.profilActif ? trouver(etat.profilActif) : null;
  }

  function reglages() {
    const p = profilActif();
    return p ? p.reglages : Object.assign({}, REGLAGES_DEFAUT);
  }

  function modifierReglages(changements) {
    const p = profilActif();
    if (!p) return;
    Object.assign(p.reglages, changements);
    sauver();
  }

  /* ---------- Export / import ---------- */

  function exporter(ids) {
    const profils = etat.profils.filter(p => !ids || ids.includes(p.id));
    return {
      format: FORMAT_EXPORT,
      version: VERSION,
      exporteLe: new Date().toISOString(),
      profils: JSON.parse(JSON.stringify(profils))
    };
  }

  function telecharger(objet, nomFichier) {
    const blob = new Blob([JSON.stringify(objet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Renvoie la liste des profils valides d'un fichier de sauvegarde, ou lève une erreur lisible. */
  function lireSauvegarde(texte) {
    let donnees;
    try {
      donnees = JSON.parse(texte);
    } catch (e) {
      throw new Error("Ce fichier n'est pas une sauvegarde lisible.");
    }
    if (!donnees || donnees.format !== FORMAT_EXPORT || !Array.isArray(donnees.profils)) {
      throw new Error("Ce fichier n'est pas une sauvegarde de Jeux de mémoire.");
    }
    if (donnees.version > VERSION) {
      throw new Error('Cette sauvegarde vient d\'une version plus récente du site.');
    }
    const profils = donnees.profils.filter(p => p && typeof p.prenom === 'string');
    if (!profils.length) throw new Error('Aucun joueur trouvé dans ce fichier.');
    return profils.map(p => normaliserProfil(JSON.parse(JSON.stringify(p))));
  }

  /** mode : 'ajouter' (nouveau profil) ou 'remplacer' (écrase le profil idCible). */
  function importerProfil(profil, mode, idCible) {
    if (mode === 'remplacer' && trouver(idCible)) {
      profil.id = idCible;
      profil.prenom = prenomUnique(profil.prenom, idCible);
      etat.profils = etat.profils.map(p => (p.id === idCible ? profil : p));
    } else {
      profil.id = nouvelId();
      profil.prenom = prenomUnique(profil.prenom);
      etat.profils.push(profil);
    }
    sauver();
    return profil;
  }

  JS.Stockage = {
    REGLAGES_DEFAUT,
    charger,
    sauver,
    estDisponible: () => disponible,
    profils: () => etat.profils,
    trouver,
    creerProfil,
    modifierProfil,
    supprimerProfil,
    choisirProfil,
    deconnecter,
    profilActif,
    reglages,
    modifierReglages,
    exporter,
    telecharger,
    lireSauvegarde,
    importerProfil
  };
})();
