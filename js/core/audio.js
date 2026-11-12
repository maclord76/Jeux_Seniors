/* Sons synthétisés (WebAudio) et lecture vocale (speechSynthesis). Aucun fichier audio requis. */
window.JS = window.JS || {};

(function () {
  'use strict';

  let contexte = null;
  let sonsActifs = true;
  let voixActive = false;

  function audio() {
    if (!contexte) {
      const Classe = window.AudioContext || window.webkitAudioContext;
      if (!Classe) return null;
      contexte = new Classe();
    }
    if (contexte.state === 'suspended') contexte.resume();
    return contexte;
  }

  /**
   * Joue une note. options : { type, volume, delai (s), force (joue même si les sons sont coupés) }
   */
  function note(frequence, duree, options) {
    const o = Object.assign({ type: 'sine', volume: 0.2, delai: 0, force: false }, options);
    if (!sonsActifs && !o.force) return;
    const a = audio();
    if (!a) return;
    const debut = a.currentTime + o.delai;
    const d = duree || 0.3;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = o.type;
    osc.frequency.value = frequence;
    gain.gain.setValueAtTime(0.0001, debut);
    gain.gain.exponentialRampToValueAtTime(o.volume, debut + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, debut + d);
    osc.connect(gain).connect(a.destination);
    osc.start(debut);
    osc.stop(debut + d + 0.05);
  }

  function succes() {
    note(523, 0.15);
    note(659, 0.15, { delai: 0.12 });
    note(784, 0.3, { delai: 0.24 });
  }

  /** Son doux, jamais agressif, pour une réponse inexacte. */
  function erreur() {
    note(330, 0.18, { type: 'triangle', volume: 0.12 });
    note(262, 0.3, { type: 'triangle', volume: 0.12, delai: 0.15 });
  }

  function clic() {
    note(880, 0.06, { volume: 0.06 });
  }

  function victoire() {
    [523, 659, 784, 1047].forEach((f, i) => note(f, 0.25, { delai: i * 0.13 }));
    note(1047, 0.6, { delai: 0.55, volume: 0.15 });
  }

  function voixFrancaise() {
    if (!window.speechSynthesis) return null;
    const voix = window.speechSynthesis.getVoices();
    return voix.find(v => v.lang === 'fr-FR') || voix.find(v => v.lang && v.lang.startsWith('fr')) || null;
  }

  // Lecture en cours ({ texte, phrase }) et fonctions prévenues à chaque début ou fin de lecture.
  let lecture = null;
  const abonnes = new Set();

  function notifier() {
    abonnes.forEach(fn => fn());
  }

  /** Lit un texte à voix haute. force = true pour un bouton « Écouter » explicite. */
  function parler(texte, force) {
    if ((!voixActive && !force) || !window.speechSynthesis || !texte) return;
    window.speechSynthesis.cancel();
    const phrase = new SpeechSynthesisUtterance(texte);
    phrase.lang = 'fr-FR';
    phrase.rate = 0.9;
    const v = voixFrancaise();
    if (v) phrase.voice = v;
    // La fin d'une ancienne phrase annulée peut arriver après le début de la nouvelle : on l'ignore.
    const fin = () => {
      if (lecture && lecture.phrase === phrase) {
        lecture = null;
        notifier();
      }
    };
    phrase.onend = fin;
    phrase.onerror = fin;
    lecture = { texte, phrase };
    window.speechSynthesis.speak(phrase);
    notifier();
  }

  function taire() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (lecture) {
      lecture = null;
      notifier();
    }
  }

  /** Vrai si ce texte est en train d'être lu. */
  function lit(texte) {
    return !!lecture && lecture.texte === texte;
  }

  /** Lance la lecture du texte, ou l'arrête s'il est déjà en cours de lecture. */
  function basculer(texte) {
    if (lit(texte)) taire();
    else parler(texte, true);
  }

  /** Abonne fn aux débuts et fins de lecture ; renvoie la fonction de désabonnement. */
  function surLecture(fn) {
    abonnes.add(fn);
    return () => abonnes.delete(fn);
  }

  function configurer(reglages) {
    sonsActifs = !!reglages.sons;
    voixActive = !!reglages.voix;
  }

  // Certaines voix se chargent de façon asynchrone.
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => {};

  JS.Audio = {
    note,
    succes,
    erreur,
    clic,
    victoire,
    parler,
    taire,
    lit,
    basculer,
    surLecture,
    configurer,
    voixDisponible: () => !!window.speechSynthesis
  };
})();
