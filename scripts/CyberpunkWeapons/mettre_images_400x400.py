#!/usr/bin/env python3
"""Convertit en masse des images vers des PNG transparents de 400 x 400 px.

L'image est redimensionnée proportionnellement pour tenir entièrement dans le
carré, sans déformation ni découpe, puis centrée horizontalement et verticalement.
Les sous-dossiers de la source sont reproduits dans le dossier de sortie.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Pillow n'est pas installé. Lancez : pip install pillow", file=sys.stderr)
    raise SystemExit(1)


TAILLE = 400
EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff", ".avif"
}


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Redimensionne et centre récursivement des images sur un carré transparent de 400 x 400 px."
    )
    parser.add_argument("source", type=Path, help="Dossier contenant les images")
    parser.add_argument(
        "--output",
        type=Path,
        help="Dossier de sortie (défaut : NOM_DU_DOSSIER_400x400 à côté de la source)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Remplace les PNG déjà présents dans le dossier de sortie",
    )
    return parser.parse_args()


def est_dans_dossier(fichier: Path, dossier: Path) -> bool:
    try:
        fichier.relative_to(dossier)
        return True
    except ValueError:
        return False


def convertir_image(source: Path, destination: Path) -> tuple[int, int, int, int]:
    with Image.open(source) as image_ouverte:
        image = ImageOps.exif_transpose(image_ouverte).convert("RGBA")
        largeur, hauteur = image.size

        if largeur <= 0 or hauteur <= 0:
            raise ValueError("dimensions invalides")

        facteur = min(TAILLE / largeur, TAILLE / hauteur)
        nouvelle_largeur = max(1, round(largeur * facteur))
        nouvelle_hauteur = max(1, round(hauteur * facteur))

        if (nouvelle_largeur, nouvelle_hauteur) != (largeur, hauteur):
            image = image.resize(
                (nouvelle_largeur, nouvelle_hauteur),
                Image.Resampling.LANCZOS,
            )

        canevas = Image.new("RGBA", (TAILLE, TAILLE), (0, 0, 0, 0))
        x = (TAILLE - nouvelle_largeur) // 2
        y = (TAILLE - nouvelle_hauteur) // 2
        canevas.alpha_composite(image, (x, y))

        destination.parent.mkdir(parents=True, exist_ok=True)
        canevas.save(destination, format="PNG", optimize=True)

    return largeur, hauteur, nouvelle_largeur, nouvelle_hauteur


def main() -> int:
    args = arguments()
    source = args.source.resolve()

    if not source.is_dir():
        print(f"ERREUR : dossier source introuvable : {source}", file=sys.stderr)
        return 1

    sortie = (
        args.output.resolve()
        if args.output
        else source.with_name(f"{source.name}_400x400")
    )

    if sortie == source:
        print("ERREUR : le dossier de sortie doit être différent du dossier source.", file=sys.stderr)
        return 1

    images = [
        fichier
        for fichier in source.rglob("*")
        if fichier.is_file()
        and fichier.suffix.casefold() in EXTENSIONS
        and not est_dans_dossier(fichier, sortie)
    ]

    converties = 0
    ignorees = 0
    erreurs = 0

    print(f"Images trouvées : {len(images)}")
    print(f"Sortie          : {sortie}\n")

    for numero, fichier in enumerate(sorted(images), start=1):
        relatif = fichier.relative_to(source)
        destination = (sortie / relatif).with_suffix(".png")

        if destination.exists() and not args.overwrite:
            print(f"[{numero}/{len(images)}] DÉJÀ PRÉSENT : {relatif}")
            ignorees += 1
            continue

        try:
            avant_l, avant_h, apres_l, apres_h = convertir_image(fichier, destination)
            print(
                f"[{numero}/{len(images)}] {relatif} : "
                f"{avant_l}x{avant_h} -> {apres_l}x{apres_h} sur 400x400"
            )
            converties += 1
        except Exception as erreur:
            print(f"[{numero}/{len(images)}] ERREUR : {relatif} ({erreur})", file=sys.stderr)
            erreurs += 1

    print("\nTerminé")
    print(f"  Converties       : {converties}")
    print(f"  Déjà présentes   : {ignorees}")
    print(f"  Erreurs           : {erreurs}")
    print(f"  Dossier de sortie : {sortie}")
    return 1 if erreurs else 0


if __name__ == "__main__":
    raise SystemExit(main())
