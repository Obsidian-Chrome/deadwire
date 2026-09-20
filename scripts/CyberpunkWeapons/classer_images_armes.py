#!/usr/bin/env python3
"""Classe des images d'armes dans des sous-dossiers selon weapons.csv.

Exemple :
    python classer_images_armes.py "C:\\CyberpunkWeapons\\weapons" --csv "C:\\CyberpunkWeapons\\weapons.csv"

Par défaut, les images sont copiées dans "Classees_par_type". Utilisez
--move pour déplacer les originaux après avoir vérifié le résultat.
"""

from __future__ import annotations

import argparse
import csv
import re
import shutil
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote, urlparse


IMAGE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff", ".avif"
}


def normaliser(texte: str) -> str:
    """Normalise un nom pour comparer fichiers et armes sans accents/signes."""
    texte = unicodedata.normalize("NFKD", texte)
    texte = "".join(caractere for caractere in texte if not unicodedata.combining(caractere))
    return re.sub(r"[^a-z0-9]+", "", texte.casefold())


def nom_dossier_valide(nom: str) -> str:
    """Retire les caractères interdits dans les noms de dossiers Windows."""
    nom = re.sub(r'[<>:"/\\|?*]', "_", nom).strip(" .")
    return nom or "Type_inconnu"


def alias_depuis_lien(lien: str) -> str:
    """Transforme l'URL Fandom en alias, par exemple Kang_Tao_A-22B_Chao."""
    if not lien:
        return ""
    chemin = unquote(urlparse(lien).path)
    morceau = chemin.rsplit("/", 1)[-1].replace("_", " ")
    return morceau


def detecter_delimiteur(texte: str) -> str:
    try:
        return csv.Sniffer().sniff(texte[:4096], delimiters=",;").delimiter
    except csv.Error:
        return ","


def charger_armes(csv_path: Path) -> list[dict[str, str]]:
    texte = csv_path.read_text(encoding="utf-8-sig")
    lecteur = csv.DictReader(texte.splitlines(), delimiter=detecter_delimiteur(texte))
    champs = set(lecteur.fieldnames or [])
    requis = {"Nom", "Type d'arme"}
    manquants = requis - champs
    if manquants:
        raise ValueError(f"Colonne(s) absente(s) du CSV : {', '.join(sorted(manquants))}")

    armes = []
    for ligne in lecteur:
        nom = (ligne.get("Nom") or "").strip()
        if not nom:
            continue
        armes.append({
            "nom": nom,
            "type": (ligne.get("Type d'arme") or "").strip() or "Type inconnu",
            "lien": (ligne.get("Lien") or "").strip(),
        })
    return armes


def construire_index(armes: list[dict[str, str]]) -> tuple[dict[str, list[dict[str, str]]], list[tuple[str, dict[str, str]]]]:
    index: dict[str, list[dict[str, str]]] = defaultdict(list)
    alias: list[tuple[str, dict[str, str]]] = []

    for arme in armes:
        candidats = {arme["nom"], alias_depuis_lien(arme["lien"])}
        for candidat in candidats:
            cle = normaliser(candidat)
            if cle and arme not in index[cle]:
                index[cle].append(arme)
                alias.append((cle, arme))
    return index, alias


def trouver_arme(stem: str, index: dict[str, list[dict[str, str]]], alias: list[tuple[str, dict[str, str]]]) -> dict[str, str] | None:
    cle = normaliser(stem)
    correspondances = index.get(cle, [])
    if len(correspondances) == 1:
        return correspondances[0]

    # Secours pour un nom d'image contenant un préfixe constructeur absent du CSV,
    # ou inversement. On accepte uniquement une correspondance unique.
    candidats: dict[str, dict[str, str]] = {}
    for cle_alias, arme in alias:
        if min(len(cle), len(cle_alias)) >= 6 and (cle.startswith(cle_alias) or cle_alias.startswith(cle)):
            candidats[arme["nom"]] = arme
    return next(iter(candidats.values())) if len(candidats) == 1 else None


def choisir_destination(destination: Path, ecraser: bool) -> Path | None:
    if not destination.exists() or ecraser:
        return destination
    return None


def lister_images(source: Path, recursive: bool, destination: Path) -> list[Path]:
    parcours = source.rglob("*") if recursive else source.iterdir()
    resultat = []
    for fichier in parcours:
        if not fichier.is_file() or fichier.suffix.casefold() not in IMAGE_EXTENSIONS:
            continue
        try:
            fichier.relative_to(destination)
            continue
        except ValueError:
            pass
        resultat.append(fichier)
    return sorted(resultat, key=lambda chemin: chemin.name.casefold())


def analyser_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Classe les images d'armes selon la colonne Type d'arme de weapons.csv."
    )
    parser.add_argument("images", type=Path, help="Dossier contenant les images")
    parser.add_argument("--csv", dest="csv_path", type=Path, default=Path("weapons.csv"), help="Chemin vers weapons.csv")
    parser.add_argument("--destination", type=Path, help="Dossier de sortie (défaut : Classees_par_type dans le dossier d'images)")
    parser.add_argument("--move", action="store_true", help="Déplace les images au lieu de les copier")
    parser.add_argument("--recursive", action="store_true", help="Cherche aussi dans les sous-dossiers existants")
    parser.add_argument("--overwrite", action="store_true", help="Écrase un fichier de même nom déjà classé")
    parser.add_argument("--dry-run", action="store_true", help="Affiche les opérations sans copier ni déplacer")
    return parser.parse_args()


def main() -> int:
    args = analyser_arguments()
    source = args.images.resolve()
    csv_path = args.csv_path.resolve()
    destination = (args.destination or (source / "Classees_par_type")).resolve()

    if not source.is_dir():
        print(f"ERREUR : dossier d'images introuvable : {source}", file=sys.stderr)
        return 1
    if not csv_path.is_file():
        print(f"ERREUR : CSV introuvable : {csv_path}", file=sys.stderr)
        return 1
    if destination == source:
        print("ERREUR : le dossier de destination doit être différent du dossier source.", file=sys.stderr)
        return 1

    try:
        armes = charger_armes(csv_path)
    except (OSError, ValueError) as erreur:
        print(f"ERREUR CSV : {erreur}", file=sys.stderr)
        return 1

    index, alias = construire_index(armes)
    images = lister_images(source, args.recursive, destination)
    reconnues: set[str] = set()
    non_reconnues: list[Path] = []
    classees = 0
    deja_presentes = 0
    action = "DÉPLACER" if args.move else "COPIER"

    for image in images:
        arme = trouver_arme(image.stem, index, alias)
        if arme is None:
            non_reconnues.append(image)
            continue

        reconnues.add(arme["nom"])
        dossier_type = destination / nom_dossier_valide(arme["type"])
        cible = dossier_type / image.name
        cible_valide = choisir_destination(cible, args.overwrite)

        if cible_valide is None:
            deja_presentes += 1
            print(f"[DÉJÀ PRÉSENT] {cible}")
            continue

        print(f"[{action}] {image.name} -> {dossier_type.name}\\")
        if args.dry_run:
            classees += 1
            continue

        dossier_type.mkdir(parents=True, exist_ok=True)
        if args.move:
            shutil.move(str(image), str(cible))
        else:
            shutil.copy2(image, cible)
        classees += 1

    armes_sans_image = sorted(arme["nom"] for arme in armes if arme["nom"] not in reconnues)

    print("\nRésumé")
    print(f"  Images trouvées       : {len(images)}")
    print(f"  Images classées       : {classees}")
    print(f"  Déjà présentes        : {deja_presentes}")
    print(f"  Images non reconnues  : {len(non_reconnues)}")
    print(f"  Armes sans image      : {len(armes_sans_image)}")
    print(f"  Destination           : {destination}")

    if non_reconnues:
        print("\nImages non reconnues :")
        for image in non_reconnues:
            print(f"  - {image.name}")

    if armes_sans_image:
        print("\nArmes du CSV sans image reconnue :")
        for nom in armes_sans_image:
            print(f"  - {nom}")

    if args.dry_run:
        print("\nSimulation uniquement : aucun fichier n'a été copié ou déplacé.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
