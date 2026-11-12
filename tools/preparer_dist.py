from pathlib import Path
import shutil
import tempfile

RACINE = Path(__file__).resolve().parent.parent
DESTINATION = RACINE / "dist"
DOSSIERS = ("css", "js", "img", "audio")
FICHIERS = ("index.html", "CREDITS-PHOTOS.md", "CREDITS-SONS.md")


def main():
    # Préparer intégralement la distribution avant de remplacer la précédente.
    with tempfile.TemporaryDirectory(prefix="jeux-seniors-dist-", dir=RACINE) as temporaire:
        preparation = Path(temporaire) / "dist"
        preparation.mkdir()
        for nom in FICHIERS:
            shutil.copy2(RACINE / nom, preparation / nom)
        for nom in DOSSIERS:
            shutil.copytree(RACINE / nom, preparation / nom)
        if DESTINATION.exists():
            if not DESTINATION.is_dir() or DESTINATION.is_symlink():
                raise RuntimeError("dist existe mais n'est pas un dossier ordinaire")
            shutil.rmtree(DESTINATION)
        preparation.rename(DESTINATION)
    print(f"Distribution prête : {DESTINATION}")


if __name__ == "__main__":
    main()
