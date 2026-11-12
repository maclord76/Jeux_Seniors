"""Prépare les portraits du jeu « Qui se cache ? » (dossier img/qui-se-cache/).

Chaque portrait est un recadrage au format 3:4 (360 × 480 px) d'une photo libre déjà présente
dans le projet et créditée dans CREDITS-PHOTOS.md (dossiers img/quiz/ et img/epoque/).
Relancer ce script régénère les fichiers à l'identique.

Paramètres par portrait : dossier source, centre horizontal (fraction de la largeur),
haut du cadre (fraction de la hauteur), largeur du cadre (fraction de la largeur, réduite si
la hauteur ne suffit pas).
"""
from pathlib import Path
from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / "img" / "qui-se-cache"
TAILLE = (360, 480)

PORTRAITS = {
    # Cinéma
    "bourvil": ("quiz", 0.5, 0.0, 1.0),
    "brigitte-bardot": ("quiz", 0.5, 0.0, 1.0),
    "louis-de-funes": ("quiz", 0.6, 0.0, 1.0),
    "jean-gabin": ("quiz", 0.5, 0.0, 1.0),
    "jean-reno": ("quiz", 0.5, 0.0, 1.0),
    "sophie-marceau": ("quiz", 0.55, 0.03, 0.8),
    "omar-sy": ("epoque", 0.5, 0.0, 1.0),
    "audrey-tautou": ("epoque", 0.5, 0.0, 1.0),
    # Chanson
    "charles-aznavour": ("quiz", 0.5, 0.02, 0.72),
    "johnny-hallyday": ("quiz", 0.5, 0.0, 1.0),
    "edith-piaf": ("quiz", 0.5, 0.0, 1.0),
    "dalida": ("quiz", 0.47, 0.0, 0.66),
    "nana-mouskouri": ("quiz", 0.5, 0.0, 1.0),
    "maurice-chevalier": ("quiz", 0.5, 0.0, 1.0),
    "georges-brassens": ("quiz", 0.56, 0.0, 1.0),
    "sylvie-vartan": ("quiz", 0.5, 0.0, 1.0),
    # Sport
    "zinedine-zidane": ("quiz", 0.5, 0.0, 1.0),
    "yannick-noah": ("quiz", 0.56, 0.0, 1.0),
    "suzanne-lenglen": ("quiz", 0.5, 0.0, 1.0),
    "teddy-riner": ("quiz", 0.5, 0.0, 1.0),
    "marie-jose-perec": ("quiz", 0.58, 0.0, 0.8),
    "raymond-poulidor": ("quiz", 0.5, 0.0, 1.0),
    "jeannie-longo": ("quiz", 0.46, 0.08, 0.55),
    "laurent-fignon": ("quiz", 0.47, 0.1, 0.7),
}


def recadrer(nom, dossier, cx, haut, largeur):
    image = Image.open(RACINE / "img" / dossier / (nom + ".jpg")).convert("RGB")
    w, h = image.size
    cw = w * largeur
    ch = cw * 4 / 3
    if ch > h * (1 - haut):
        ch = h * (1 - haut)
        cw = ch * 3 / 4
    x0 = min(max(0, cx * w - cw / 2), w - cw)
    y0 = haut * h
    boite = tuple(round(v) for v in (x0, y0, x0 + cw, y0 + ch))
    portrait = image.crop(boite).resize(TAILLE, Image.LANCZOS)
    portrait.save(SORTIE / (nom + ".jpg"), quality=86, optimize=True, progressive=True)
    return boite


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    for nom, (dossier, cx, haut, largeur) in PORTRAITS.items():
        boite = recadrer(nom, dossier, cx, haut, largeur)
        print(f"{nom:20} {dossier:6} {boite}")
    print(f"{len(PORTRAITS)} portraits dans {SORTIE}")


if __name__ == "__main__":
    main()
