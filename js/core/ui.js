/* Outils d'interface : création d'éléments, routeur par hash, fenêtres modales, utilitaires. */
window.JS = window.JS || {};

(function () {
  'use strict';

  /**
   * Crée un élément DOM.
   * el('button', { class: 'btn', onclick: fn, disabled: true }, 'Texte', autreNoeud)
   */
  function el(tag, attributs, ...enfants) {
    const noeud = document.createElement(tag);
    if (attributs) {
      for (const [cle, valeur] of Object.entries(attributs)) {
        if (valeur == null || valeur === false) continue;
        if (cle === 'class') noeud.className = valeur;
        else if (cle === 'style' && typeof valeur === 'object') {
          // Les variables CSS (--nom) exigent setProperty.
          for (const [prop, v] of Object.entries(valeur)) {
            if (prop.startsWith('--')) noeud.style.setProperty(prop, v);
            else noeud.style[prop] = v;
          }
        }
        else if (cle === 'dataset') Object.assign(noeud.dataset, valeur);
        else if (cle === 'html') noeud.innerHTML = valeur;
        else if (cle.startsWith('on') && typeof valeur === 'function') noeud.addEventListener(cle.slice(2).toLowerCase(), valeur);
        else if (cle === 'value') noeud.value = valeur;
        else noeud.setAttribute(cle, valeur === true ? '' : valeur);
      }
    }
    enfants.flat(Infinity).forEach(enfant => {
      if (enfant == null || enfant === false) return;
      noeud.append(enfant instanceof Node ? enfant : document.createTextNode(String(enfant)));
    });
    return noeud;
  }

  /* ---------- Routeur ---------- */

  const ecrans = {};
  let nettoyage = null;

  /** Déclare un écran. rendu(racine, parametres) peut renvoyer une fonction de nettoyage. */
  function ecran(nom, rendu) {
    ecrans[nom] = rendu;
  }

  function naviguer(chemin) {
    const cible = '#/' + chemin;
    if (location.hash === cible) rendre();
    else location.hash = cible;
  }

  function rendre() {
    if (nettoyage) {
      try { nettoyage(); } catch (e) { console.error(e); }
      nettoyage = null;
    }
    JS.Audio.taire();
    fermerModale();
    appliquerReglages(JS.Stockage.reglages());

    const morceaux = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    let nom = morceaux[0] || 'accueil';
    if (!JS.Stockage.profilActif() && nom !== 'profils') nom = 'profils';
    if (!ecrans[nom]) nom = 'accueil';

    majEntete(nom);
    titreEntete(null);
    const racine = document.getElementById('app');
    racine.innerHTML = '';
    racine.className = 'ecran-' + nom;
    const resultat = ecrans[nom](racine, morceaux.slice(1));
    if (typeof resultat === 'function') nettoyage = resultat;
    window.scrollTo(0, 0);
    racine.focus({ preventScroll: true });
  }

  /** Taille du texte, contraste et sons du joueur courant. */
  function appliquerReglages(reglages) {
    const racineHtml = document.documentElement;
    racineHtml.dataset.taille = String(reglages.taille || 1);
    if (reglages.contraste) racineHtml.dataset.contraste = 'eleve';
    else delete racineHtml.dataset.contraste;
    JS.Audio.configurer(reglages);
    JS.Themes.appliquer(reglages.theme);
  }

  function majEntete(nom) {
    document.querySelectorAll('.navigation a').forEach(a => {
      if (a.dataset.route === nom) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const p = JS.Stockage.profilActif();
    const zone = document.getElementById('profil-courant');
    const nav = document.querySelector('.navigation');
    nav.hidden = !p;
    zone.hidden = !p;
    if (p) {
      zone.innerHTML = '';
      zone.append(el('span', { class: 'avatar-mini', 'aria-hidden': 'true' }, p.avatar), el('span', null, p.prenom));
    }
  }

  /**
   * Titre affiché dans l'en-tête, à côté du logo (ex. nom du jeu en cours).
   * contenu : texte, nœud(s) ; null pour le retirer. Remis à zéro à chaque changement d'écran.
   */
  function titreEntete(contenu) {
    const titre = document.getElementById('titre-entete');
    if (!titre) return;
    titre.innerHTML = '';
    const visible = contenu != null && contenu !== '';
    if (visible) titre.append(...[contenu].flat().filter(c => c != null));
    titre.hidden = !visible;
    document.querySelector('.entete').classList.toggle('avec-titre', visible);
  }

  /* ---------- Modales ---------- */

  let modaleOuverte = null;

  /**
   * Ouvre une fenêtre modale. boutons : [{ texte, valeur, classe }]. Renvoie une promesse
   * résolue avec la valeur du bouton choisi (null si fermée avec Échap).
   */
  function modale(titre, contenu, boutons) {
    fermerModale();
    return new Promise(resoudre => {
      const dialogue = el('dialog', { class: 'modale', 'aria-labelledby': 'modale-titre' });
      const fermer = valeur => {
        dialogue.close();
        dialogue.remove();
        if (modaleOuverte === dialogue) modaleOuverte = null;
        resoudre(valeur);
      };
      dialogue.append(
        el('h2', { id: 'modale-titre' }, titre),
        el('div', { class: 'modale-contenu' }, contenu),
        el('div', { class: 'ligne-boutons' },
          (boutons || [{ texte: 'Fermer', valeur: true, classe: 'btn-primaire' }]).map(b =>
            el('button', { class: 'btn ' + (b.classe || 'btn-secondaire'), onclick: () => fermer(b.valeur) }, b.texte)
          )
        )
      );
      dialogue.addEventListener('cancel', e => { e.preventDefault(); fermer(null); });
      dialogue._fermer = fermer;
      document.body.append(dialogue);
      modaleOuverte = dialogue;
      dialogue.showModal();
    });
  }

  function fermerModale() {
    if (modaleOuverte && modaleOuverte._fermer) modaleOuverte._fermer(null);
  }

  function confirmer(titre, message, texteOui, texteNon) {
    return modale(titre, el('p', null, message), [
      { texte: texteNon || 'Annuler', valeur: false, classe: 'btn-secondaire' },
      { texte: texteOui || 'Confirmer', valeur: true, classe: 'btn-primaire' }
    ]);
  }

  /** Petit message temporaire en bas de l'écran. */
  function toast(message, duree) {
    let zone = document.getElementById('toasts');
    if (!zone) {
      zone = el('div', { id: 'toasts', class: 'toasts', role: 'status', 'aria-live': 'polite' });
      document.body.append(zone);
    }
    const t = el('div', { class: 'toast' }, message);
    zone.append(t);
    setTimeout(() => t.remove(), duree || 3500);
  }

  /* ---------- Utilitaires ---------- */

  function melanger(tableau) {
    const t = tableau.slice();
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  }

  /** Entier aléatoire entre min et max inclus. */
  function entier(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function choisir(tableau) {
    return tableau[Math.floor(Math.random() * tableau.length)];
  }

  /** Minuscules, sans accents ni espaces superflus : pour comparer des réponses saisies. */
  function normaliser(texte) {
    return String(texte).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
  }

  function formatDuree(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return s + ' s';
    const m = Math.floor(s / 60);
    if (m < 60) return m + ' min ' + String(s % 60).padStart(2, '0');
    return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0');
  }

  function pluriel(n, singulier, plurielForme) {
    return n + ' ' + (n > 1 ? (plurielForme || singulier + 's') : singulier);
  }

  /** Affichage d'étoiles (sur 3) accessible. */
  function etoiles(n, total) {
    const max = total || 3;
    const span = el('span', { class: 'etoiles', role: 'img', 'aria-label': n + ' étoile' + (n > 1 ? 's' : '') + ' sur ' + max });
    for (let i = 1; i <= max; i++) span.append(el('span', { class: i <= n ? 'etoile pleine' : 'etoile' , 'aria-hidden': 'true' }, i <= n ? '★' : '☆'));
    return span;
  }

  /**
   * Bouton « 🔊 libellé » qui lit le texte à voix haute ; un second clic arrête la lecture.
   * source : texte, ou fonction qui renvoie le texte au moment du clic.
   */
  function boutonLecture(source, libelle, classe) {
    const texte = () => (typeof source === 'function' ? source() : source);
    const bouton = el('button', { type: 'button', class: 'btn ' + (classe || 'btn-discret'), onclick: () => JS.Audio.basculer(texte()) });
    const maj = () => {
      bouton.textContent = JS.Audio.lit(texte()) ? '⏹ Arrêter la lecture' : '🔊 ' + libelle;
    };
    const desabonner = JS.Audio.surLecture(() => {
      if (!bouton.isConnected) desabonner();
      else maj();
    });
    maj();
    return bouton;
  }

  /**
   * Grand bouton principal avec une jauge qui se vide en `duree` ms (temps restant avant un
   * passage automatique, que le jeu programme lui-même). La jauge s'arrête quand le bouton
   * quitte la page.
   */
  function boutonJauge(libelle, duree, onclick) {
    const remplissage = el('span', { class: 'jauge-bouton-remplissage' });
    const bouton = el('button', { type: 'button', class: 'btn btn-primaire btn-grand btn-jauge', onclick },
      libelle,
      el('span', { class: 'jauge-bouton', 'aria-hidden': 'true' }, remplissage));
    // La jauge se fige pendant la pause d'une partie (classe posée par l'écran de jeu).
    let ecoule = 0;
    let precedent = performance.now();
    let affiche = false;
    (function maj() {
      if (bouton.isConnected) affiche = true;
      else if (affiche) return;
      const maintenant = performance.now();
      if (!document.body.classList.contains('partie-en-pause')) ecoule += maintenant - precedent;
      precedent = maintenant;
      const reste = Math.max(0, 1 - ecoule / duree);
      remplissage.style.transform = 'scaleX(' + reste + ')';
      if (reste > 0) requestAnimationFrame(maj);
    })();
    return bouton;
  }

  function attendre(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  window.addEventListener('hashchange', rendre);

  JS.UI = {
    el,
    ecran,
    naviguer,
    rendre,
    majEntete,
    titreEntete,
    appliquerReglages,
    modale,
    fermerModale,
    confirmer,
    toast,
    boutonJauge,
    melanger,
    entier,
    choisir,
    normaliser,
    formatDuree,
    pluriel,
    etoiles,
    boutonLecture,
    attendre
  };
})();
