/* Écran de choix, de création et d'import des joueurs. */
(function () {
  'use strict';
  const { el } = JS.UI;

  const AVATARS = ['👵', '👴', '🧓', '👩‍🦳', '👨‍🦳', '👩', '👨', '🌻', '🌹', '🌳', '🐱', '🐶', '🐦', '⛵', '🎨', '🎵', '📚', '☕'];

  const ANNEE_MIN = 1915;
  const anneeMax = () => new Date().getFullYear() - 20;

  /** Formulaire prénom + année de naissance + avatar, réutilisé par l'écran Réglages. */
  function formulaireProfil(valeurs, texteBouton, surValider) {
    let avatar = valeurs.avatar || AVATARS[0];
    const champ = el('input', { type: 'text', id: 'champ-prenom', maxlength: '30', autocomplete: 'off', value: valeurs.prenom || '' });
    const champAnnee = el('input', {
      type: 'number',
      id: 'champ-annee',
      inputmode: 'numeric',
      min: String(ANNEE_MIN),
      max: String(anneeMax()),
      placeholder: 'Par exemple 1950',
      'aria-describedby': 'aide-annee',
      value: valeurs.anneeNaissance ? String(valeurs.anneeNaissance) : ''
    });
    const boutonsAvatars = AVATARS.map(a => el('button', {
      type: 'button',
      'aria-pressed': String(a === avatar),
      'aria-label': 'Choisir l\'image ' + a,
      onclick: () => {
        avatar = a;
        boutonsAvatars.forEach(b => b.setAttribute('aria-pressed', String(b.textContent === a)));
      }
    }, a));
    const erreur = el('p', { class: 'message erreur', role: 'alert', hidden: true });

    const formulaire = el('form', {
      class: 'pile',
      onsubmit: e => {
        e.preventDefault();
        const prenom = champ.value.trim();
        if (!prenom) {
          erreur.textContent = 'Indiquez un prénom pour continuer.';
          erreur.hidden = false;
          champ.focus();
          return;
        }
        const texteAnnee = champAnnee.value.trim();
        const anneeNaissance = texteAnnee ? Number(texteAnnee) : null;
        if (texteAnnee && !(Number.isInteger(anneeNaissance) && anneeNaissance >= ANNEE_MIN && anneeNaissance <= anneeMax())) {
          erreur.textContent = 'L\'année de naissance doit être comprise entre ' + ANNEE_MIN + ' et ' + anneeMax() + ', ou laissée vide.';
          erreur.hidden = false;
          champAnnee.focus();
          return;
        }
        surValider({ prenom, avatar, anneeNaissance });
      }
    },
    el('div', null, el('label', { for: 'champ-prenom' }, 'Prénom'), champ),
    el('div', null,
      el('label', { for: 'champ-annee' }, 'Année de naissance (facultatif)'),
      champAnnee,
      el('p', { id: 'aide-annee', class: 'texte-doux' },
        'Elle sert à personnaliser certains jeux : « Quand vous aviez 20 ans… ». Elle reste enregistrée sur cet appareil.')),
    el('div', null, el('span', { class: 'etiquette', id: 'etiquette-avatar' }, el('strong', null, 'Image du joueur')),
      el('div', { class: 'choix-avatars', role: 'group', 'aria-labelledby': 'etiquette-avatar' }, boutonsAvatars)),
    erreur,
    el('div', { class: 'ligne-boutons' }, el('button', { type: 'submit', class: 'btn btn-primaire btn-grand' }, texteBouton))
    );
    return { formulaire, champ };
  }

  /** Lit un fichier de sauvegarde choisi par l'utilisateur et propose d'importer chaque joueur. */
  function importerFichier(fichier, apres) {
    const lecteur = new FileReader();
    lecteur.onload = async () => {
      let profils;
      try {
        profils = JS.Stockage.lireSauvegarde(lecteur.result);
      } catch (e) {
        JS.UI.modale('Import impossible', el('p', null, e.message));
        return;
      }
      let importes = 0;
      for (const profil of profils) {
        const existant = JS.Stockage.profils().find(p => p.prenom.toLowerCase() === profil.prenom.toLowerCase());
        if (existant) {
          const choix = await JS.UI.modale('« ' + profil.prenom + ' » existe déjà',
            el('p', null, 'Un joueur porte déjà ce prénom sur cet appareil. Que souhaitez-vous faire ?'),
            [
              { texte: 'Ne pas importer', valeur: 'ignorer' },
              { texte: 'Ajouter un nouveau joueur', valeur: 'ajouter' },
              { texte: 'Remplacer ses progrès', valeur: 'remplacer', classe: 'btn-primaire' }
            ]);
          if (!choix || choix === 'ignorer') continue;
          JS.Stockage.importerProfil(profil, choix, existant.id);
        } else {
          JS.Stockage.importerProfil(profil, 'ajouter');
        }
        importes++;
      }
      JS.UI.toast(importes ? JS.UI.pluriel(importes, 'joueur importé', 'joueurs importés') : 'Aucun joueur importé.');
      if (apres) apres();
    };
    lecteur.readAsText(fichier);
  }

  function boutonImport(apres) {
    const entree = el('input', {
      type: 'file',
      accept: '.json,application/json',
      class: 'visuellement-cache',
      onchange: e => {
        const fichier = e.target.files[0];
        if (fichier) importerFichier(fichier, apres);
        e.target.value = '';
      }
    });
    return el('span', null, entree,
      el('button', { type: 'button', class: 'btn', onclick: () => entree.click() }, '📂 Importer une sauvegarde'));
  }

  JS.UI.ecran('profils', function (racine) {
    function afficher(modeCreation) {
      racine.innerHTML = '';
      const profils = JS.Stockage.profils();
      const creation = modeCreation || !profils.length;

      racine.append(el('h1', null, profils.length ? 'Qui joue aujourd\'hui ?' : 'Bienvenue !'));

      if (!profils.length) {
        racine.append(el('p', null,
          'Ce site propose des jeux pour entretenir la mémoire, à votre rythme et sans chronomètre. ',
          'Commencez par indiquer votre prénom : vos progrès seront enregistrés sur cet appareil.'));
      }

      if (profils.length && !creation) {
        racine.append(
          el('div', { class: 'grille-profils' },
            profils.map(p => el('button', {
              class: 'carte-profil',
              onclick: () => {
                JS.Stockage.choisirProfil(p.id);
                JS.UI.naviguer('accueil');
              }
            },
            el('span', { class: 'avatar', 'aria-hidden': 'true' }, p.avatar),
            el('span', null, p.prenom),
            el('span', { class: 'texte-doux' }, JS.UI.pluriel(p.totalParties || 0, 'partie'))
            )),
            el('button', { class: 'carte-profil ajout', onclick: () => afficher(true) },
              el('span', { class: 'avatar', 'aria-hidden': 'true' }, '➕'),
              el('span', null, 'Nouveau joueur'))
          )
        );
      }

      if (creation) {
        const { formulaire, champ } = formulaireProfil({}, 'Commencer à jouer', ({ prenom, avatar, anneeNaissance }) => {
          JS.Stockage.creerProfil(prenom, avatar, anneeNaissance);
          JS.UI.naviguer('accueil');
        });
        racine.append(el('section', { class: 'panneau', 'aria-labelledby': 'titre-creation' },
          el('h2', { id: 'titre-creation' }, 'Nouveau joueur'),
          formulaire,
          profils.length ? el('div', { class: 'ligne-boutons' }, el('button', { class: 'btn btn-discret', onclick: () => afficher(false) }, '← Retour à la liste')) : null
        ));
        champ.focus();
      }

      racine.append(el('section', { class: 'panneau', 'aria-labelledby': 'titre-import' },
        el('h2', { id: 'titre-import' }, 'Changer d\'appareil ?'),
        el('p', { class: 'texte-doux' },
          'Si vous avez enregistré vos progrès dans un fichier de sauvegarde (depuis les Réglages), vous pouvez le reprendre ici.'),
        boutonImport(() => afficher(false))
      ));
    }

    afficher(false);
  });

  JS.Profils = { AVATARS, formulaireProfil, boutonImport };
})();
