/* Qui se cache ? : jeu de déduction. Le joueur interroge l'ordinateur (oui / non) pour retrouver une
 * personnalité cachée parmi des portraits. Trois enquêtes par partie, aucune limite de temps.
 *
 * Organisation :
 * - fonctions pures (données, signatures, plateaux, questions utiles, conseil, barème) ;
 * - moteur de partie (état logique et actions), sans DOM, exposé via `logique` pour les tests ;
 * - rendu et gestion des événements dans start(ctx).
 */
(function () {
  'use strict';
  const { el } = JS.UI;

  const ENQUETES = 3;
  const PAR_PAGE = 3;            // questions affichées à la fois
  const UNIVERS = ['cinema', 'chanson', 'sport'];
  const NIVEAUX = [
    { poidsStrategie: 40, portraits: 6, manuel: false, familiers: true, proches: false, texte: '6 portraits bien distincts, les portraits écartés le sont automatiquement' },
    { poidsStrategie: 45, portraits: 9, manuel: false, familiers: false, proches: false, texte: '9 portraits, davantage de points communs, élimination automatique' },
    { poidsStrategie: 50, portraits: 9, manuel: true, familiers: false, proches: false, texte: '9 portraits, vous écartez vous-même les portraits puis vous validez' },
    { poidsStrategie: 55, portraits: 12, manuel: true, familiers: false, proches: true, texte: '12 portraits plus proches les uns des autres, élimination par vous-même' }
  ];
  const PHASES = { QUESTION: 'question', ELIMINATION: 'elimination', PROPOSITION: 'proposition', RESULTAT: 'resultat', TERMINE: 'termine' };

  /* ====================================================================================
     Fonctions pures
     ==================================================================================== */

  /** Mélange avec une source de hasard injectable (Math.random par défaut). */
  function melanger(tableau, rng) {
    const r = rng || Math.random;
    const t = tableau.slice();
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  }
  const choisirDans = (t, rng) => t[Math.floor((rng || Math.random)() * t.length)];

  /** Liste des erreurs de données (vide si tout est cohérent). */
  function validerDonnees(d) {
    const erreurs = [];
    if (!d || !Array.isArray(d.personnages) || !Array.isArray(d.questions)) return ['Données absentes.'];
    if (!d.personnages.length) erreurs.push('Aucun personnage.');
    if (!d.questions.length) erreurs.push('Aucune question.');
    const ids = new Set();
    d.personnages.forEach(p => {
      if (!p || !p.id) { erreurs.push('Personnage sans identifiant.'); return; }
      if (ids.has(p.id)) erreurs.push('Identifiant de personnage en double : ' + p.id);
      ids.add(p.id);
      ['nom', 'activite', 'portrait', 'descriptionPortrait', 'ficheCourte', 'presentation'].forEach(c => {
        if (typeof p[c] !== 'string' || !p[c].trim()) erreurs.push(p.id + ' : champ « ' + c + ' » manquant');
      });
      if (typeof p.familier !== 'boolean') erreurs.push(p.id + ' : indicateur « familier » manquant');
      if (!UNIVERS.includes(p.univers)) erreurs.push(p.id + ' : univers inconnu');
      if (!Array.isArray(p.sources) || !p.sources.length) erreurs.push(p.id + ' : aucune source');
      if (!p.photo || !p.photo.auteur || !p.photo.licence || !p.photo.source) erreurs.push(p.id + ' : crédit photo incomplet');
      if (!p.attributs || typeof p.attributs !== 'object') erreurs.push(p.id + ' : attributs manquants');
    });
    const idsQ = new Set();
    const attributs = new Set();
    d.questions.forEach(q => {
      if (!q || !q.id) { erreurs.push('Question sans identifiant.'); return; }
      if (idsQ.has(q.id)) erreurs.push('Identifiant de question en double : ' + q.id);
      idsQ.add(q.id);
      ['texte', 'attribut', 'oui', 'non', 'aide', 'libelle'].forEach(c => {
        if (typeof q[c] !== 'string' || !q[c].trim()) erreurs.push(q.id + ' : champ « ' + c + ' » manquant');
      });
      if (!['fiche', 'portrait'].includes(q.nature)) erreurs.push(q.id + ' : nature inconnue');
      if (q.niveaux != null && (!Array.isArray(q.niveaux) || !q.niveaux.length
        || q.niveaux.some(n => !Number.isInteger(n) || n < 1 || n > NIVEAUX.length))) {
        erreurs.push(q.id + ' : niveaux invalides');
      }
      attributs.add(q.attribut);
    });
    d.personnages.forEach(p => {
      if (!p || !p.attributs) return;
      attributs.forEach(a => {
        if (typeof p.attributs[a] !== 'boolean') erreurs.push(p.id + ' : attribut « ' + a + ' » absent ou non booléen');
      });
      Object.keys(p.attributs).forEach(a => {
        if (!attributs.has(a)) erreurs.push(p.id + ' : attribut « ' + a + ' » sans question');
      });
    });
    Object.entries(d.plateauxSecours || {}).forEach(([n, liste]) => {
      (liste || []).forEach(id => { if (!ids.has(id)) erreurs.push('Plateau de secours ' + n + ' : personnage inconnu ' + id); });
    });
    return erreurs;
  }

  function questionsDuNiveau(questions, niveau) {
    return questions.filter(q => !q.niveaux || q.niveaux.includes(niveau));
  }

  /** Réponses d'un personnage aux questions du niveau, sous forme de texte « 0101… ». */
  function signature(p, questions) {
    return questions.map(q => (p.attributs[q.attribut] ? '1' : '0')).join('');
  }

  function distance(a, b, questions) {
    return questions.reduce((n, q) => n + (a.attributs[q.attribut] !== b.attributs[q.attribut] ? 1 : 0), 0);
  }

  /** Plateau correct : bonne taille, personnages connus et tous distinguables au niveau joué. */
  function plateauValide(ids, d, niveau) {
    const cfg = NIVEAUX[niveau - 1];
    if (!cfg || !Array.isArray(ids) || ids.length !== cfg.portraits || new Set(ids).size !== ids.length) return false;
    const parId = new Map(d.personnages.map(p => [p.id, p]));
    if (ids.some(id => !parId.has(id))) return false;
    const qs = questionsDuNiveau(d.questions, niveau);
    return new Set(ids.map(id => signature(parId.get(id), qs))).size === ids.length;
  }

  /**
   * Constitue un plateau à partir des groupes de signatures distinctes (un représentant par groupe),
   * sans boucle de tirage sans fin. `exclus` : personnages déjà secrets dans cette partie, qui
   * peuvent réapparaître mais ne seront plus choisis comme secret.
   * Renvoie { ids, secours } ou null si aucun plateau valide n'est possible.
   */
  function construirePlateau(d, niveau, rng, exclus) {
    const cfg = NIVEAUX[niveau - 1];
    if (!cfg) return null;
    const dejaSecrets = new Set(exclus || []);
    const qs = questionsDuNiveau(d.questions, niveau);
    const eligibles = d.personnages.filter(p => !cfg.familiers || p.familier);

    const groupes = new Map();
    eligibles.forEach(p => {
      const s = signature(p, qs);
      if (!groupes.has(s)) groupes.set(s, []);
      groupes.get(s).push(p);
    });
    // Un représentant par signature, de préférence un personnage qui n'a pas encore été secret.
    const representants = melanger([...groupes.values()], rng).map(g => {
      const libres = g.filter(p => !dejaSecrets.has(p.id));
      return choisirDans(libres.length ? libres : g, rng);
    });

    const quota = Math.ceil(cfg.portraits / UNIVERS.length);
    const compte = { cinema: 0, chanson: 0, sport: 0 };
    const choisis = [];
    const ajouter = p => { choisis.push(p); compte[p.univers]++; };
    const place = p => !choisis.includes(p) && compte[p.univers] < quota;

    if (cfg.proches && representants.length) {
      // Plateau « serré » : on ajoute à chaque fois l'un des trois personnages les plus proches.
      ajouter(representants[0]);
      while (choisis.length < cfg.portraits) {
        const possibles = representants.filter(place)
          .map(p => ({ p, d: choisis.reduce((s, c) => s + distance(p, c, qs), 0) / choisis.length }))
          .sort((a, b) => a.d - b.d);
        if (!possibles.length) break;
        ajouter(choisirDans(possibles.slice(0, 3), rng).p);
      }
    } else {
      for (const p of representants) {
        if (choisis.length >= cfg.portraits) break;
        if (place(p)) ajouter(p);
      }
    }
    // Complément sans quota si un univers manque de personnages.
    for (const p of representants) {
      if (choisis.length >= cfg.portraits) break;
      if (!choisis.includes(p)) ajouter(p);
    }

    let ids = choisis.map(p => p.id);
    let secours = false;
    if (!plateauValide(ids, d, niveau) || ids.every(id => dejaSecrets.has(id))) {
      ids = melanger(((d.plateauxSecours || {})[niveau] || []).slice(), rng);
      secours = true;
      if (!plateauValide(ids, d, niveau) || ids.every(id => dejaSecrets.has(id))) return null;
    }
    return { ids: secours ? ids : melanger(ids, rng), secours };
  }

  /** Secret tiré uniformément parmi les portraits du plateau qui n'ont pas encore été secrets. */
  function choisirSecret(ids, exclus, rng) {
    const libres = ids.filter(id => !(exclus || []).includes(id));
    return libres.length ? choisirDans(libres, rng) : null;
  }

  /** Taille des groupes « oui » et « non » d'une question parmi des candidats. */
  function partage(q, candidats) {
    const oui = candidats.filter(p => p.attributs[q.attribut]).length;
    return { oui, non: candidats.length - oui };
  }

  /** Questions utiles : non posées et partageant les candidats en deux groupes non vides. */
  function questionsUtiles(candidats, questions, posees) {
    const dejaPosees = new Set(posees || []);
    return questions.filter(q => {
      if (dejaPosees.has(q.id)) return false;
      const g = partage(q, candidats);
      return g.oui > 0 && g.non > 0;
    });
  }

  /** Candidats qui ne correspondent pas à la réponse (ceux qu'il faut écarter). */
  function eliminationsAttendues(candidats, q, reponse) {
    return candidats.filter(p => p.attributs[q.attribut] !== reponse).map(p => p.id);
  }

  /** Question conseillée : celle dont le plus grand des deux groupes est le plus petit ; égalités au hasard. */
  function questionConseillee(candidats, utiles, rng) {
    if (!utiles.length) return null;
    const pire = q => { const g = partage(q, candidats); return Math.max(g.oui, g.non); };
    const meilleur = Math.min(...utiles.map(pire));
    return choisirDans(utiles.filter(q => pire(q) === meilleur), rng);
  }

  /** Une question par paire de portraits, plus une, arrondie au supérieur. */
  function repereQuestions(nombrePortraits) {
    return Math.ceil(nombrePortraits / 2 + 1);
  }

  /** Évalue le choix avant la réponse, sans utiliser le personnage secret. */
  function qualiteQuestion(question, candidats, utiles, poidsStrategie) {
    const groupes = partage(question, candidats);
    const gainGaranti = Math.min(groupes.oui, groupes.non);
    const meilleurGain = Math.max(...utiles.map(q => {
      const g = partage(q, candidats);
      return Math.min(g.oui, g.non);
    }));
    return { gainGaranti, meilleurGain, malus: poidsStrategie * (meilleurGain - gainGaranti) };
  }

  function texteQualite(qualite) {
    if (!qualite || !qualite.malus) return '';
    return 'Cette question garantissait d’écarter au moins ' + pluriel(qualite.gainGaranti, 'portrait')
      + '. Une autre question en garantissait ' + qualite.meilleurGain + ' : −' + qualite.malus + ' points.';
  }

  /** Chaque enquête vaut 100 points, avant les malus de questions, d'indices et d'erreurs. */
  function resultatEnquete(erreurs, aides = 0, malusStrategie = 0) {
    const points = Math.max(0, 100 - 20 * erreurs - 10 * aides - malusStrategie);
    return { points, bonus: 0 };
  }

  /** Bilan de la partie à partir des résultats des trois enquêtes : { erreurs, portraits, questions, nom }. */
  function bilanPartie(enquetes) {
    let sommePoints = 0;
    let sommeBonus = 0;
    let questions = 0;
    let corrections = 0;
    enquetes.forEach(e => {
      const r = resultatEnquete(e.erreurs, e.aides, e.malusStrategie);
      sommePoints += r.points;
      sommeBonus += r.bonus;
      questions += e.questions;
      corrections += e.erreurs;
    });
    const noms = enquetes.map(e => e.nom);
    const listeNoms = noms.length > 1 ? noms.slice(0, -1).join(', ') + ' et ' + noms[noms.length - 1] : noms.join('');
    const details = 'Personnalités démasquées : ' + listeNoms + '. '
      + pluriel(questions, 'question posée', 'questions posées') + ' au total, '
      + (corrections ? 'avec ' + pluriel(corrections, 'correction') + ' en chemin. Bel esprit d’enquête !'
        : 'sans aucune correction.')
      + ' ' + enquetes.reduce((total, e) => total + (e.malusStrategie || 0), 0)
      + ' points de malus pour les questions moins efficaces ou les propositions anticipées.';
    return {
      reussite: sommePoints / (100 * ENQUETES),
      score: sommePoints + sommeBonus,
      details
    };
  }

  function pluriel(n, singulier, plurielForme) {
    return n + ' ' + (n > 1 ? (plurielForme || singulier + 's') : singulier);
  }

  /* ====================================================================================
     Moteur de partie (sans DOM)
     ==================================================================================== */

  /**
   * Crée une partie. options.rng : source de hasard (tests reproductibles).
   * Renvoie la partie, ou { erreur: 'donnees' | 'plateau', details } si elle ne peut pas commencer.
   */
  function creerPartie(d, niveau, options) {
    const rng = (options && options.rng) || Math.random;
    const erreurs = validerDonnees(d);
    if (erreurs.length) return { erreur: 'donnees', details: erreurs };
    if (!NIVEAUX[niveau - 1]) return { erreur: 'plateau', details: ['Niveau inconnu.'] };
    const partie = {
      niveau,
      cfg: NIVEAUX[niveau - 1],
      d,
      rng,
      qs: questionsDuNiveau(d.questions, niveau),
      parId: new Map(d.personnages.map(p => [p.id, p])),
      qParId: new Map(d.questions.map(q => [q.id, q])),
      secrets: [],
      enquetes: [],
      enquete: null,
      phase: PHASES.QUESTION
    };
    if (!nouvelleEnquete(partie)) return { erreur: 'plateau', details: ['Aucun plateau valide pour ce niveau.'] };
    return partie;
  }

  function nouvelleEnquete(partie) {
    const plateau = construirePlateau(partie.d, partie.niveau, partie.rng, partie.secrets);
    if (!plateau) return false;
    // L'ordre des questions est tiré avant le secret et n'en dépend pas.
    const ordre = melanger(partie.qs.map(q => q.id), partie.rng);
    const secret = choisirSecret(plateau.ids, partie.secrets, partie.rng);
    if (!secret) return false;
    const e = {
      repere: repereQuestions(plateau.ids.length),
      numero: partie.enquetes.length + 1,
      plateau: plateau.ids,
      secours: plateau.secours,
      secret,
      ordre,
      posees: [],
      historique: [],
      derniere: null,
      candidats: new Set(plateau.ids),   // compatibles avec toutes les informations reçues
      ecartes: new Set(),                // cartes définitivement écartées à l'écran
      selection: new Set(),              // sélection manuelle temporaire (sans effet sur la vérité du jeu)
      attendus: null,                    // éliminations attendues pendant la phase manuelle
      proposition: null,
      conseillee: null,
      page: 0,
      erreurs: 0,
      propositionsFausses: 0,
      validationsFausses: 0,
      aides: 0,
      malusStrategie: 0,
      trouve: false
    };
    partie.secrets.push(secret);
    partie.enquetes.push(e);
    partie.enquete = e;
    partie.phase = PHASES.QUESTION;
    return true;
  }

  const personnes = (partie, ids) => [...ids].map(id => partie.parId.get(id));
  const nomDe = (partie, id) => partie.parId.get(id).nom;

  /** Questions utiles, dans l'ordre fixé au début de l'enquête (indépendant du secret). */
  function questionsOrdonnees(partie) {
    const e = partie.enquete;
    const utiles = new Set(questionsUtiles(personnes(partie, e.candidats), partie.qs, e.posees).map(q => q.id));
    return e.ordre.filter(id => utiles.has(id)).map(id => partie.qParId.get(id));
  }

  /** Page de questions affichée : { questions, page, pages, total }. */
  function questionsVisibles(partie) {
    const toutes = questionsOrdonnees(partie);
    const pages = Math.max(1, Math.ceil(toutes.length / PAR_PAGE));
    const page = partie.enquete.page % pages;
    return { questions: toutes.slice(page * PAR_PAGE, page * PAR_PAGE + PAR_PAGE), page, pages, total: toutes.length };
  }

  const refus = message => ({ ok: false, message: message || '' });
  const derniereSeule = (partie) => partie.enquete.candidats.size === 1
    ? ' Il ne reste qu’un portrait possible : appuyez sur « J’ai trouvé » pour le désigner.' : '';

  function poserQuestion(partie, qid) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.QUESTION || e.candidats.size < 2) return refus();
    const utiles = questionsOrdonnees(partie);
    const q = utiles.find(x => x.id === qid);
    if (!q) return refus();
    const qualite = qualiteQuestion(q, personnes(partie, e.candidats), utiles, partie.cfg.poidsStrategie);
    e.malusStrategie += qualite.malus;
    const reponse = partie.parId.get(e.secret).attributs[q.attribut];
    const attendus = eliminationsAttendues(personnes(partie, e.candidats), q, reponse);
    attendus.forEach(id => e.candidats.delete(id));
    const phrase = reponse ? q.oui : q.non;
    const entree = { type: 'question', questionId: q.id, texte: q.texte, reponse, phrase, qualite };
    e.posees.push(q.id);
    e.historique.push(entree);
    e.derniere = entree;
    e.conseillee = null;
    e.page = 0;
    if (partie.cfg.manuel) {
      partie.phase = PHASES.ELIMINATION;
      e.attendus = new Set(attendus);
      e.selection = new Set();
      return { ok: true, phrase, attendus, message: phrase + ' Touchez les portraits qui ne correspondent pas, puis validez.' };
    }
    attendus.forEach(id => e.ecartes.add(id));
    return {
      ok: true, phrase, attendus,
      message: phrase + ' ' + pluriel(attendus.length, 'portrait écarté', 'portraits écartés') + '.' + derniereSeule(partie)
    };
  }

  function autresQuestions(partie) {
    if (partie.phase !== PHASES.QUESTION) return refus();
    const v = questionsVisibles(partie);
    if (v.pages < 2) return refus();
    partie.enquete.page = (v.page + 1) % v.pages;
    return { ok: true, message: '' };
  }

  function aideQuestion(partie) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.QUESTION) return refus();
    e.aides++;
    if (e.candidats.size === 1) {
      return { ok: true, message: 'Il ne reste qu’un portrait possible : appuyez sur « J’ai trouvé », puis choisissez-le.' };
    }
    const toutes = questionsOrdonnees(partie);
    const q = questionConseillee(personnes(partie, e.candidats), toutes, partie.rng);
    if (!q) return refus();
    e.conseillee = q.id;
    e.page = Math.floor(toutes.indexOf(q) / PAR_PAGE);
    const g = partage(q, personnes(partie, e.candidats));
    return {
      ok: true, question: q.id,
      message: 'Conseil : posez la question « ' + q.texte + ' » Quelle que soit la réponse, elle écartera au moins '
        + pluriel(Math.min(g.oui, g.non), 'portrait') + '. ' + q.aide
    };
  }

  function basculerSelection(partie, id) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.ELIMINATION || !e.plateau.includes(id) || e.ecartes.has(id)) return refus();
    if (e.selection.has(id)) e.selection.delete(id); else e.selection.add(id);
    return { ok: true, selectionne: e.selection.has(id) };
  }

  function validerElimination(partie) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.ELIMINATION) return refus();
    const juste = e.selection.size === e.attendus.size && [...e.selection].every(id => e.attendus.has(id));
    if (!juste) {
      e.erreurs++;
      e.validationsFausses++;
      return {
        ok: false, erreur: true,
        message: 'Ce n’est pas tout à fait cela. Relisez la réponse : « ' + e.derniere.phrase
          + ' » Vous pouvez modifier votre sélection ou demander de l’aide.'
      };
    }
    const n = e.attendus.size;
    e.attendus.forEach(id => e.ecartes.add(id));
    e.attendus = null;
    e.selection = new Set();
    partie.phase = PHASES.QUESTION;
    return { ok: true, message: 'Bien vu : ' + pluriel(n, 'portrait écarté', 'portraits écartés') + '.' + derniereSeule(partie) };
  }

  function aideElimination(partie) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.ELIMINATION) return refus();
    e.aides++;
    e.selection = new Set(e.attendus);
    return {
      ok: true,
      message: 'Voici les ' + pluriel(e.attendus.size, 'portrait', 'portraits') + ' qui ne correspondent pas à la réponse « '
        + e.derniere.phrase + ' » Appuyez sur « Valider mes choix » pour les écarter.'
    };
  }

  function ouvrirProposition(partie) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.QUESTION || !e.posees.length) return refus();
    partie.phase = PHASES.PROPOSITION;
    e.proposition = null;
    return { ok: true, message: 'Touchez le portrait de la personne que vous pensez avoir trouvée, puis confirmez.' };
  }

  function choisirProposition(partie, id) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.PROPOSITION || !e.plateau.includes(id) || e.ecartes.has(id)) return refus();
    e.proposition = e.proposition === id ? null : id;
    return { ok: true, message: e.proposition ? 'Vous avez choisi ' + nomDe(partie, id) + '. Confirmez avec « Je propose ' + nomDe(partie, id) + ' ».' : '' };
  }

  function annulerProposition(partie) {
    if (partie.phase !== PHASES.PROPOSITION) return refus();
    partie.phase = PHASES.QUESTION;
    partie.enquete.proposition = null;
    return { ok: true, message: 'L’enquête continue.' };
  }

  function aideProposition(partie) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.PROPOSITION) return refus();
    e.aides++;
    return {
      ok: true,
      message: e.candidats.size === 1
        ? 'Un seul portrait n’est pas écarté : c’est lui qu’il faut choisir, puis confirmer.'
        : 'Plusieurs portraits restent possibles. Vous pouvez choisir celui qui vous semble le bon, ou revenir à l’enquête pour poser une autre question.'
    };
  }

  function confirmerProposition(partie) {
    const e = partie.enquete;
    if (partie.phase !== PHASES.PROPOSITION || !e.proposition || e.ecartes.has(e.proposition)) return refus();
    const id = e.proposition;
    e.proposition = null;
    if (id === e.secret) {
      if (e.candidats.size > 1) e.malusStrategie += partie.cfg.poidsStrategie;
      e.trouve = true;
      e.candidats = new Set([id]);
      partie.phase = PHASES.RESULTAT;
      return { ok: true, trouve: true, message: 'Bravo, c’est bien ' + nomDe(partie, id) + ' !' };
    }
    e.erreurs++;
    e.propositionsFausses++;
    e.ecartes.add(id);
    e.candidats.delete(id);
    const entree = { type: 'proposition', id, phrase: 'Ce n’est pas ' + nomDe(partie, id) + '.' };
    e.historique.push(entree);
    e.derniere = entree;
    e.conseillee = null;
    partie.phase = PHASES.QUESTION;
    return { ok: false, erreur: true, message: 'Ce n’est pas cette personne. Continuons l’enquête.' + derniereSeule(partie) };
  }

  /** Résultat d'une enquête terminée (pour l'affichage et le bilan). */
  function resumeEnquete(partie, e) {
    const r = resultatEnquete(e.erreurs, e.aides, e.malusStrategie);
    return { nom: nomDe(partie, e.secret), erreurs: e.erreurs, portraits: e.plateau.length, questions: e.posees.length, aides: e.aides, malusStrategie: e.malusStrategie, points: r.points, bonus: r.bonus };
  }

  /** Passe à l'enquête suivante, ou termine la partie et renvoie le bilan après la troisième. */
  function enqueteSuivante(partie) {
    if (partie.phase !== PHASES.RESULTAT) return refus();
    if (partie.enquetes.length >= ENQUETES) {
      partie.phase = PHASES.TERMINE;
      return { ok: true, termine: true, bilan: bilanPartie(partie.enquetes.map(e => resumeEnquete(partie, e))) };
    }
    if (!nouvelleEnquete(partie)) return { ok: false, erreur: 'plateau', message: '' };
    return { ok: true, message: '' };
  }

  /* ====================================================================================
     Rendu
     ==================================================================================== */

  JS.Jeux.register({
    id: 'qui-se-cache',
    nom: 'Qui se cache ?',
    categorie: 'auditive',
    icone: '🔎',
    description: 'Posez des questions et retrouvez la personnalité cachée parmi les portraits.',
    consigne: 'Une personnalité du cinéma, de la chanson ou du sport se cache parmi les portraits. Pour la retrouver, choisissez des questions : l’ordinateur répond par oui ou par non. Les portraits qui ne correspondent pas à la réponse sont écartés, automatiquement aux premiers niveaux, puis par vous-même. Quand vous pensez avoir trouvé, appuyez sur « J’ai trouvé », choisissez le portrait et confirmez. Lorsqu’il ne reste qu’un portrait après les éliminations, la réussite est automatique et la suite arrive après cinq secondes. Le nombre de questions affiché est un repère. Vous pouvez poser les questions nécessaires sans malus de dépassement. Cherchez à séparer les portraits en deux groupes aussi équilibrés que possible. Les questions moins efficaces et les propositions anticipées coûtent davantage de points aux niveaux supérieurs. Chaque utilisation de « Aidez-moi » retire 10 points et chaque erreur retire 20 points. Il faut une moyenne d’au moins 80 % pour accéder au niveau suivant. Les fiches et la lecture des réponses restent gratuites. Trois enquêtes par partie, sans limite de temps.',
    niveauxMax: NIVEAUX.length,
    descriptionNiveau: n => ENQUETES + ' enquêtes, ' + NIVEAUX[n - 1].texte + '.',
    logique: {
      NIVEAUX, PHASES, ENQUETES, PAR_PAGE,
      melanger, validerDonnees, questionsDuNiveau, signature, plateauValide, construirePlateau, choisirSecret,
      partage, questionsUtiles, eliminationsAttendues, questionConseillee, repereQuestions, qualiteQuestion, resultatEnquete, bilanPartie,
      creerPartie, questionsOrdonnees, questionsVisibles, poserQuestion, autresQuestions, aideQuestion,
      basculerSelection, validerElimination, aideElimination, ouvrirProposition, choisirProposition,
      annulerProposition, aideProposition, confirmerProposition, resumeEnquete, enqueteSuivante
    },

    start(ctx) {
      const donnees = JS.Donnees && JS.Donnees.quiSeCache;
      const partie = creerPartie(donnees, ctx.niveau, {});
      let termine = false;
      let cibles = new Map();   // clé de focus → élément affiché

      const enPause = () => !!(ctx.enPause && ctx.enPause());
      const parler = texte => { if (JS.Audio && JS.Audio.parler) JS.Audio.parler(texte); };
      const taire = () => { if (JS.Audio && JS.Audio.taire) JS.Audio.taire(); };

      if (partie.erreur) {
        if (partie.details) console.error('Qui se cache ? :', partie.details);
        afficherAnomalie();
        return () => { termine = true; };
      }

      /** Les données ne permettent pas de jouer : message clair, retour au choix des niveaux, rien d'enregistré. */
      function afficherAnomalie() {
        termine = true;
        ctx.message('Ce jeu ne peut pas préparer de plateau pour le moment. Cette partie ne sera pas comptée.', 'erreur');
        ctx.root.innerHTML = '';
        const retour = el('button', {
          type: 'button', class: 'btn btn-primaire btn-grand',
          onclick: () => { if (JS.UI.naviguer) JS.UI.naviguer('jeu/qui-se-cache'); }
        }, 'Revenir au choix des niveaux');
        ctx.root.append(el('div', { class: 'ligne-boutons centre' }, retour));
        retour.focus();
      }

      /**
       * Enveloppe des actions : ignore les clics pendant la pause, après la fin de partie ou venant
       * d'une enquête précédente (bouton resté affiché, double clic).
       */
      function action(fn) {
        const enquete = partie.enquete;
        return (...args) => {
          if (termine || !ctx.actif() || enPause() || partie.enquete !== enquete) return;
          fn(...args);
        };
      }

      function annoncer(res, typeDefaut) {
        if (res && res.message) ctx.message(res.message, res.erreur ? 'erreur' : (typeDefaut || 'info'));
      }

      /* ---------- Fiche ---------- */

      function imagePortrait(p, classe) {
        const cadre = el('div', { class: 'qsc-cadre ' + (classe || '') });
        const remplacement = () => {
          cadre.innerHTML = '';
          cadre.classList.add('qsc-sans-image');
          cadre.append(el('strong', null, p.nom), el('span', null, p.descriptionPortrait));
        };
        cadre.append(el('img', { class: 'qsc-portrait', src: p.portrait, alt: 'Portrait de ' + p.nom, onerror: remplacement }));
        return cadre;
      }

      function texteFiche(p) {
        return p.nom + '. ' + p.ficheCourte + ' Portrait : ' + p.descriptionPortrait;
      }

      function ouvrirFiche(p) {
        const ligne = q => el('li', null,
          el('span', { class: 'qsc-repere-libelle' }, q.libelle + ' :'), ' ',
          el('strong', null, p.attributs[q.attribut] ? '✔ Oui' : '✖ Non'));
        const fiche = partie.qs.filter(q => q.nature === 'fiche');
        const portrait = partie.qs.filter(q => q.nature === 'portrait');
        JS.UI.modale('Fiche de ' + p.nom, el('div', { class: 'qsc-fiche-contenu' },
          imagePortrait(p, 'qsc-cadre-fiche'),
          el('p', { class: 'qsc-fiche-activite' }, el('strong', null, p.activite)),
          el('p', null, p.ficheCourte),
          JS.Audio && JS.Audio.voixDisponible && JS.Audio.voixDisponible() ? JS.UI.boutonLecture(texteFiche(p), 'Écouter la fiche') : null,
          el('h3', null, 'Ce que montre le portrait'),
          el('p', null, p.descriptionPortrait),
          el('h3', null, 'Réponses de cette fiche'),
          el('ul', { class: 'qsc-reperes', 'aria-label': 'La personne' }, fiche.map(ligne)),
          el('ul', { class: 'qsc-reperes', 'aria-label': 'Sur ce portrait' }, portrait.map(ligne)),
          el('p', { class: 'qsc-credit' }, 'Photo : ' + p.photo.auteur + ' — ' + p.photo.licence + ' — ',
            el('a', { href: p.photo.source, target: '_blank', rel: 'noopener' }, 'Wikimedia Commons'))
        )).then(() => taire());
        // La fenêtre s'ouvre en haut de la fiche (portrait et nom visibles), même si le focus est plus bas.
        const dialogue = typeof document !== 'undefined' && document.querySelector ? document.querySelector('dialog.modale') : null;
        if (dialogue) dialogue.scrollTop = 0;
      }

      /* ---------- Rendu complet de l'enquête ---------- */

      function cible(cle, element) {
        element.dataset.focus = cle;
        cibles.set(cle, element);
        return element;
      }

      /**
       * Redessine l'enquête. focus : clé de l'élément à focaliser (prochaine action) ; sinon on
       * conserve le focus sur l'élément équivalent s'il existe encore.
       */
      function rendre(focus, sansDefilement) {
        if (termine) return;
        if (partie.phase === PHASES.QUESTION && partie.enquete.candidats.size === 1) {
          const id = [...partie.enquete.candidats][0];
          if (ouvrirProposition(partie).ok && choisirProposition(partie, id).ok) {
            partie.enquete.validationAutomatique = true;
            confirmer();
            return;
          }
        }
        const actif = typeof document !== 'undefined' ? document.activeElement : null;
        const precedente = actif && actif.dataset ? actif.dataset.focus : null;
        const defilement = typeof window !== 'undefined' && typeof window.scrollY === 'number' ? window.scrollY : null;
        cibles = new Map();
        const e = partie.enquete;
        ctx.root.innerHTML = '';
        ctx.root.append(el('div', { class: 'qsc-jeu' },
          barre(e), derniereReponse(e), plateau(e), actions(e), historique(e)));
        if (defilement != null && window.scrollTo) window.scrollTo(0, defilement);
        const explicite = focus && cibles.get(focus);
        const element = explicite || (precedente && cibles.get(precedente)) || (focus && cibles.get('repli'));
        if (element && element.focus) element.focus(explicite && !sansDefilement ? undefined : { preventScroll: true });
      }

      function barre(e) {
        const restants = e.plateau.length - e.ecartes.size;
        return el('div', { class: 'qsc-barre' },
          el('span', { class: 'compteur' }, 'Enquête ' + e.numero + ' sur ' + ENQUETES),
          el('span', { class: 'compteur' }, pluriel(restants, 'portrait restant', 'portraits restants')),
          el('span', { class: 'compteur' }, pluriel(e.posees.length, 'question posée', 'questions posées')),
          el('span', { class: 'compteur' }, 'Repère : ' + e.repere + ' questions'),
          el('span', { class: 'compteur' }, 'Indices utilisés : ' + e.aides),
          el('span', { class: 'compteur' }, 'Réussite : ' + resultatEnquete(e.erreurs, e.aides, e.malusStrategie).points + ' %'));
      }

      function derniereReponse(e) {
        const section = el('section', { class: 'panneau qsc-derniere', 'aria-labelledby': 'qsc-titre-derniere' },
          el('h2', { id: 'qsc-titre-derniere' }, 'Dernière réponse'));
        const d = e.derniere;
        if (!d) {
          section.append(el('p', { class: 'texte-doux' }, 'Choisissez une première question pour commencer l’enquête.'));
          return section;
        }
        if (d.type === 'question') {
          section.append(
            el('p', { class: 'qsc-question-posee' }, d.texte),
            el('p', { class: 'qsc-reponse ' + (d.reponse ? 'qsc-oui' : 'qsc-non') },
              el('span', { class: 'qsc-pastille', 'aria-hidden': 'true' }, d.reponse ? '✔' : '✖'), ' ', d.phrase));
          if (d.qualite && d.qualite.malus) section.append(el('p', null, texteQualite(d.qualite)));
        } else {
          section.append(el('p', { class: 'qsc-reponse qsc-non' },
            el('span', { class: 'qsc-pastille', 'aria-hidden': 'true' }, '✖'), ' ', d.phrase));
        }
        if (JS.Audio && JS.Audio.voixDisponible && JS.Audio.voixDisponible()) {
          section.append(JS.UI.boutonLecture((d.texte ? d.texte + ' ' : '') + d.phrase, 'Écouter la réponse'));
        }
        return section;
      }

      function plateau(e) {
        const phase = partie.phase;
        const liste = el('ul', { class: 'qsc-plateau', 'aria-label': 'Portraits' });
        e.plateau.forEach(id => {
          const p = partie.parId.get(id);
          const ecarte = e.ecartes.has(id);
          const selectionnable = !ecarte && (phase === PHASES.ELIMINATION || phase === PHASES.PROPOSITION);
          const presse = phase === PHASES.ELIMINATION ? e.selection.has(id) : e.proposition === id;
          let etat = null;
          if (ecarte) etat = '✖ Écarté';
          else if (phase === PHASES.ELIMINATION && presse) etat = '✖ À écarter';
          else if (phase === PHASES.PROPOSITION && presse) etat = '★ Ma proposition';
          else if (phase === PHASES.RESULTAT && id === e.secret) etat = '★ C’est la bonne personne';
          const contenu = [
            imagePortrait(p),
            el('span', { class: 'qsc-nom' }, p.nom),
            el('span', { class: 'qsc-activite' }, p.activite),
            el('span', { class: 'qsc-etat' + (etat ? '' : ' qsc-etat-vide') }, etat || ' ')
          ];
          const principal = selectionnable
            ? cible('carte-' + id, el('button', {
              type: 'button',
              class: 'qsc-carte-principal',
              'aria-pressed': String(presse),
              onclick: action(() => {
                const res = phase === PHASES.ELIMINATION ? basculerSelection(partie, id) : choisirProposition(partie, id);
                if (res.ok) { if (res.message) annoncer(res); rendre('carte-' + id); }
              })
            }, contenu))
            : el('div', { class: 'qsc-carte-principal' }, contenu);
          liste.append(el('li', {
            class: 'qsc-carte' + (ecarte ? ' qsc-ecartee' : '') + (presse && selectionnable ? ' qsc-pressee' : '')
              + (phase === PHASES.RESULTAT && id === e.secret ? ' qsc-trouvee' : '')
          },
          principal,
          cible('fiche-' + id, el('button', {
            type: 'button', class: 'btn btn-discret qsc-bouton-fiche', 'aria-label': 'Fiche de ' + p.nom,
            onclick: () => { if (!termine && ctx.actif()) ouvrirFiche(p); }
          }, '📄 Fiche'))));
        });
        return el('section', { class: 'qsc-zone-plateau', 'aria-label': 'Plateau des portraits' }, liste);
      }

      function boutonAide(fn) {
        return cible('aide', el('button', { type: 'button', class: 'btn qsc-aide', onclick: action(fn) }, '💡 Aidez-moi'));
      }

      function actions(e) {
        const section = el('section', { class: 'panneau qsc-actions', 'aria-labelledby': 'qsc-titre-actions' });
        const ajouter = (...x) => section.append(...x.filter(n => n != null && n !== false));
        const titre = texte => el('h2', { id: 'qsc-titre-actions' }, texte);
        const phase = partie.phase;

        if (phase === PHASES.QUESTION) {
          const v = questionsVisibles(partie);
          if (!v.total) {
            // Anomalie de données : plusieurs candidats mais aucune question pour les départager.
            console.error('Qui se cache ? : aucune question utile', [...e.candidats]);
            const retour = el('button', { type: 'button', class: 'btn btn-primaire', onclick: () => { if (JS.UI.naviguer) JS.UI.naviguer('jeu/qui-se-cache'); } }, 'Revenir au choix des niveaux');
            cibles.set('repli', retour);
            ajouter(titre('Enquête impossible'),
              el('p', null, 'Les portraits restants ne peuvent pas être départagés. Cette partie ne sera pas comptée.'), retour);
            return section;
          }
          const boutons = v.questions.map(q => cible('question-' + q.id, el('button', {
            type: 'button',
            class: 'btn btn-choix qsc-question' + (q.id === e.conseillee ? ' qsc-conseillee' : ''),
            onclick: action(() => choisirQuestion(q.id))
          }, q.id === e.conseillee ? el('span', { class: 'qsc-conseil' }, '💡 Conseillée') : null, el('span', null, q.texte))));
          if (boutons[0]) cibles.set('repli', boutons[0]);
          const trouve = cible('trouve', el('button', {
            type: 'button', class: 'btn', disabled: !e.posees.length, onclick: action(ouvrirLaProposition)
          }, '🔎 J’ai trouvé'));
          ajouter(
            titre('Choisir une question'),
            el('p', null, 'Cherchez une question qui sépare les portraits en deux groupes aussi équilibrés que possible.'),
            el('div', { class: 'qsc-questions', role: 'group', 'aria-label': 'Questions possibles' }, boutons),
            v.pages > 1 ? el('p', { class: 'texte-doux qsc-pages' }, 'Questions ' + (v.page * PAR_PAGE + 1) + ' à '
              + Math.min(v.total, v.page * PAR_PAGE + PAR_PAGE) + ' sur ' + v.total) : null,
            el('div', { class: 'ligne-boutons' },
              v.pages > 1 ? cible('autres', el('button', {
                type: 'button', class: 'btn', onclick: action(() => { if (autresQuestions(partie).ok) rendre('autres'); })
              }, '🔄 Autres questions')) : null,
              boutonAide(demanderAideQuestion),
              trouve),
            !e.posees.length ? el('p', { class: 'texte-doux qsc-note' }, '« J’ai trouvé » sera disponible après une première question.') : null
          );
          return section;
        }

        if (phase === PHASES.ELIMINATION) {
          const valider = cible('valider', el('button', { type: 'button', class: 'btn btn-primaire btn-grand', onclick: action(validerChoix) }, '✔ Valider mes choix'));
          cibles.set('repli', valider);
          ajouter(
            titre('Écarter ces portraits'),
            el('p', { class: 'qsc-reponse ' + (e.derniere.reponse ? 'qsc-oui' : 'qsc-non') },
              el('span', { class: 'qsc-pastille', 'aria-hidden': 'true' }, e.derniere.reponse ? '✔' : '✖'), ' ', e.derniere.phrase),
            el('p', null, 'Touchez les portraits qui ne correspondent pas à cette réponse. Un second toucher annule le choix. Rien n’est définitif avant de valider.'),
            el('p', { class: 'qsc-compte' }, 'Sélection : ' + pluriel(e.selection.size, 'portrait') + ' à écarter.'),
            el('div', { class: 'ligne-boutons' }, valider, boutonAide(demanderAideElimination))
          );
          return section;
        }

        if (phase === PHASES.PROPOSITION) {
          const nom = e.proposition ? nomDe(partie, e.proposition) : null;
          const proposer = nom ? cible('proposer', el('button', { type: 'button', class: 'btn btn-primaire btn-grand', onclick: action(confirmer) }, '✔ Je propose ' + nom)) : null;
          const revenir = cible('revenir', el('button', { type: 'button', class: 'btn', onclick: action(revenirEnquete) }, '◀ Revenir à l’enquête'));
          cibles.set('repli', proposer || revenir);
          ajouter(
            titre('J’ai trouvé'),
            e.candidats.size > 1 ? el('p', null, 'Plusieurs portraits restent possibles. Une bonne proposition anticipée retire ' + partie.cfg.poidsStrategie + ' points.') : null,
            el('p', null, nom ? 'Vous avez choisi ' + nom + '. Confirmez, ou touchez un autre portrait.'
              : 'Touchez le portrait de la personne que vous pensez avoir trouvée.'),
            el('div', { class: 'ligne-boutons' }, proposer, revenir, boutonAide(() => {
              annoncer(aideProposition(partie));
              rendre('aide');
            }))
          );
          return section;
        }

        // Résultat de l'enquête
        const p = partie.parId.get(e.secret);
        const r = resumeEnquete(partie, e);
        const derniere = partie.enquetes.length >= ENQUETES;
        const suite = cible('suivante', el('button', { type: 'button', class: 'btn btn-primaire btn-grand', onclick: action(suivante) },
          derniere ? 'Voir mon bilan ▶' : 'Enquête suivante ▶'));
        cibles.set('repli', suite);
        const texte = 'C’était ' + p.nom + '. ' + p.presentation;
        ajouter(
          titre('Bravo, c’est bien ' + p.nom + ' !'),
          e.validationAutomatique ? el('p', { class: 'texte-doux' }, 'Passage automatique à la suite dans 5 secondes.') : null,
          el('p', null, p.presentation),
          el('p', { class: 'texte-doux' }, 'Trouvé en ' + pluriel(r.questions, 'question') + (r.erreurs
            ? ', avec ' + pluriel(r.erreurs, 'correction') + '.' : ', sans correction.')),
          JS.Audio && JS.Audio.voixDisponible && JS.Audio.voixDisponible() ? JS.UI.boutonLecture(texte, 'Écouter la présentation') : null,
          el('div', { class: 'ligne-boutons' }, suite)
        );
        return section;
      }

      function historique(e) {
        const section = el('section', { class: 'panneau qsc-historique', 'aria-labelledby': 'qsc-titre-historique' },
          el('h2', { id: 'qsc-titre-historique' }, 'Indices obtenus'));
        if (!e.historique.length) {
          section.append(el('p', { class: 'texte-doux' }, 'Aucun indice pour l’instant. Les réponses s’afficheront ici.'));
          return section;
        }
        section.append(el('ol', { class: 'qsc-indices' }, e.historique.map(h => el('li', { class: h.type === 'question' && h.reponse ? 'qsc-oui' : 'qsc-non' },
          el('span', { class: 'qsc-pastille', 'aria-hidden': 'true' }, h.type === 'question' && h.reponse ? '✔' : '✖'),
          ' ', h.phrase))));
        return section;
      }

      /* ---------- Actions du joueur ---------- */

      function choisirQuestion(qid) {
        const res = poserQuestion(partie, qid);
        if (!res.ok) return;
        annoncer(res);
        parler(res.phrase);
        if (partie.phase === PHASES.ELIMINATION) {
          const premier = partie.enquete.plateau.find(id => !partie.enquete.ecartes.has(id));
          rendre('carte-' + premier);
        } else {
          rendre(partie.enquete.candidats.size === 1 ? 'trouve' : 'repli');
        }
      }

      function demanderAideQuestion() {
        const res = aideQuestion(partie);
        if (!res.ok) return;
        annoncer(res);
        rendre(res.question ? 'question-' + res.question : 'trouve');
      }

      function demanderAideElimination() {
        const res = aideElimination(partie);
        if (!res.ok) return;
        annoncer(res);
        rendre('valider');
      }

      function validerChoix() {
        const res = validerElimination(partie);
        if (res.erreur) {
          annoncer(res);
          if (ctx.audio && ctx.audio.erreur) ctx.audio.erreur();
          rendre('valider');
          return;
        }
        if (!res.ok) return;
        annoncer(res, 'succes');
        rendre(partie.enquete.candidats.size === 1 ? 'trouve' : 'repli');
      }

      function ouvrirLaProposition() {
        const res = ouvrirProposition(partie);
        if (!res.ok) return;
        annoncer(res);
        const premier = partie.enquete.plateau.find(id => !partie.enquete.ecartes.has(id));
        rendre('carte-' + premier);
      }

      function revenirEnquete() {
        const res = annulerProposition(partie);
        if (!res.ok) return;
        annoncer(res);
        rendre('repli');
      }

      function confirmer() {
        const res = confirmerProposition(partie);
        if (res.trouve) {
          annoncer(res, 'succes');
          if (ctx.audio && ctx.audio.succes) ctx.audio.succes();
          const p = partie.parId.get(partie.enquete.secret);
          parler(res.message + ' ' + p.presentation);
          rendre('suivante');
          if (partie.enquete.validationAutomatique) ctx.plusTard(action(suivante), 5000);
          return;
        }
        if (!res.erreur) return;
        annoncer(res);
        if (ctx.audio && ctx.audio.erreur) ctx.audio.erreur();
        rendre(partie.enquete.candidats.size === 1 ? 'trouve' : 'repli');
      }

      function suivante() {
        const res = enqueteSuivante(partie);
        taire();
        if (res.termine) {
          termine = true;
          ctx.terminer(res.bilan);
          return;
        }
        if (!res.ok) {
          if (res.erreur === 'plateau') afficherAnomalie();
          return;
        }
        ctx.message('Nouvelle enquête : ' + pluriel(partie.enquete.plateau.length, 'portrait') + '. Choisissez une première question.', 'info');
        if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
        rendre('repli', true);
      }

      ctx.message('Une personnalité se cache parmi ces ' + partie.enquete.plateau.length + ' portraits. Choisissez une première question.', 'info');
      rendre('repli', true);

      return () => {
        termine = true;
        taire();
      };
    }
  });
})();
