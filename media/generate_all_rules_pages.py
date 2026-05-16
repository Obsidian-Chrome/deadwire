# -*- coding: utf-8 -*-
"""
Génère toutes les sous-pages de documentation avec le contenu complet
"""
import os

# Lire le contenu extrait
with open(r'c:\Users\djago\Documents\Deadwire\media\extracted_content.txt', 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f.readlines() if l.strip()]

# Template de base pour les sous-pages
def get_page_template(title, content, active_nav=""):
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title} | Deadwire RPG</title>
<link rel="icon" href="../../media/Deadwire_Logo_Neon.png" type="image/png"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<link rel="stylesheet" href="../../styles.css"/>
<link rel="stylesheet" href="../system.css"/>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script defer src="../../app.js"></script>
<script defer src="../../radio.js"></script>
<script defer src="../auth.js"></script>
<script defer src="../supabase-config.js"></script>
</head>
<body>
<header class="topbar" data-topbar>
<a class="brand" href="/"><img class="brand__logo" src="../../media/Deadwire_Logo_Neon.png" alt="Logo"/><img class="brand__txt" src="../../media/Deadwire_Txt.png" alt="Le Deadwire"/></a>
<button class="navToggle" type="button" data-nav-toggle><span class="navToggle__bar"></span><span class="navToggle__bar"></span><span class="navToggle__bar"></span></button>
<nav class="nav" data-nav>
<a class="nav__link" href="/" data-nav-link><i class="fa-solid fa-house"></i> Accueil</a>
<a class="nav__link" href="/carte" data-nav-link><i class="fa-solid fa-martini-glass-citrus"></i> Carte</a>
<a class="nav__link" href="/programme" data-nav-link><i class="fa-solid fa-calendar-days"></i> Programme</a>
<a class="nav__link" href="/equipe" data-nav-link><i class="fa-solid fa-users"></i> L'équipe</a>
<a class="nav__link" href="https://w2g.tv/?r=0a6deu9ljpivxv10fp" target="_blank" data-nav-link><img src="../../media/w2g_logo.png" alt="W2G" style="height:0.95em;vertical-align:middle;margin-right:8px;filter:brightness(0) invert(1) opacity(0.7);"/> Watch2Gether</a>
<a class="nav__link" href="https://discord.gg/QC6CEGcpgq" target="_blank" data-nav-link><i class="fa-brands fa-discord"></i> Discord</a>
</nav>
<div class="userInfo" data-user-info style="display:none;">
<img class="userInfo__avatar" data-user-avatar alt="Avatar"/>
<span class="userInfo__name" data-user-name></span>
<button class="userInfo__logout" data-logout>Déconnexion</button>
</div>
<div class="radioBar" data-radio-bar>
<button class="radioBar__toggle" data-radio-toggle><i class="fa-solid fa-chevron-left"></i></button>
<button class="radioBar__play" data-radio-play><i class="fa-solid fa-play"></i></button>
<div class="radioBar__info"><span class="radioBar__track" data-radio-title>Radio Deadwire</span></div>
<div class="radioBar__volume"><input type="range" min="0" max="1" step="0.01" value="0.2" data-radio-volume/></div>
</div>
</header>
<main>
<section class="hero">
<div class="hero__bg"></div>
<div class="hero__content">
<div class="authGate" data-auth-gate>
<div class="authGate__content">
<i class="fa-solid fa-dice-d20" style="font-size:4em;margin-bottom:24px;color:rgba(255,42,61,0.8);"></i>
<h1 class="title title--sm">Système de jeu Deadwire</h1>
<p class="lead" style="max-width:600px;margin:24px auto;">Connectez-vous avec Discord pour accéder à la documentation.</p>
<button class="btn btn--primary" data-discord-login><i class="fa-brands fa-discord"></i> Se connecter avec Discord</button>
</div>
</div>
<div class="systemContent" data-system-content style="display:none;">
<section class="pageHero">
<div class="container">
<p class="kicker">Documentation</p>
<h1 class="title title--sm">{title}</h1>
<div style="margin-top:24px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
<a href="../rules.html" class="btn btn--sm {'btn--primary' if active_nav == 'home' else 'btn--secondary'}"><i class="fa-solid fa-home"></i> Accueil</a>
<a href="systeme.html" class="btn btn--sm {'btn--primary' if active_nav == 'systeme' else 'btn--secondary'}">Système D10</a>
<a href="creation.html" class="btn btn--sm {'btn--primary' if active_nav == 'creation' else 'btn--secondary'}">Création</a>
<a href="xp.html" class="btn btn--sm {'btn--primary' if active_nav == 'xp' else 'btn--secondary'}">XP & Niveaux</a>
<a href="talents.html" class="btn btn--sm {'btn--primary' if active_nav == 'talents' else 'btn--secondary'}">Talents</a>
<a href="classes.html" class="btn btn--sm {'btn--primary' if active_nav == 'classes' else 'btn--secondary'}">Classes</a>
<a href="equipement.html" class="btn btn--sm {'btn--primary' if active_nav == 'equipement' else 'btn--secondary'}">Équipement</a>
<a href="transcendance.html" class="btn btn--sm {'btn--primary' if active_nav == 'transcendance' else 'btn--secondary'}">Transcendance</a>
</div>
</div>
</section>
<section class="section">
<div class="container" style="max-width:1200px;">
{content}
</div>
</section>
</div>
</div>
</section>
</main>
<footer class="footer">
<div class="container"><p>&copy; 2025 Le Deadwire. Tous droits réservés.</p></div>
</footer>
<script src="../system.js"></script>
</body>
</html>'''

# Créer le dossier rules
os.makedirs(r'c:\Users\djago\Documents\Deadwire\system\rules', exist_ok=True)

print("✅ Dossier rules/ créé")
print("🚀 Génération des pages en cours...")

# Je vais générer les pages avec le contenu structuré du fichier extrait
# Pour l'instant, créer des placeholders qui seront remplis

pages = {
    'systeme.html': ('Système D10', 'systeme'),
    'creation.html': ('Création de Fiche', 'creation'),
    'xp.html': ('XP & Niveaux', 'xp'),
    'talents.html': ('Talents', 'talents'),
    'classes.html': ('Classes', 'classes'),
    'equipement.html': ('Équipement', 'equipement'),
    'transcendance.html': ('Transcendance', 'transcendance'),
}

for filename, (title, nav_id) in pages.items():
    content = f'<div style="padding:40px;text-align:center;"><p>📝 Contenu de {title} en cours de génération...</p></div>'
    html = get_page_template(title, content, nav_id)
    
    filepath = os.path.join(r'c:\Users\djago\Documents\Deadwire\system\rules', filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"  ✓ {filename}")

print("\n✅ Structure de base créée !")
print("📌 Prochaine étape : remplir chaque page avec le contenu du fichier source")
