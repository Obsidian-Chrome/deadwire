import csv
import re
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright


URL = "https://cyberpunk.fandom.com/wiki/Cyberpunk_2077_Weapons"
CSV_FILE = "weapons.csv"


def detect_weapon_type(text):
    text = text.lower()

    types = [
        ("Precision Rifle", ["precision rifle", "precision rifles"]),
        ("Sniper Rifle", ["sniper rifle", "sniper rifles"]),
        ("Assault Rifle", ["assault rifle", "assault rifles"]),
        ("Submachine Gun", ["submachine gun", "submachine guns", "smg"]),
        ("Light Machine Gun", ["light machine gun", "light machine guns", "lmg"]),
        ("Shotgun", ["shotgun", "shotguns"]),
        ("Revolver", ["revolver", "revolvers"]),
        ("Pistol", ["pistol", "pistols"]),
        ("Katana", ["katana", "katanas"]),
        ("Knife", ["knife", "knives"]),
        ("Machete", ["machete", "machetes"]),
        ("Blade", ["blade", "blades"]),
        ("Club", ["club", "clubs"]),
        ("Hammer", ["hammer", "hammers"]),
        ("Baton", ["baton", "batons"]),
        ("Grenade", ["grenade", "grenades"]),
    ]

    for weapon_type, keywords in types:
        for keyword in keywords:
            if keyword in text:
                return weapon_type

    return ""


def detect_technology(text):
    text = text.lower()

    if re.search(r"\bpower\b", text):
        return "Power"

    if re.search(r"\btech\b", text):
        return "Tech"

    if re.search(r"\bsmart\b", text):
        return "Smart"

    return ""


def detect_iconic(text):
    text = text.lower()

    if "iconic" in text:
        return "Oui"

    return "Non"


print("Ouverture de Fandom...")

with sync_playwright() as p:

    browser = p.chromium.launch(headless=False)

    page = browser.new_page(
        viewport={
            "width": 1920,
            "height": 1080
        }
    )

    page.goto(
        URL,
        wait_until="domcontentloaded",
        timeout=120000
    )

    page.wait_for_timeout(3000)

    print("Analyse des tableaux...")

    data = page.evaluate("""
    () => {

        const weapons = [];

        const tables = document.querySelectorAll("table");

        for (const table of tables) {

            let previous = table.previousElementSibling;
            let sectionTitle = "";

            while (previous) {

                if (previous.matches("h2, h3, h4, h5")) {
                    sectionTitle = previous.innerText.trim();
                    break;
                }

                previous = previous.previousElementSibling;
            }


            const rows = table.querySelectorAll("tr");

            for (const row of rows) {

                const cells = row.querySelectorAll("td");

                if (cells.length === 0)
                    continue;


                const links = [...row.querySelectorAll("a")];

                let weaponName = null;
                let weaponLink = null;


                for (const link of links) {

                    const href = link.getAttribute("href");

                    if (!href)
                        continue;

                    if (!href.includes("/wiki/"))
                        continue;

                    if (href.includes("/wiki/File:"))
                        continue;


                    const text = link.innerText.trim();
                    const title = link.getAttribute("title");


                    if (text.length > 0) {

                        weaponName = text;
                        weaponLink = href;
                        break;

                    }

                    if (title) {

                        weaponName = title;
                        weaponLink = href;
                        break;

                    }
                }


                if (!weaponName)
                    continue;


                const rowText = row.innerText
                    .replace(/\\s+/g, " ")
                    .trim();


                weapons.push({
                    name: weaponName,
                    link: weaponLink,
                    rowText: rowText,
                    section: sectionTitle
                });
            }
        }

        return weapons;
    }
    """)

    browser.close()


print(f"{len(data)} lignes trouvées.")


weapons = {}

for item in data:

    name = item["name"].strip()

    if not name:
        continue


    link = item["link"]

    if link.startswith("/"):
        link = urljoin(URL, link)


    combined_text = (
        item["section"]
        + " "
        + item["rowText"]
    )


    weapon_type = detect_weapon_type(
        combined_text
    )

    technology = detect_technology(
        combined_text
    )

    iconic = detect_iconic(
        combined_text
    )


    weapons[link] = {
        "name": name,
        "weapon_type": weapon_type,
        "technology": technology,
        "iconic": iconic,
        "link": link
    }


weapons = list(weapons.values())


print(f"{len(weapons)} armes uniques.")


with open(
    CSV_FILE,
    "w",
    newline="",
    encoding="utf-8-sig"
) as csvfile:

    writer = csv.writer(
        csvfile,
        delimiter=";"
    )

    writer.writerow([
        "Nom",
        "Type d'arme",
        "Technologie",
        "Iconic",
        "Lien"
    ])

    for weapon in weapons:

        writer.writerow([
            weapon["name"],
            weapon["weapon_type"],
            weapon["technology"],
            weapon["iconic"],
            weapon["link"]
        ])


print()
print("Terminé.")
print(f"CSV créé : {CSV_FILE}")