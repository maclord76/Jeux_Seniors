/* Progression : enregistrement des parties, niveaux, adaptation de la difficulté, série de jours, badges. */
window.JS = window.JS || {};

(function () {
  'use strict';

  const MAX_HISTORIQUE = 500;
  const SEUIL_DEBLOCAGE = 0.8;
  const SEUIL_DIFFICULTE = 0.4;

  function jourLocal(date) {
    const d = date ? new Date(date) : new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function decalerJour(jour, nbJours) {
    const [a, m, j] = jour.split('-').map(Number);
    return jourLocal(new Date(a, m - 1, j + nbJours));
  }

  /** Toujours au moins une étoile : on ne met jamais en échec. */
  function etoilesPour(reussite) {
    if (reussite >= 0.85) return 3;
    if (reussite >= 0.6) return 2;
    return 1;
  }

  function etatJeu(profil, jeuId) {
    if (!profil.jeux[jeuId]) {
      profil.jeux[jeuId] = {
        niveauDebloque: 1,
        niveauCourant: 1,
        meilleurs: {},
        etoiles: {},
        parties: 0,
        tempsTotal: 0,
        derniers: []
      };
    }
    return profil.jeux[jeuId];
  }

  function majSerie(profil) {
    const aujourdhui = jourLocal();
    const s = profil.serie;
    if (s.dernierJour === aujourdhui) return;
    s.actuelle = s.dernierJour === decalerJour(aujourdhui, -1) ? s.actuelle + 1 : 1;
    s.meilleure = Math.max(s.meilleure || 0, s.actuelle);
    s.dernierJour = aujourdhui;
  }

  /** Série affichée : retombe à 0 si aucune partie hier ni aujourd'hui. */
  function serie(profil) {
    const s = profil.serie;
    const aujourdhui = jourLocal();
    const enCours = s.dernierJour === aujourdhui || s.dernierJour === decalerJour(aujourdhui, -1);
    return { actuelle: enCours ? s.actuelle : 0, meilleure: s.meilleure || 0, joueAujourdhui: s.dernierJour === aujourdhui };
  }

  function partiesDuJour(profil, jour) {
    const j = jour || jourLocal();
    return profil.parties.filter(p => p.jour === j);
  }

  /* ---------- Badges ---------- */

  const BADGES = [
    { id: 'premiere', icone: '🌱', nom: 'Premier pas', description: 'Jouer une première partie.', test: p => p.totalParties >= 1 },
    { id: 'dix', icone: '🎯', nom: 'Bien lancé', description: 'Jouer 10 parties.', test: p => p.totalParties >= 10 },
    { id: 'cinquante', icone: '🏅', nom: 'Habitué', description: 'Jouer 50 parties.', test: p => p.totalParties >= 50 },
    { id: 'cent', icone: '🏆', nom: 'Passionné', description: 'Jouer 100 parties.', test: p => p.totalParties >= 100 },
    { id: 'curieux', icone: '🔎', nom: 'Curieux', description: 'Essayer 5 jeux différents.', test: p => Object.keys(p.jeux).length >= 5 },
    {
      id: 'explorateur', icone: '🧭', nom: 'Explorateur', description: 'Essayer un jeu de chaque famille.',
      test: p => {
        const cats = new Set(Object.keys(p.jeux).map(id => (JS.Jeux.get(id) || {}).categorie));
        return JS.Jeux.CATEGORIES.every(c => cats.has(c.id));
      }
    },
    {
      id: 'touche-a-tout', icone: '🎨', nom: 'Touche-à-tout', description: 'Essayer tous les jeux.',
      test: p => JS.Jeux.liste().every(j => p.jeux[j.id])
    },
    { id: 'parfait', icone: '⭐', nom: 'Sans faute', description: 'Obtenir 3 étoiles à une partie.', test: p => p.parties.some(x => x.etoiles === 3) },
    {
      id: 'progres', icone: '📈', nom: 'En progrès', description: 'Débloquer le niveau 3 d\'un jeu.',
      test: p => Object.values(p.jeux).some(e => e.niveauDebloque >= 3)
    },
    {
      id: 'champion', icone: '👑', nom: 'Champion', description: 'Atteindre le dernier niveau d\'un jeu.',
      test: p => Object.entries(p.jeux).some(([id, e]) => { const j = JS.Jeux.get(id); return j && e.niveauDebloque >= j.niveauxMax; })
    },
    { id: 'objectif', icone: '✅', nom: 'Objectif du jour', description: 'Atteindre son objectif quotidien.', test: p => partiesDuJour(p).length >= p.reglages.objectifJour },
    { id: 'serie3', icone: '🔥', nom: 'Trois jours de suite', description: 'Jouer 3 jours d\'affilée.', test: p => p.serie.meilleure >= 3 },
    { id: 'serie7', icone: '🌟', nom: 'Une semaine entière', description: 'Jouer 7 jours d\'affilée.', test: p => p.serie.meilleure >= 7 },
    { id: 'serie30', icone: '💎', nom: 'Un mois de régularité', description: 'Jouer 30 jours d\'affilée.', test: p => p.serie.meilleure >= 30 }
  ];

  function verifierBadges(profil) {
    const obtenus = new Set(profil.badges.map(b => b.id));
    const nouveaux = [];
    BADGES.forEach(b => {
      if (!obtenus.has(b.id) && b.test(profil)) {
        profil.badges.push({ id: b.id, date: Date.now() });
        nouveaux.push(b);
      }
    });
    return nouveaux;
  }

  /* ---------- Enregistrement d'une partie ---------- */

  /**
   * resultat : { score (nombre, facultatif), reussite (0..1), details (texte, facultatif) }
   * Renvoie un bilan pour l'écran de fin.
   */
  function enregistrerPartie(jeu, niveau, resultat, dureeMs) {
    const profil = JS.Stockage.profilActif();
    if (!profil) return null;
    const e = etatJeu(profil, jeu.id);
    const reussite = Math.max(0, Math.min(1, Number(resultat.reussite) || 0));
    const etoiles = etoilesPour(reussite);
    const score = resultat.score != null ? Math.round(resultat.score) : null;

    const ancienRecord = e.meilleurs[niveau];
    const nouveauRecord = score != null && ancienRecord != null && score > ancienRecord;
    if (score != null && (ancienRecord == null || score > ancienRecord)) e.meilleurs[niveau] = score;
    e.etoiles[niveau] = Math.max(e.etoiles[niveau] || 0, etoiles);
    e.parties++;
    e.tempsTotal += dureeMs;
    e.niveauCourant = niveau;
    e.derniers = e.derniers.concat({ niveau, reussite }).slice(-6);

    let debloque = false;
    let suggestion = null;
    if (reussite >= (jeu.seuilDeblocage ?? SEUIL_DEBLOCAGE) && niveau < jeu.niveauxMax) {
      if (niveau >= e.niveauDebloque) {
        e.niveauDebloque = niveau + 1;
        debloque = true;
      }
      suggestion = 'monter';
    }
    const recentsNiveau = e.derniers.filter(d => d.niveau === niveau).slice(-2);
    if (niveau > 1 && recentsNiveau.length === 2 && recentsNiveau.every(d => d.reussite < SEUIL_DIFFICULTE)) {
      suggestion = 'descendre';
    }

    profil.parties.push({
      jeu: jeu.id,
      categorie: jeu.categorie,
      niveau,
      score,
      reussite,
      etoiles,
      duree: dureeMs,
      date: Date.now(),
      jour: jourLocal()
    });
    if (profil.parties.length > MAX_HISTORIQUE) profil.parties.splice(0, profil.parties.length - MAX_HISTORIQUE);
    profil.totalParties = (profil.totalParties || 0) + 1;

    majSerie(profil);
    const objectifAtteint = partiesDuJour(profil).length === profil.reglages.objectifJour;
    const nouveauxBadges = verifierBadges(profil);
    JS.Stockage.sauver();

    return {
      reussite,
      etoiles,
      score,
      record: e.meilleurs[niveau],
      nouveauRecord,
      debloque,
      suggestion,
      objectifAtteint,
      nouveauxBadges,
      niveauDebloque: e.niveauDebloque
    };
  }

  /** Meilleur nombre d'étoiles obtenu sur un jeu, tous niveaux confondus. */
  function meilleuresEtoiles(profil, jeuId) {
    const e = profil.jeux[jeuId];
    if (!e) return 0;
    return Math.max(0, ...Object.values(e.etoiles));
  }

  /** Jeu du jour, identique pour toute la journée. */
  function jeuDuJour() {
    const liste = JS.Jeux.liste();
    if (!liste.length) return null;
    const jour = jourLocal();
    let h = 0;
    for (const c of jour) h = (h * 31 + c.charCodeAt(0)) % 100003;
    return liste[h % liste.length];
  }

  JS.Progres = {
    BADGES,
    jourLocal,
    decalerJour,
    etoilesPour,
    etatJeu,
    serie,
    partiesDuJour,
    enregistrerPartie,
    meilleuresEtoiles,
    jeuDuJour,
    verifierBadges
  };
})();
