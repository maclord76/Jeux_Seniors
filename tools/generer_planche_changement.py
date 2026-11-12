"""Découpe les 25 zones contextualisées d'une scène et leur planche 5 × 5."""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SCENES = {
    "cuisine": {
        "sortie": ROOT / "img" / "changement-cuisine",
        "reference": ROOT / "img" / "scene-cuisine-exemple-v3.png",
        "zones": [
            ("fruit", (620, 455, 755, 610)),
            ("tasse", (745, 425, 915, 565)),
            ("assiette", (355, 465, 635, 610)),
            ("torchon", (900, 325, 1185, 630)),
            ("arrosoir", (1250, 585, 1536, 835)),
        ],
    },
    "salon": {
        "sortie": ROOT / "img" / "changement-salon",
        "reference": ROOT / "img" / "changement-salon" / "reference.png",
        "zones": [
            ("coussin", (30, 450, 310, 700)),
            ("livre", (455, 665, 705, 810)),
            ("theiere", (785, 610, 1015, 830)),
            ("vase", (1285, 325, 1515, 595)),
            ("horloge", (895, 25, 1145, 260)),
        ],
    },
    "veranda": {
        "sortie": ROOT / "img" / "changement-veranda",
        "reference": ROOT / "img" / "changement-veranda" / "reference.png",
        "zones": [
            ("bottes", (30, 670, 290, 965)),
            ("lavande", (260, 220, 490, 520)),
            ("arrosoir", (620, 640, 960, 930)),
            ("chapeau", (940, 340, 1180, 575)),
            ("nichoir", (1350, 40, 1520, 245)),
        ],
    },
    "chambre": {
        "sortie": ROOT / "img" / "changement-chambre",
        "reference": ROOT / "img" / "changement-chambre" / "reference.png",
        "zones": [
            ("lampe", (285, 290, 470, 540)),
            ("tableau", (580, 75, 1015, 355)),
            ("plaid", (470, 555, 1070, 750)),
            ("reveil", (1090, 410, 1220, 550)),
            ("chaussons", (1250, 805, 1510, 975)),
        ],
    },
    "salle-bain": {
        "sortie": ROOT / "img" / "changement-salle-bain",
        "reference": ROOT / "img" / "changement-salle-bain" / "reference.png",
        "zones": [
            ("serviette", (0, 155, 245, 650)),
            ("miroir", (285, 60, 600, 420)),
            ("savon", (525, 400, 655, 540)),
            ("tapis", (475, 790, 1120, 1000)),
            ("fougere", (1240, 300, 1536, 570)),
        ],
    },
}


def fondu_bord(taille, marge=18):
    largeur, hauteur = taille
    masque = Image.new("L", taille)
    pixels = masque.load()
    for y in range(hauteur):
        for x in range(largeur):
            facteur = min(1, (x + 1) / marge, (y + 1) / marge,
                          (largeur - x) / marge, (hauteur - y) / marge)
            pixels[x, y] = round(255 * facteur)
    return masque


def main(scene):
    configuration = SCENES[scene]
    sortie = configuration["sortie"]
    zones = configuration["zones"]
    sources = [configuration["reference"]] + [
        sortie / "sources" / f"variante-{n}.png" for n in range(1, 5)]
    sortie.mkdir(parents=True, exist_ok=True)
    images = [Image.open(path).convert("RGB") for path in sources]
    assert all(image.size == (1536, 1024) for image in images)
    planche = Image.new("RGB", (5 * 330, 5 * 350), "#f4eddd")
    dessin = ImageDraw.Draw(planche)
    police = ImageFont.truetype("arial.ttf", 20)

    for ligne, (nom, cadre) in enumerate(zones):
        x0, y0, x1, y1 = cadre
        masque = fondu_bord((x1 - x0, y1 - y0))
        for colonne, source in enumerate(images):
            zone = source.crop(cadre).convert("RGBA")
            zone.putalpha(masque)
            zone.save(sortie / f"{nom}-{colonne}.png", optimize=True)

            # La planche reste une vraie grille de 25 cases, sans redimensionner
            # les zones employées par le jeu.
            px, py = colonne * 330, ligne * 350
            dessin.rounded_rectangle((px + 4, py + 4, px + 325, py + 345),
                                     radius=10, fill="white", outline="#175668", width=2)
            dessin.text((px + 14, py + 12), f"{nom.capitalize()} · {colonne + 1}/5",
                        font=police, fill="#175668")
            aperçu = source.crop(cadre)
            aperçu.thumbnail((306, 295))
            planche.paste(aperçu, (px + (330 - aperçu.width) // 2,
                                   py + 42 + (295 - aperçu.height) // 2))

    planche.save(sortie / "planche-5x5.png", optimize=True)

    # Scènes de contrôle : chaque objet est recollé depuis sa propre zone.
    for variante in range(1, 5):
        composition = images[0].convert("RGBA")
        for nom, (x0, y0, _, _) in zones:
            composition.alpha_composite(Image.open(sortie / f"{nom}-{variante}.png"),
                                        (x0, y0))
        composition.convert("RGB").save(sortie / f"controle-{variante}.png", optimize=True)


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in SCENES:
        raise SystemExit("Usage : python generer_planche_changement.py cuisine|salon|veranda|chambre|salle-bain")
    main(sys.argv[1])
