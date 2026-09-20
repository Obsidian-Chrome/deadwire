import os
import re
import requests
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

URL = "https://cyberpunk.fandom.com/wiki/Cyberpunk_2077_Weapons"
OUTPUT_DIR = "weapons"

os.makedirs(OUTPUT_DIR, exist_ok=True)


def clean_filename(name):
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    return name.strip()


with sync_playwright() as p:

    print("Ouverture de Fandom...")

    browser = p.chromium.launch(
        headless=False
    )

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

    print("Page chargée.")

    # Petit scroll pour forcer le chargement des images lazy-load
    page.evaluate("""
        async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 800) {
                window.scrollTo(0, y);
                await new Promise(r => setTimeout(r, 150));
            }
        }
    """)

    print("Analyse des tableaux...")

    weapons = page.evaluate("""
        () => {

            const result = [];

            const rows = document.querySelectorAll("table tr");

            for (const row of rows) {

                const img = row.querySelector("img");

                if (!img)
                    continue;

                let src =
                    img.getAttribute("data-src") ||
                    img.getAttribute("src");

                if (!src)
                    continue;

                if (!src.includes("static.wikia.nocookie.net"))
                    continue;

                const links = row.querySelectorAll("a");

                let weaponName = null;

                for (const link of links) {

                    const title = link.getAttribute("title");

                    if (title) {
                        weaponName = title;
                        break;
                    }

                }

                if (!weaponName)
                    continue;

                result.push({
                    name: weaponName,
                    url: src
                });

            }

            return result;
        }
    """)

    browser.close()


print(f"{len(weapons)} entrées trouvées.")


# Enlève les doublons
unique_weapons = {}

for weapon in weapons:

    name = weapon["name"]
    url = weapon["url"]

    if "/revision/" in url:
        url = url.split("/revision/")[0]

    unique_weapons[name] = url


print(
    f"{len(unique_weapons)} armes uniques trouvées."
)


headers = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/130 Safari/537.36"
    ),
    "Referer": URL
}


for index, (name, url) in enumerate(
    unique_weapons.items(),
    start=1
):

    filename = clean_filename(name)

    extension = os.path.splitext(
        urlparse(url).path
    )[1]

    if not extension:
        extension = ".png"

    path = os.path.join(
        OUTPUT_DIR,
        filename + extension
    )

    print(
        f"[{index}/{len(unique_weapons)}] "
        f"{name}"
    )

    try:

        response = requests.get(
            url,
            headers=headers,
            timeout=30
        )

        response.raise_for_status()

        with open(path, "wb") as f:
            f.write(response.content)

    except Exception as e:

        print(
            f"ERREUR : {name}"
        )

        print(e)


print()
print("Terminé.")
print(
    "Dossier :",
    os.path.abspath(OUTPUT_DIR)
)