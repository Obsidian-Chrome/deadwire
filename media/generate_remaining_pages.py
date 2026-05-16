# -*- coding: utf-8 -*-
"""
Génère toutes les pages restantes avec leur contenu complet
"""
import os

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
<div class="radioBar__info"><span class="radioBar__track" data-radio-title">Radio Deadwire</span></div>
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

output_dir = r'c:\Users\djago\Documents\Deadwire\system\rules'

# Lire le fichier source pour extraire le contenu
with open(r'c:\Users\djago\Documents\Deadwire\media\extracted_content.txt', 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f.readlines() if l.strip()]

print(f"📚 Contenu source: {len(lines)} lignes")
print("🚀 Génération de toutes les pages...")

# CRÉATION DE FICHE
creation_content = '''
<div class="docSection">
<h3 class="docSection__title">Création de fiche</h3>
<div class="docSection__content">

<h4>Infos de base</h4>
<p>Commencez par mettre un avatar puis à remplir les cases dédiées à la race, l'ethnie et la classe de votre personnage.</p>
<p>Cliquez sur le panneau "Infos" pour remplir les champs : nom, âge, taille, poids, tracking de votre XP...</p>

<h4>Particularités</h4>
<p>La particularité, c'est l'élément RP de votre personnage qui le définit. Par exemple, le guerrier de lumière a comme particularité le pouvoir de l'écho.</p>
<p>Cela peut être un élément purement roleplay comme quelque chose qui ajoute des statistiques, des points d'attributs ou de compétences... <strong>À discuter avec les MJ pour validation.</strong></p>
<p>Un personnage peut gagner des particularités supplémentaires suite à des événements précis menés par les MJ.</p>

<h4>Attributs</h4>
<p>Les attributs sont les caractéristiques emblématiques : force, dextérité, intelligence etc.</p>
<p>Ils ont leur variantes : les <strong>attributs épiques</strong>. Ils symbolisent l'affinité de votre personnage et vous octroient un nombre de réussite automatique égal au nombre de points d'attribut épique sur des jets spécifiques.</p>

<div style="background:rgba(255,42,61,0.08);padding:16px;border-radius:8px;margin:16px 0;">
<p><strong>Répartition à la création :</strong></p>
<p>Vous avez 3 catégories : <strong>Physique, Social, Mental</strong>.</p>
<p>Choisir où mettre <strong>8 points</strong>, où mettre <strong>6 points</strong> et où mettre <strong>4 points</strong>.</p>
<p>Exemple : 8 points en physique, 6 en social, 4 en mental.</p>
</div>

<p>Choisissez 3 attributs que votre personnage <strong>maîtrise</strong> (dépenser de l'XP dedans coûtera moins cher et vous commencerez avec 1 point d'attribut épique dans ceux-ci).</p>
<p>Répartissez les points dans les attributs. Par défaut, les attributs commencent à 1 donc ne prenez pas en compte ce premier point.</p>
<p><strong>À la création :</strong> Maximum 4 points d'attributs et 2 points d'attribut épique.</p>

<h4>Compétences</h4>
<p>Choisissez 4 compétences que votre personnage <strong>maîtrise</strong> (dépenser de l'XP dedans coûtera moins cher).</p>
<p>Répartissez <strong>25 points de compétence</strong>. Votre personnage commence à 0 et peut monter jusqu'à 5 maximum.</p>
<p><strong>À la création :</strong> Maximum 3 points dans une même compétence.</p>

<h4>Talents</h4>
<p>Les talents sont des ajouts liés aux attributs épiques et/ou à votre particularité.</p>
<p>À la création, vous obtenez <strong>un talent par point d'attribut épique</strong> octroyé.</p>
<p>Seuls les talents liés à l'attribut épique augmenté peuvent être pris.</p>
<p>Il est possible de créer avec un MJ un talent custom lié à l'attribut épique, discutez-en avec.</p>

<h4>Domaines</h4>
<p>Les domaines sont des familles de sorts liés à votre classe ou particularité.</p>
<p>En général, un personnage au niveau 1 reçoit :</p>
<ul>
<li><strong>Domaine de classe lvl.2</strong></li>
<li><strong>Domaine personnel lvl.1</strong></li>
</ul>
<p>Le domaine personnel est défini avec un MJ et monte en même temps que votre niveau.</p>

<h4>Équipement</h4>
<p>Par défaut, un personnage niveau 1 commence avec son <strong>arme de classe</strong> et une <strong>armure liée</strong>.</p>

<h4>Et maintenant ?</h4>
<p>Vous avez accès à <strong>10 points d'expérience</strong> à dépenser à la fin de votre création de fiche.</p>
<p>Vous pouvez dépenser <strong>exceptionnellement</strong> ceux-ci comme si vous étiez niveau 2.</p>
</div>
</div>
'''

# XP & NIVEAUX
xp_content = '''
<div class="docSection">
<h3 class="docSection__title">Barème des niveaux</h3>
<div class="docSection__content">
<p>Votre personnage obtiendra de l'XP dans des événements ou autres aspects dictés par les MJ.</p>
<p>L'<strong>XP à dépenser</strong> se dépense en suivant le barème de dépense.</p>
<p>L'<strong>XP total</strong> permettra de définir votre niveau.</p>

<table style="width:100%;margin:20px 0;">
<thead>
<tr><th>Niveau</th><th>XP Total requis</th></tr>
</thead>
<tbody>
<tr><td><strong>Niveau 1</strong></td><td>À la création de fiche</td></tr>
<tr><td><strong>Niveau 2</strong></td><td>10 XP Total</td></tr>
<tr><td><strong>Niveau 3</strong></td><td>25 XP Total</td></tr>
<tr><td><strong>Niveau 4</strong></td><td>45 XP Total</td></tr>
<tr><td><strong>Niveau 5</strong></td><td>70 XP Total</td></tr>
<tr><td><strong>Niveau 6</strong></td><td>115 XP Total</td></tr>
<tr><td><strong>Niveau 7</strong></td><td>170 XP Total</td></tr>
<tr><td><strong>Niveau 8</strong></td><td>235 XP Total</td></tr>
<tr><td><strong>Niveau 9</strong></td><td>310 XP Total</td></tr>
<tr><td><strong>Niveau 10</strong></td><td>400 XP Total</td></tr>
</tbody>
</table>

<p>En tout, un personnage aura <strong>410 XP à dépenser</strong> (les 10 points de fin de création ne comptent pas).</p>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Barème de dépense d'XP</h3>
<div class="docSection__content">
<p>En dépensant de l'XP, vous pourrez monter jusqu'à <strong>10 points d'attributs maximum</strong> sans restriction.</p>
<p>Vous ne pourrez pas dépasser votre niveau en point d'attribut épique.</p>
<p>Vous pourrez monter jusqu'à <strong>5 points de compétences maximum</strong> sans restriction.</p>

<table style="width:100%;margin:20px 0;">
<thead>
<tr><th>Amélioration</th><th>Coût en XP</th></tr>
</thead>
<tbody>
<tr><td><strong>+1 pt d'attribut</strong></td><td>5 XP</td></tr>
<tr><td><strong>+1 pt d'attribut épique</strong></td><td>6 XP (ou 5 XP si maîtrisé)<br/><small>Ne doit pas dépasser votre niveau</small></td></tr>
<tr><td><strong>+1 pt de compétence</strong></td><td>3 XP (ou 2 XP si maîtrisé)</td></tr>
</tbody>
</table>

<h4>Domaine (ne doit pas dépasser votre niveau)</h4>
<table style="width:100%;margin:20px 0;">
<thead>
<tr><th>Progression</th><th>Coût en XP</th></tr>
</thead>
<tbody>
<tr><td>0 à 1</td><td>1 XP</td></tr>
<tr><td>1 à 2</td><td>1 XP</td></tr>
<tr><td>2 à 3</td><td>2 XP</td></tr>
<tr><td>3 à 4</td><td>3 XP</td></tr>
<tr><td>4 à 5</td><td>4 XP</td></tr>
<tr><td>5 à 6</td><td>5 XP</td></tr>
<tr><td>6 à 7</td><td>6 XP</td></tr>
<tr><td>7 à 8</td><td>7 XP</td></tr>
<tr><td>8 à 9</td><td>8 XP</td></tr>
<tr><td>9 à 10</td><td>9 XP</td></tr>
</tbody>
</table>
</div>
</div>
'''

# TRANSCENDANCE
transcendance_content = '''
<div class="docSection">
<h3 class="docSection__title">Transcendance</h3>
<div class="docSection__content">
<p>La transcendance est une mécanique similaire à celle de FFXIV où le personnage peut dépasser ses limites avec un contrecoup derrière.</p>

<p>Un PJ peut avoir jusqu'à <strong>3 techniques</strong>. Toutes les trois sont régies par la barre de transcendance et l'utilisation de ces techniques videra celle-ci.</p>
<p>Plus la technique est puissante, plus il faudra que la jauge soit pleine.</p>

<h4>Remplir la jauge</h4>
<p>Remplir la jauge nécessite de :</p>
<ul>
<li>Toucher un ennemi</li>
<li>Soigner / supporter un allié</li>
<li>Prendre des dégâts</li>
</ul>
<p>À chaque fois qu'une action de ce type est faite / subie, cliquez sur le + à côté de la jauge.</p>

<h4>Malus de Transcendance</h4>
<p>Quand un PJ consomme sa transcendance, il aura un <strong>malus à tous ses jets</strong> pour le restant de la scène :</p>

<div style="background:rgba(255,42,61,0.08);padding:16px;border-radius:8px;margin:16px 0;">
<ul>
<li><strong>Transcendance 1</strong> : -1 partout</li>
<li><strong>Transcendance 2</strong> : -3 partout</li>
<li><strong>Transcendance 3</strong> : -5 partout</li>
</ul>
</div>

<h4>Déblocage</h4>
<p>Les trois paliers de transcendance se débloquent au <strong>niveau 3, 6 et 9</strong>.</p>
</div>
</div>
'''

# ÉQUIPEMENT
equipement_content = '''
<div class="docSection">
<h3 class="docSection__title">Équipement</h3>
<div class="docSection__content">

<h4>Armure</h4>
<table style="width:100%;margin:20px 0;">
<thead>
<tr><th>Type</th><th>Armure</th></tr>
</thead>
<tbody>
<tr><td>Armure légère</td><td>1</td></tr>
<tr><td>Armure intermédiaire</td><td>2</td></tr>
<tr><td>Armure lourde</td><td>3</td></tr>
<tr><td>Bouclier</td><td>2 (et donc 2 de parade aussi)</td></tr>
</tbody>
</table>

<h4>Armes</h4>
<table style="width:100%;margin:20px 0;">
<thead>
<tr><th>Type</th><th>Dégâts</th><th>Pénétration</th><th>Portée max.</th></tr>
</thead>
<tbody>
<tr><td>Épée (GLA/PLD)</td><td>5</td><td>5</td><td>3y</td></tr>
<tr><td>Hache à deux mains (MRD/GUE)</td><td>9</td><td>4</td><td>4y</td></tr>
<tr><td>Épée à deux mains (CHN)</td><td>8</td><td>5</td><td>4y</td></tr>
<tr><td>Pistolame (PSB)</td><td>5</td><td>6</td><td>3y</td></tr>
<tr><td>Arme d'hast (HAS/DRG)</td><td>5</td><td>6</td><td>4y</td></tr>
<tr><td>Faux (FCH)</td><td>10</td><td>3</td><td>4y</td></tr>
<tr><td>Cestes (PGL/MOI)</td><td>5</td><td>2</td><td>3y</td></tr>
<tr><td>Sabre (SAM)</td><td>7</td><td>7</td><td>3y</td></tr>
<tr><td>Dagues (SUR NIN)</td><td>4</td><td>6</td><td>3y</td></tr>
<tr><td>Crochets jumeaux (VPR)</td><td>5</td><td>5</td><td>3y</td></tr>
<tr><td>Arc (ARC/BRD)</td><td>4</td><td>9</td><td>25y</td></tr>
<tr><td>Arme à feu (MCH)</td><td>5</td><td>10</td><td>25y</td></tr>
<tr><td>Chakrams (DNS)</td><td>6</td><td>6</td><td>25y</td></tr>
<tr><td>Grimoire (ACN/INV/ÉRU)</td><td>2</td><td>2</td><td>3y</td></tr>
<tr><td>Rapière (MRG)</td><td>4</td><td>6</td><td>3y</td></tr>
<tr><td>Globe (AST)</td><td>2</td><td>2</td><td>25y</td></tr>
</tbody>
</table>

<p style="margin-top:16px;"><strong>Note :</strong> Les armes permettant de lancer des sorts ont leur portée liée au sort lancé. Ex : un grimoire peut permettre de tirer un sort à 25y mais le grimoire en lui-même pourrait servir à assommer quelqu'un à 3y.</p>
</div>
</div>
'''

# Sauvegarder toutes les pages
pages = {
    'creation.html': ('Création de Fiche', creation_content, 'creation'),
    'xp.html': ('XP & Niveaux', xp_content, 'xp'),
    'equipement.html': ('Équipement', equipement_content, 'equipement'),
    'transcendance.html': ('Transcendance', transcendance_content, 'transcendance'),
}

for filename, (title, content, nav_id) in pages.items():
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(get_page_template(title, content, nav_id))
    print(f"  ✅ {filename}")

print("\n✅ Pages générées avec succès !")
print("📝 Reste à générer : talents.html et classes.html (contenu volumineux)")
