# -*- coding: utf-8 -*-
"""
Génère TOUTES les pages de documentation avec TOUT le contenu du fichier source
"""
import os

# Lire le contenu extrait
with open(r'c:\Users\djago\Documents\Deadwire\media\extracted_content.txt', 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f.readlines() if l.strip()]

def get_page_template(title, content, active_nav=""):
    """Template HTML pour les sous-pages"""
    nav_buttons = f'''<a href="../rules.html" class="btn btn--sm {'btn--primary' if active_nav == 'home' else 'btn--secondary'}"><i class="fa-solid fa-home"></i> Accueil</a>
<a href="systeme.html" class="btn btn--sm {'btn--primary' if active_nav == 'systeme' else 'btn--secondary'}">Système D10</a>
<a href="creation.html" class="btn btn--sm {'btn--primary' if active_nav == 'creation' else 'btn--secondary'}">Création</a>
<a href="xp.html" class="btn btn--sm {'btn--primary' if active_nav == 'xp' else 'btn--secondary'}">XP & Niveaux</a>
<a href="talents.html" class="btn btn--sm {'btn--primary' if active_nav == 'talents' else 'btn--secondary'}">Talents</a>
<a href="classes.html" class="btn btn--sm {'btn--primary' if active_nav == 'classes' else 'btn--secondary'}">Classes</a>
<a href="equipement.html" class="btn btn--sm {'btn--primary' if active_nav == 'equipement' else 'btn--secondary'}">Équipement</a>
<a href="transcendance.html" class="btn btn--sm {'btn--primary' if active_nav == 'transcendance' else 'btn--secondary'}">Transcendance</a>'''
    
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
{nav_buttons}
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

# Générer systeme.html avec tout le contenu
systeme_content = '''
<div class="docSection">
<h3 class="docSection__title">Système D10</h3>
<div class="docSection__content">
<p>En général, il vous sera demandé de faire un jet additionnant deux choses : l'<strong>attribut</strong> et la <strong>compétence</strong>.</p>
<p>Si par exemple, votre personnage a 2 en force et 3 en athlétisme, le jet de force + athlétisme sera de <strong>5d10</strong>.</p>

<h4>Barème des réussites</h4>
<ul>
<li><strong>10</strong> : 2 réussites</li>
<li><strong>7 et +</strong> : 1 réussite</li>
<li><strong>1 à 6</strong> : 1 échec (Si vous avez un 1 sans réussite dans le jet total, c'est un échec critique)</li>
</ul>

<h4>Barème de difficulté de jet</h4>
<ul>
<li><strong>3 à 4 succès</strong> : jet facile</li>
<li><strong>5 à 6 succès</strong> : jet moyen</li>
<li><strong>7 à 9 succès</strong> : jet difficile</li>
<li><strong>10 à 13</strong> : jet très difficile</li>
<li><strong>14 et +</strong> : jet extrêmement difficile</li>
</ul>

<h4>Les bonnes pratiques</h4>
<ul>
<li>Lorsque votre tour arrive bientôt, réfléchissez déjà à votre action pour qu'au moment venu, le tout soit plus rapide.</li>
<li>Ne faites un jet <strong>que</strong> si le MJ vous le demande. Vous pouvez demander si l'action nécessite ou peut bénéficier d'un jet.</li>
<li>Gardez le vocal ou l'écrit au plus clair possible en dehors des interventions pertinentes afin de rester focus.</li>
<li>Faites bien attention à vos bonus / malus et autres aspects. Relisez votre fiche avant un event.</li>
<li>Si vous voyez un axe d'amélioration possible, le mieux est d'en discuter <strong>plus tard</strong> et non pendant l'event.</li>
<li>Voyez un event comme un jeu <strong>avec</strong> le MJ et non <strong>contre</strong> le MJ. Le but est de créer des histoires cools.</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Jouer son tour</h3>
<div class="docSection__content">
<p>Lorsque vous vous trouvez dans un combat, il vous faudra commencer par faire un jet d'initiative demandé par le MJ.</p>
<p>Ensuite, les tours vont de la plus grande à la plus petite valeur obtenue.</p>

<p>Lors de votre tour, vous avez le droit à une <strong>action physique</strong> et une <strong>action mentale</strong>.</p>

<ul>
<li><strong>Actions physiques</strong> : corps-à-corps, mêlée, distance, courir, escalader, nager, se déplacer...</li>
<li><strong>Actions mentales</strong> : sorts, incantations, ordonner...</li>
</ul>

<p>Si vous avez un doute, n'hésitez pas à demander à votre MJ.</p>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Distances</h3>
<div class="docSection__content">
<p>Pour la gestion des distances, il est nécessaire d'avoir le plugin <strong>Distance</strong> disponible directement sur Dalamud.</p>

<ul>
<li><strong>Déplacement maximum / tour</strong> : 15 yalms</li>
<li><strong>Portée corps-à-corps</strong> : 3 yalms (sauf indication contraire sur l'arme)</li>
<li><strong>Portée distance</strong> : 25 yalms</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Blessures</h3>
<div class="docSection__content">
<p>Durant les combats, il peut arriver que votre personnage prenne des dégâts. Lorsque c'est le cas, il porte une blessure qui lui permet d'avoir un indicateur de la gravité de son état.</p>

<h4>Il y a trois degrés de blessures</h4>

<div style="background:rgba(255,255,255,0.03);padding:16px;border-radius:8px;margin:12px 0;">
<p><strong>Blessures légères :</strong></p>
<p>Votre personnage a subi des blessures légères (coupures, éraflures, bleus...). Elles apparaissent dès les premiers PV retirés.</p>
</div>

<div style="background:rgba(255,255,255,0.03);padding:16px;border-radius:8px;margin:12px 0;">
<p><strong>Blessures modérées :</strong></p>
<p>Votre personnage a subi des blessures modérées (taillades, hématomes...). Elles apparaissent lorsque votre personnage n'a plus que deux tiers de PV.</p>
</div>

<div style="background:rgba(255,255,255,0.03);padding:16px;border-radius:8px;margin:12px 0;">
<p><strong>Blessures graves :</strong></p>
<p>Votre personnage a subi des blessures graves (plaies ouvertes, os cassé, saignement interne...). Elles apparaissent lorsque votre personnage n'a plus qu'un tiers de PV.</p>
</div>

<p><strong>Important :</strong> Pour des raisons de cohérence, il est primordial de jouer les blessures et le besoin de soin si nécessaire. Les blessures graves sont celles qui nécessitent le plus d'attention.</p>
</div>
</div>
'''

# Sauvegarder
output_dir = r'c:\Users\djago\Documents\Deadwire\system\rules'
with open(os.path.join(output_dir, 'systeme.html'), 'w', encoding='utf-8') as f:
    f.write(get_page_template('Système D10', systeme_content, 'systeme'))

print("✅ systeme.html généré avec contenu complet")
print("📝 Prochaines pages à générer : creation, xp, talents, classes, equipement, transcendance")
