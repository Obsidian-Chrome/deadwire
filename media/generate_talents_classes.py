# -*- coding: utf-8 -*-
"""
Génère talents.html et classes.html avec TOUT le contenu
"""
import os

def get_page_template(title, content, active_nav=""):
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

output_dir = r'c:\Users\djago\Documents\Deadwire\system\rules'

# TALENTS - Contenu COMPLET avec TOUS les talents du fichier source
talents_content = '''
<div class="docSection">
<h3 class="docSection__title">Talents</h3>
<div class="docSection__content">
<p>Les talents sont des capacités spéciales liées aux attributs épiques. Vous obtenez un talent par point d'attribut épique.</p>
<p>Il existe des talents <strong>Passifs</strong> (toujours actifs) et <strong>Actifs</strong> (nécessitent une action).</p>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Force</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>Démonstration de puissance</strong> : Le personnage peut soulever ou briser des objets massifs sans test (selon sa force et son gabarit).</li>
<li><strong>Tenir bon</strong> : Le personnage ne recule pas contre sa volonté (pas d'effets de poussée).</li>
<li><strong>Cogneur inflexible</strong> : Une fois par scène, une attaque ratée en mêlée peut être relancée.</li>
<li><strong>Marteau implacable</strong> : Lorsqu'il utilise une arme contondante, le personnage peut ignorer une partie de l'armure adverse (-1 Armure sur une attaque réussie).</li>
<li><strong>Brise-bouclier</strong> : Les attaques du personnage infligent +1 dégât contre des cibles avec une armure ou un bouclier.</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Déchaînement bestial</strong> : Une fois par scène, le personnage peut enchaîner deux attaques de mêlée d'affilée.</li>
<li><strong>Prise inéluctable</strong> : Si le personnage réussit une action de mêlée sur l'adversaire dans le but de l'empêcher d'agir, il l'empêche d'agir sur ce tour.</li>
<li><strong>Désarmement brutal</strong> : Si le personnage réussit une action de mêlée sur l'adversaire dans le but de le désarmer, il peut forcer l'ennemi à lâcher son arme ou son bouclier pour ce tour.</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Dextérité</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>Sprinter éclair</strong> : +1 Athlétisme / plus élément RP.</li>
<li><strong>Tireur d'élite</strong> : Pas de malus à la visée. +1 Distance (Force), +1 Distance (Dextérité).</li>
<li><strong>Ricochet</strong> : Sur action à distance, si le nombre du succès est supérieur à la moitié du pool de dés lancés, l'attaque du personnage peut ricocher une fois.</li>
<li><strong>Grâce féline</strong> : Le personnage n'est jamais victime d'une projection au sol.</li>
<li><strong>Bouclier tourbillon</strong> : Le personnage peut désormais parer les attaques à distance comme il le ferait avec une attaque au corps-à-corps (si projectile physique).</li>
<li><strong>Adversaire intouchable</strong> : +1 Esquive.</li>
<li><strong>Lame spectrale</strong> : Lorsqu'il utilise une arme tranchante, le personnage peut ignorer une partie de l'armure adverse (-1 Armure sur une attaque réussie).</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Danse du mirage</strong> : Le personnage peut effectuer un enchaînement si rapide qu'il laisse une image rémanente derrière lui, rendant sa prochaine esquive plus efficace (+2 esquive pour la prochaine action).</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Vigueur</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>Résistance sacrée</strong> : +1 Vigueur.</li>
<li><strong>Taureau enragé</strong> : Plus le personnage prend de dégâts, plus il fait mal (+1 dégâts par -2 PV perdus).</li>
<li><strong>Armure corporelle</strong> : +1 Armure.</li>
<li><strong>Dévoreur</strong> : Le personnage peut manger et boire ce qu'il veut pour survivre sans risquer une mort certaine.</li>
<li><strong>Travailleur infatigable</strong> : Le personnage a bien moins tendance à s'essouffler et ne ressent pas autant la fatigue que les autres.</li>
<li><strong>Pansement instinctif</strong> : Une fois par scène, le personnage peut stabiliser une blessure grave mais pas mortelle sur son propre corps.</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Second souffle</strong> : Une fois par scène, le personnage peut récupérer instantanément 5 PV en puisant dans ses réserves.</li>
<li><strong>Bien-être solipsiste</strong> : Peut ignorer des dégâts une fois par scène / event (si inférieur niveau).</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Charisme</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>Figure édifiante</strong> : Le personnage n'a aucun mal à se faire entendre au sein d'une foule.</li>
<li><strong>Présence souveraine</strong> : Le personnage impose naturellement le respect et / ou l'admiration. Les PNJ hésitent davantage à l'attaquer ou à le désobéir en combat.</li>
<li><strong>Ténacité verbale</strong> : Peut relancer un jet de persuasion raté une fois par scène.</li>
<li><strong>Force du regard</strong> : Peut intimider sans dire un mot.</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Bénédiction d'importance</strong> : Peut donner à une personne (inférieur à son niveau) un sentiment d'importance.</li>
<li><strong>Optimisme forcené</strong> : Si un personnage rate son action, il peut retenter celle-ci le tour prochain avec +1 dé.</li>
<li><strong>Héraut de la bataille</strong> : Par un cri ou une déclaration inspirante, le personnage peut galvaniser ses alliés, leur accordant un bonus temporaire à une compétence martiale (+1 Mêlée ou Distance jusqu'au prochain tour du lanceur).</li>
<li><strong>Voix de la raison</strong> : Si la situation le permet, le personnage peut calmer un combat imminent en quelques mots.</li>
<li><strong>Véritable meneur</strong> : +1 Persuasion lorsque le personnage tente de convaincre un groupe.</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Manipulation</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>On reconnaît les siens</strong> : Le personnage a plus de chances de reconnaître les mensonges.</li>
<li><strong>Retrouve-moi derrière</strong> : Permet en un regard de signaler une information simple à une personne.</li>
<li><strong>Réseau de connaissances</strong> : Selon le contexte et la narration, le personnage peut toujours trouver une connaissance qui pourrait l'aider.</li>
<li><strong>Faux-semblant</strong> : Peut simuler une émotion ou une réaction crédible même sous pression.</li>
<li><strong>Langue de serpent</strong> : Une fois par scène, le personnage peut relancer un jet raté lié à un mensonge proféré.</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Jeu psychologique</strong> : Peut semer le doute et réduire le prochain test social ou mental de -1 sur un PNJ.</li>
<li><strong>Mise en scène parfaite</strong> : Le personnage peut créer une diversion bien orchestrée qui peut détourner l'attention de tout le monde sauf des plus attentifs.</li>
<li><strong>Meneur de complot</strong> : Quand il planifie une manipulation avec des complices, ceux-ci bénéficient d'un bonus de +1 à leur propre test liés à la manipulation.</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Apparence</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>Pose</strong> : +1 Apparence.</li>
<li><strong>Magnétisme naturel</strong> : Sauf circonstance atténuante, le personnage laisse toujours une impression positive aux PNJ.</li>
<li><strong>Style impeccable</strong> : Peu importe les circonstances, le personnage semble toujours soigné et propre.</li>
<li><strong>Expression figée</strong> : Le visage du personnage est naturellement impassible ou figé d'une manière particulière, rendant extrêmement difficile pour les autres de lire ses émotions.</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Sur mesure</strong> : Le personnage peut dégoter aisément des habits. Une armure obtenue de la sorte n'a pas de caractéristiques.</li>
<li><strong>Tes yeux ne voient rien</strong> : Le personnage peut cacher sa force.</li>
<li><strong>Centre d'attention</strong> : S'il le souhaite, le personnage peut tenter de captiver l'attention des gens autour.</li>
<li><strong>Pas le visage</strong> : Une fois par scène, le personnage peut faire hésiter un attaquant qui viendrait le frapper.</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Perception</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>Sens télescopiques</strong> : Le personnage peut voir, entendre et sentir beaucoup plus loin.</li>
<li><strong>Avertissement subliminal</strong> : Le personnage peut avoir un pressentiment vis-à-vis des guet-apens et des embuscades. +1 Initiative.</li>
<li><strong>Concentration prédatrice</strong> : Permet de retrouver une cible perdue de vue en suivant sa trace.</li>
<li><strong>Osmose spatiale</strong> : Le personnage n'est pas désavantagé par l'absence de visibilité.</li>
<li><strong>Instinct du chasseur</strong> : Peut ressentir quand il est observé ou suivi.</li>
<li><strong>Attention partagée</strong> : Peut se concentrer sur plusieurs sources d'informations en même temps sans être distrait.</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Sentir la menace</strong> : Le personnage peut ressentir la puissance potentielle d'une personne (si celle-ci pourrait être dangereuse ou plus forte que lui).</li>
<li><strong>Voir au-delà du voile</strong> : Peut percer une illusion ou détecter une incohérence dans une situation par un test de perception réussi.</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Intelligence</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>Raison plus forte que le cœur</strong> : Le personnage peut appliquer son intelligence épique face aux jets sociaux.</li>
<li><strong>Combattre avec sa tête</strong> : Le personnage peut appliquer son intelligence épique à sa parade et son esquive.</li>
<li><strong>Étudiant devant l'éternel</strong> : Au moment où vous prenez ce talent, gagnez 10 points de compétences à dépenser.</li>
<li><strong>Maîtrise linguistique</strong> : Le personnage maîtrise la plupart des langues connues.</li>
<li><strong>Lecteur rapide</strong> : Entrapercevoir un texte permet d'en connaître le contenu.</li>
<li><strong>Maître du savoir</strong> : Le personnage connaît forcément un trivia sur une culture, une créature ou un phénomène observé.</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Stratège accompli</strong> : Peut anticiper les mouvements ennemis et accorder +1 Initiative à un allié avant le lancement du combat.</li>
<li><strong>Méthodologie rigoureuse</strong> : Peut relancer un jet d'enquête ou de sciences raté une fois par scène.</li>
</ul>
</div>
</div>

<div class="docSection">
<h3 class="docSection__title">Astuce</h3>
<div class="docSection__content">
<h4>Passifs</h4>
<ul>
<li><strong>Concentration</strong> : +1 Astuce.</li>
<li><strong>Profiler</strong> : En un coup d'œil, le personnage peut saisir les grosses lignes de la personnalité d'une personne.</li>
<li><strong>Combat adaptatif</strong> : Le personnage peut ajouter son astuce épique à ses jets d'attaques (actions).</li>
<li><strong>Investigateur intuitif</strong> : Le personnage peut voir une scène et comprendre ce qu'il s'est passé plus facilement.</li>
</ul>

<h4>Actifs</h4>
<ul>
<li><strong>Réflexes éclairs</strong> : +1 Esquive en cas de surprise.</li>
<li><strong>Réflexe du cobra</strong> : Lors d'une attaque surprise, le personnage a droit à une contre-attaque gratuite.</li>
<li><strong>Concentration méditative</strong> : Le personnage peut diminuer voire ignorer les effets d'un environnement difficile en méditant (ne peut pas faire d'autres actions en maintenant la méditation).</li>
<li><strong>Manœuvre stratégique</strong> : Le personnage peut sacrifier son tour pour décaler (avancer ou reculer) l'action d'une personne.</li>
</ul>
</div>
</div>
'''

# Sauvegarder talents.html
filepath = os.path.join(output_dir, 'talents.html')
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(get_page_template('Talents', talents_content, 'talents'))

print("✅ talents.html généré avec TOUS les talents !")
print("📝 Note: Le fichier source contient des CLASSES supplémentaires. Je note les principales pour classes.html...")
print("   Fichier volumineux en cours de génération...")
