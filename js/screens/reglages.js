/* Réglages du joueur : affichage, sons, objectif, profil, sauvegarde. */
(function () {
  'use strict';
  const { el } = JS.UI;

  function nomFichier(prenom) {
    const propre = JS.UI.normaliser(prenom).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'joueur';
    return 'sauvegarde-' + propre + '-' + JS.Progres.jourLocal() + '.json';
  }

  /** Groupe de boutons à choix unique (aria-pressed). */
  function groupeChoix(etiquette, options, valeur, surChoix) {
    const id = 'groupe-' + Math.random().toString(36).slice(2, 8);
    const boutons = options.map(o => el('button', {
      type: 'button',
      class: 'btn',
      'aria-pressed': String(o.valeur === valeur),
      onclick: () => {
        boutons.forEach(b => b.setAttribute('aria-pressed', 'false'));
        boutons[options.indexOf(o)].setAttribute('aria-pressed', 'true');
        surChoix(o.valeur);
      }
    }, o.texte));
    return el('div', null,
      el('p', { id }, el('strong', null, etiquette)),
      el('div', { class: 'groupe-choix', role: 'group', 'aria-labelledby': id }, boutons));
  }

  function interrupteur(texte, coche, surChange) {
    return el('label', { class: 'interrupteur' },
      el('input', { type: 'checkbox', checked: coche, onchange: e => surChange(e.target.checked) }),
      texte);
  }

  JS.UI.ecran('reglages', function (racine) {
    const profil = JS.Stockage.profilActif();
    const r = profil.reglages;

    function changer(changements) {
      JS.Stockage.modifierReglages(changements);
      JS.UI.appliquerReglages(profil.reglages);
    }

    const { formulaire } = JS.Profils.formulaireProfil(profil, 'Enregistrer', ({ prenom, avatar, anneeNaissance }) => {
      JS.Stockage.modifierProfil(profil.id, { prenom, avatar, anneeNaissance });
      JS.UI.majEntete('reglages');
      JS.UI.toast('Profil enregistré.');
    });

    const plusieurs = JS.Stockage.profils().length > 1;

    racine.append(
      el('div', { class: 'titre-page' }, el('h1', null, 'Réglages')),
      JS.Themes.selecteur(),

      el('section', { class: 'panneau pile', 'aria-labelledby': 'titre-affichage' },
        el('h2', { id: 'titre-affichage' }, 'Affichage'),
        groupeChoix('Taille du texte', [
          { texte: 'Normale', valeur: 1 },
          { texte: 'Grande', valeur: 2 },
          { texte: 'Très grande', valeur: 3 }
        ], r.taille, v => changer({ taille: v })),
        interrupteur('Contraste élevé (fond noir, texte blanc)', r.contraste, v => changer({ contraste: v }))
      ),

      el('section', { class: 'panneau pile', 'aria-labelledby': 'titre-sons' },
        el('h2', { id: 'titre-sons' }, 'Sons et voix'),
        interrupteur('Sons du jeu', r.sons, v => { changer({ sons: v }); if (v) JS.Audio.succes(); }),
        JS.Audio.voixDisponible()
          ? el('div', null,
            interrupteur('Lire les consignes à voix haute automatiquement', r.voix, v => changer({ voix: v })),
            JS.UI.boutonLecture(() => 'Bonjour ' + profil.prenom + ', voici la voix qui lira les consignes.', 'Essayer la voix'))
          : el('p', { class: 'texte-doux' }, 'La lecture à voix haute n\'est pas disponible dans ce navigateur.')
      ),

      el('section', { class: 'panneau pile', 'aria-labelledby': 'titre-partie' },
        el('h2', { id: 'titre-partie' }, 'Pendant les parties'),
        interrupteur('Afficher le temps écoulé', r.chrono, v => changer({ chrono: v })),
        el('p', { class: 'texte-doux' }, 'Le temps n\'est jamais compté contre vous : il s\'affiche seulement à titre indicatif.'),
        groupeChoix('Objectif quotidien', [
          { texte: '1 partie', valeur: 1 },
          { texte: '3 parties', valeur: 3 },
          { texte: '5 parties', valeur: 5 },
          { texte: '8 parties', valeur: 8 }
        ], r.objectifJour, v => changer({ objectifJour: v }))
      ),

      el('section', { class: 'panneau', 'aria-labelledby': 'titre-profil' },
        el('h2', { id: 'titre-profil' }, 'Mon profil'),
        formulaire
      ),

      el('section', { class: 'panneau', 'aria-labelledby': 'titre-sauvegarde' },
        el('h2', { id: 'titre-sauvegarde' }, 'Sauvegarde'),
        el('p', null, 'Vos progrès sont enregistrés dans ce navigateur. Pour les garder en lieu sûr ou les reprendre sur un autre appareil, enregistrez-les dans un fichier.'),
        el('div', { class: 'ligne-boutons' },
          el('button', {
            class: 'btn btn-primaire',
            onclick: () => {
              JS.Stockage.telecharger(JS.Stockage.exporter([profil.id]), nomFichier(profil.prenom));
              JS.UI.toast('Fichier de sauvegarde créé.');
            }
          }, '💾 Enregistrer mes progrès'),
          plusieurs ? el('button', {
            class: 'btn',
            onclick: () => {
              JS.Stockage.telecharger(JS.Stockage.exporter(), nomFichier('tous-les-joueurs'));
              JS.UI.toast('Fichier de sauvegarde créé.');
            }
          }, '💾 Enregistrer tous les joueurs') : null,
          JS.Profils.boutonImport(() => JS.UI.rendre())
        )
      ),

      el('section', { class: 'panneau', 'aria-labelledby': 'titre-joueur' },
        el('h2', { id: 'titre-joueur' }, 'Joueur'),
        el('div', { class: 'ligne-boutons' },
          el('button', { class: 'btn', onclick: () => { JS.Stockage.deconnecter(); JS.UI.naviguer('profils'); } }, '👥 Changer de joueur'),
          el('button', {
            class: 'btn btn-discret',
            onclick: async () => {
              const ok = await JS.UI.confirmer('Supprimer « ' + profil.prenom + ' » ?',
                'Tous ses progrès seront effacés de cet appareil. Pensez à enregistrer une sauvegarde avant si vous souhaitez les conserver.',
                'Oui, supprimer', 'Annuler');
              if (!ok) return;
              JS.Stockage.supprimerProfil(profil.id);
              JS.UI.toast('Joueur supprimé.');
              JS.UI.naviguer('profils');
            }
          }, '🗑️ Supprimer ce joueur')
        )
      )
    );
  });
})();
