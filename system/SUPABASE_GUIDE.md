# Guide de configuration Supabase

## Étape 1 : Créer un compte Supabase

1. Va sur [supabase.com](https://supabase.com)
2. Clique **"Start your project"**
3. Connecte-toi avec GitHub (recommandé)

## Étape 2 : Créer un nouveau projet

1. Clique **"New Project"**
2. Configure :
   - **Organization** : Crée une nouvelle organisation (ex: "Deadwire")
   - **Name** : "deadwire-rpg" (ou autre nom)
   - **Database Password** : Génère un mot de passe fort (note-le bien !)
   - **Region** : Choisis le plus proche (ex: "West EU (Ireland)")
   - **Plan** : **Free** (0$/mois)
3. Clique **"Create new project"**
4. Attends 2-3 minutes (création de la base de données)

## Étape 3 : Récupérer les clés API

Une fois le projet créé :

1. Dans le menu de gauche, va sur **"Project Settings"** (icône engrenage)
2. Clique sur **"API"**
3. Tu verras :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** : Une longue clé qui commence par `eyJ...`

**COPIE CES DEUX VALEURS** (on en aura besoin)

## Étape 4 : Créer la table "characters"

1. Dans le menu de gauche, va sur **"SQL Editor"**
2. Clique **"New Query"**
3. Ouvre le fichier `supabase-setup.sql` que j'ai créé
4. **COPIE TOUT LE CONTENU** du fichier
5. **COLLE-LE** dans l'éditeur SQL de Supabase
6. Clique **"Run"** (en bas à droite)
7. Tu devrais voir : ✅ "Success. No rows returned"

## Étape 5 : Vérifier la table

1. Dans le menu de gauche, va sur **"Table Editor"**
2. Tu devrais voir la table **"characters"** avec les colonnes :
   - id
   - discord_user_id
   - player_name
   - name
   - class
   - level
   - hp
   - data (JSONB)
   - created_at
   - updated_at

## Étape 6 : Configurer le code

1. Ouvre le fichier `system/supabase-config.js`
2. Remplace les valeurs :

```javascript
const SUPABASE_CONFIG = {
  url: 'https://xxxxxxxxxxxxx.supabase.co',  // ← Ta Project URL
  anonKey: 'eyJhbGciOiJI...'                  // ← Ta clé anon public
};
```

3. **Sauvegarde le fichier**

## Étape 7 : Tester

1. Ouvre `http://localhost:8080/system/` (ou ton URL de production)
2. Connecte-toi avec Discord
3. Va dans l'onglet "Mes personnages"
4. Ouvre la console du navigateur (F12)
5. Tu devrais voir : "Supabase initialized"

## Vérifier que ça fonctionne

Pour tester la création d'un personnage (temporairement dans la console) :

```javascript
// Dans la console du navigateur (F12)
await window.CharacterAPI.createCharacter({
  discord_user_id: window.discordAuth.user.id,
  player_name: window.discordAuth.user.username,
  name: 'Test Personnage',
  class: 'Guerrier',
  level: 1,
  hp: 50,
  data: { force: 10, dexterite: 8 }
});
```

Si tu vois un objet JSON en retour avec un `id`, **ça marche** ! 🎉

Tu peux ensuite vérifier dans Supabase :
1. Table Editor → characters
2. Tu devrais voir ton personnage de test

## Structure de la colonne "data" (JSONB)

La colonne `data` est au format JSON et peut contenir **toutes** les informations de ta fiche personnage :

```json
{
  "attributes": {
    "force": 10,
    "dexterite": 8,
    "intelligence": 12
  },
  "skills": [
    { "name": "Combat au corps à corps", "level": 3 },
    { "name": "Piratage", "level": 5 }
  ],
  "inventory": [
    { "item": "Katana", "quantity": 1 },
    { "item": "Medkit", "quantity": 3 }
  ],
  "background": "Histoire du personnage...",
  "notes": "Notes du joueur..."
}
```

Tu peux y mettre **ce que tu veux**, c'est totalement flexible !

## Sécurité

Les politiques RLS (Row Level Security) sont configurées pour :
- ✅ Tout le monde peut **voir** tous les personnages (pour la vue MJ)
- ✅ Tout le monde peut **créer/modifier/supprimer** (contrôle fait côté Discord)

Si tu veux renforcer la sécurité plus tard, on peut ajouter l'auth Supabase en plus de Discord.

## Coûts

Avec le plan gratuit tu as :
- 500 MB de base de données
- Une fiche complète en JSON = ~5-10 KB max
- Capacité : **50,000 à 100,000 fiches** (largement suffisant)

## En cas de problème

1. Vérifie la console navigateur (F12) pour les erreurs
2. Vérifie que l'URL et la clé API sont correctes dans `supabase-config.js`
3. Vérifie que le script SQL a bien été exécuté (Table Editor)
4. Vérifie que RLS est activé sur la table

## Prochaines étapes

Une fois Supabase configuré :
1. Je vais créer l'interface de création de personnage
2. Je vais intégrer le formulaire avec tes règles de jeu
3. Les fiches seront automatiquement sauvegardées dans Supabase !

---

**Donne-moi les deux valeurs (Project URL + anon key) et je finaliserai la config !**
