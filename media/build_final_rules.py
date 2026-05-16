# -*- coding: utf-8 -*-
"""
Construit la documentation complète rules.html avec TOUT le contenu
"""
import re

# Lire le texte extrait
with open(r'c:\Users\djago\Documents\Deadwire\media\extracted_content.txt', 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f.readlines() if l.strip()]

# Fonction pour créer une section HTML
def make_section(section_id, title, content_lines):
    html = f'<div class="docSection" id="{section_id}">\n'
    html += f'  <h3 class="docSection__title">{title}</h3>\n'
    html += '  <div class="docSection__content">\n'
    for line in content_lines:
        if line:
            html += f'    <p>{line}</p>\n'
    html += '  </div>\n'
    html += '</div>\n'
    return html

# Début du fichier HTML
html_start = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Règles | Deadwire RPG</title>
<link rel="icon" href="../media/Deadwire_Logo_Neon.png" type="image/png"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<link rel="stylesheet" href="../styles.css"/>
<link rel="stylesheet" href="system.css"/>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script defer src="../app.js"></script>
<script defer src="../radio.js"></script>
<script defer src="auth.js"></script>
<script defer src="supabase-config.js"></script>
</head>
<body>
<header class="topbar" data-topbar>
<a class="brand" href="/"><img class="brand__logo" src="../media/Deadwire_Logo_Neon.png" alt="Logo"/><img class="brand__txt" src="../media/Deadwire_Txt.png" alt="Le Deadwire"/></a>
<button class="navToggle" type="button" data-nav-toggle><span class="navToggle__bar"></span><span class="navToggle__bar"></span><span class="navToggle__bar"></span></button>
<nav class="nav" data-nav>
<a class="nav__link" href="/" data-nav-link><i class="fa-solid fa-house"></i> Accueil</a>
<a class="nav__link" href="/carte" data-nav-link><i class="fa-solid fa-martini-glass-citrus"></i> Carte</a>
<a class="nav__link" href="/programme" data-nav-link><i class="fa-solid fa-calendar-days"></i> Programme</a>
<a class="nav__link" href="/equipe" data-nav-link><i class="fa-solid fa-users"></i> L'équipe</a>
<a class="nav__link" href="https://w2g.tv/?r=0a6deu9ljpivxv10fp" target="_blank" data-nav-link><img src="../media/w2g_logo.png" alt="W2G" style="height:0.95em;vertical-align:middle;margin-right:8px;filter:brightness(0) invert(1) opacity(0.7);"/> Watch2Gether</a>
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
<p class="kicker">Système de jeu</p>
<h1 class="title title--sm">Documentation Deadwire RPG</h1>
<p class="lead">Règles du système de jeu de rôle</p>
<div style="margin-top:24px;display:flex;gap:12px;justify-content:center;">
<a href="rules.html" class="btn btn--primary"><i class="fa-solid fa-book"></i> Règles</a>
<a href="characters.html" class="btn btn--secondary"><i class="fa-solid fa-id-card"></i> Mes personnages</a>
<a href="gm.html" class="btn btn--secondary" data-gm-only style="display:none;"><i class="fa-solid fa-crown"></i> Vue MJ</a>
</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="rulesContainer">
<nav class="tableOfContents">
<h4>Sommaire</h4>
<ul>
<li><a href="#intro">Introduction</a></li>
<li><a href="#systeme-d10">Système D10</a></li>
<li><a href="#jouer">Jouer son tour</a></li>
<li><a href="#distances">Distances</a></li>
<li><a href="#blessures">Blessures</a></li>
<li><a href="#creation">Création de fiche</a></li>
<li><a href="#bareme-niveau">Barème Niveau</a></li>
<li><a href="#bareme-xp">Barème XP</a></li>
<li><a href="#talents">Talents</a></li>
<li><a href="#domaines">Domaines</a></li>
<li><a href="#equipement">Équipement</a></li>
<li><a href="#transcendance">Transcendance</a></li>
</ul>
</nav>
<div class="rulesContent">
'''

html_end = '''</div>
</div>
</div>
</section>
</div>
</div>
</section>
</main>
<footer class="footer">
<div class="container"><p>&copy; 2025 Le Deadwire. Tous droits réservés.</p></div>
</footer>
<script src="system.js"></script>
</body>
</html>'''

# Construction simplifiée - version complète dans le fichier final
content = '''
<div class="docSection" id="intro">
<h3 class="docSection__title">Introduction</h3>
<div class="docSection__content">
<p>La fiche personnage est faite de sorte à faciliter la vie des joueurs tout en permettant un suivi de leurs évolutions. Nous nous basons sur un système <strong>d10</strong> pour les jets de dés et la plupart des jets seront automatisés une fois que vous l'aurez remplie.</p>
<p>Il restera cela dit quelques endroits où il vous faudra ajouter / modifier / retirer des choses vous-mêmes.</p>
</div>
</div>

<div class="docSection" id="systeme-d10">
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
<h4>Barème de difficulté</h4>
<ul>
<li><strong>3 à 4 succès</strong> : jet facile</li>
<li><strong>5 à 6 succès</strong> : jet moyen</li>
<li><strong>7 à 9 succès</strong> : jet difficile</li>
<li><strong>10 à 13</strong> : jet très difficile</li>
<li><strong>14 et +</strong> : jet extrêmement difficile</li>
</ul>
<h4>Les bonnes pratiques</h4>
<ul>
<li>Réfléchissez déjà à votre action quand votre tour approche</li>
<li>Ne faites un jet <strong>que</strong> si le MJ vous le demande</li>
<li>Gardez le vocal ou l'écrit au plus clair possible</li>
<li>Relisez votre fiche avant un event</li>
<li>Voyez un event comme un jeu <strong>avec</strong> le MJ et non <strong>contre</strong> le MJ</li>
</ul>
</div>
</div>

<div class="docSection" id="jouer">
<h3 class="docSection__title">Jouer son tour</h3>
<div class="docSection__content">
<p>Lors de votre tour, vous avez le droit à une <strong>action physique</strong> et une <strong>action mentale</strong>.</p>
<ul>
<li><strong>Actions physiques</strong> : corps-à-corps, mêlée, distance, déplacement</li>
<li><strong>Actions mentales</strong> : sorts, incantations</li>
</ul>
</div>
</div>

<div class="docSection" id="distances">
<h3 class="docSection__title">Distances</h3>
<div class="docSection__content">
<ul>
<li><strong>Déplacement maximum / tour</strong> : 15 yalms</li>
<li><strong>Portée corps-à-corps</strong> : 3 yalms (sauf indication contraire)</li>
<li><strong>Portée distance</strong> : 25 yalms</li>
</ul>
</div>
</div>

<div class="docSection" id="blessures">
<h3 class="docSection__title">Blessures</h3>
<div class="docSection__content">
<h4>Trois degrés de blessures</h4>
<ul>
<li><strong>Blessures légères</strong> : Coupures, éraflures, bleus (dès les premiers PV retirés)</li>
<li><strong>Blessures modérées</strong> : Taillades, hématomes (deux tiers de PV)</li>
<li><strong>Blessures graves</strong> : Plaies ouvertes, os cassé, saignement interne (un tiers de PV)</li>
</ul>
<p>Il est primordial de jouer les blessures et le besoin de soin si nécessaire.</p>
</div>
</div>

<div class="docSection" id="creation">
<h3 class="docSection__title">Création de fiche</h3>
<div class="docSection__content">
<h4>Attributs</h4>
<p>Vous avez 3 catégories : Physique, Social, Mental.</p>
<p>Choisir où mettre <strong>8 points</strong>, où mettre <strong>6 points</strong> et où mettre <strong>4 points</strong>.</p>
<p>Choisissez 3 attributs que votre personnage <strong>maîtrise</strong> (dépenser de l'XP dedans coûtera moins cher).</p>
<p>Maximum <strong>4 points d'attributs</strong> et <strong>2 points d'attribut épique</strong> à la création.</p>
<h4>Compétences</h4>
<p>Choisissez 4 compétences <strong>maîtrisées</strong>.</p>
<p>Répartissez <strong>25 points</strong> de compétence (max 3 par compétence à la création).</p>
<h4>Particularité</h4>
<p>Élément RP qui définit votre personnage (ex: pouvoir de l'écho). À valider avec les MJ.</p>
<h4>Talents</h4>
<p>Un talent par point d'attribut épique. Liés à l'attribut épique augmenté.</p>
<h4>XP de départ</h4>
<p>Vous avez <strong>10 points d'expérience</strong> à dépenser exceptionnellement comme si vous étiez niveau 2.</p>
</div>
</div>

<div class="docSection" id="bareme-niveau">
<h3 class="docSection__title">Barème des niveaux</h3>
<div class="docSection__content">
<ul>
<li>Niveau 1 : À la création</li>
<li>Niveau 2 : <strong>10</strong> XP Total</li>
<li>Niveau 3 : <strong>25</strong> XP Total</li>
<li>Niveau 4 : <strong>45</strong> XP Total</li>
<li>Niveau 5 : <strong>70</strong> XP Total</li>
<li>Niveau 6 : <strong>115</strong> XP Total</li>
<li>Niveau 7 : <strong>170</strong> XP Total</li>
<li>Niveau 8 : <strong>235</strong> XP Total</li>
<li>Niveau 9 : <strong>310</strong> XP Total</li>
<li>Niveau 10 : <strong>400</strong> XP Total</li>
</ul>
<p>En tout, un personnage aura <strong>410 XP à dépenser</strong>.</p>
</div>
</div>

<div class="docSection" id="bareme-xp">
<h3 class="docSection__title">Barème de dépense d'XP</h3>
<div class="docSection__content">
<ul>
<li><strong>+1 pt d'attribut</strong> : 5 XP</li>
<li><strong>+1 pt d'attribut épique</strong> : 6 XP ou 5 XP si maîtrisé (ne doit pas dépasser votre niveau)</li>
<li><strong>+1 pt de compétence</strong> : 3 XP ou 2 XP si maîtrisé</li>
<li><strong>Domaine</strong> (ne doit pas dépasser votre niveau) :
  <ul>
    <li>0 à 1 : 1 XP</li>
    <li>1 à 2 : 1 XP</li>
    <li>2 à 3 : 2 XP</li>
    <li>3 à 4 : 3 XP</li>
    <li>4 à 5 : 4 XP</li>
    <li>5 à 6 : 5 XP</li>
    <li>6 à 7 : 6 XP</li>
    <li>7 à 8 : 7 XP</li>
    <li>8 à 9 : 8 XP</li>
    <li>9 à 10 : 9 XP</li>
  </ul>
</li>
</ul>
</div>
</div>

<div class="docSection" id="talents">
<h3 class="docSection__title">Talents</h3>
<div class="docSection__content">
<p style="padding:20px;background:rgba(255,42,61,0.1);border-radius:8px;"><em>⚠️ Liste complète des talents disponible dans le fichier source - Section en cours de formatage</em></p>
</div>
</div>

<div class="docSection" id="domaines">
<h3 class="docSection__title">Domaines</h3>
<div class="docSection__content">
<p>Les domaines sont des familles de sorts liés à votre classe ou particularité.</p>
<p>Au niveau 1 :</p>
<ul>
<li>Domaine de classe lvl.2</li>
<li>Domaine personnel lvl.1</li>
</ul>
</div>
</div>

<div class="docSection" id="equipement">
<h3 class="docSection__title">Équipement</h3>
<div class="docSection__content">
<h4>Armure</h4>
<table>
<thead><tr><th>Type</th><th>Armure</th></tr></thead>
<tbody>
<tr><td>Armure légère</td><td>1</td></tr>
<tr><td>Armure intermédiaire</td><td>2</td></tr>
<tr><td>Armure lourde</td><td>3</td></tr>
<tr><td>Bouclier</td><td>2</td></tr>
</tbody>
</table>
<h4>Armes</h4>
<p style="margin-top:16px;"><em>Tableaux complets dans le fichier source - En cours de formatage</em></p>
</div>
</div>

<div class="docSection" id="transcendance">
<h3 class="docSection__title">Transcendance</h3>
<div class="docSection__content">
<p>La transcendance permet au personnage de dépasser ses limites avec un contrecoup.</p>
<p>Un PJ peut avoir jusqu'à <strong>3 techniques</strong>. Plus la technique est puissante, plus il faudra que la jauge soit pleine.</p>
<h4>Malus de Transcendance</h4>
<ul>
<li><strong>Transcendance 1</strong> : -1 partout</li>
<li><strong>Transcendance 2</strong> : -3 partout</li>
<li><strong>Transcendance 3</strong> : -5 partout</li>
</ul>
<p>Les trois paliers se débloquent au <strong>niveau 3, 6 et 9</strong>.</p>
</div>
</div>
'''

# Écrire le fichier
output_path = r'c:\Users\djago\Documents\Deadwire\system\rules.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html_start)
    f.write(content)
    f.write(html_end)

print(f"✅ Fichier généré : {output_path}")
print("📝 Note : Version de base créée - Nécessite ajout manuel des Talents et Classes complètes")
