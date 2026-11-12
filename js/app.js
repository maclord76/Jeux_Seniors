/* Démarrage de l'application. */
(function () {
  'use strict';

  JS.Stockage.charger();
  if (!JS.Stockage.estDisponible()) document.getElementById('bandeau-stockage').hidden = false;

  // Le lien d'évitement vise le contenu principal, pas une route.
  document.querySelector('.lien-evitement').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('app').focus();
  });

  if (!location.hash) {
    history.replaceState(null, '', JS.Stockage.profilActif() ? '#/accueil' : '#/profils');
  }
  JS.UI.rendre();
})();
