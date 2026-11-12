/* Photos libres (mode Photos) : figure avec mention « Sur la photo » et crédit obligatoire (auteur, licence, source). */
window.JS = window.JS || {};

(function () {
  'use strict';

  function injecterStyle() {
    if (document.getElementById('style-photos')) return;
    document.head.append(JS.UI.el('style', { id: 'style-photos' }, `
      .photo-creditee { margin: 0 auto; text-align: center; max-width: 30rem; }
      .photo-creditee img { display: block; margin: 0 auto; max-width: 100%; max-height: 16rem; object-fit: contain;
        border-radius: var(--rayon); border: 2px solid var(--bord-leger); background: var(--carte); }
      .photo-creditee .photo-montre { font-weight: 700; margin: 0.4rem 0 0; }
      .photo-creditee figcaption { font-size: 0.75rem; color: var(--texte-doux); margin-top: 0.3rem; }
    `));
  }

  /** Le mode Photos est-il choisi par le joueur courant ? */
  function actif() {
    return JS.Stockage.reglages().visuels === 'photos';
  }

  /**
   * photo : { fichier, auteur, licence, source, montre? } ; alt : texte de remplacement ;
   * montre : ce que montre la photo (facultatif, sinon photo.montre).
   */
  function figure(photo, alt, montre) {
    injecterStyle();
    const el = JS.UI.el;
    const texteMontre = montre || photo.montre;
    const mention = texteMontre ? 'Sur la photo : ' + texteMontre : null;
    return el('figure', { class: 'photo-creditee' },
      el('img', { src: photo.fichier, alt: mention || alt }),
      mention ? el('p', { class: 'photo-montre' }, mention) : null,
      el('figcaption', null,
        'Photo : ' + photo.auteur + ' — ' + photo.licence + ' — ',
        el('a', { href: photo.source, target: '_blank', rel: 'noopener' }, 'Wikimedia Commons')));
  }

  JS.Photos = { actif, figure };
})();
