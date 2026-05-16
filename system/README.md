# Système de jeu Deadwire - Documentation technique

## 📋 Vue d'ensemble

Section cachée du site dédiée au système de jeu de rôle Deadwire, accessible uniquement via authentification Discord.

**URL d'accès :** `https://votre-domaine.com/system/`

---

## 🔐 Configuration Discord OAuth2

### Étape 1 : Créer une application Discord

1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquer sur "New Application"
3. Nommer l'application (ex: "Deadwire RPG System")
4. Aller dans l'onglet "OAuth2"

### Étape 2 : Configurer OAuth2

1. **Client ID** : Copier votre Client ID
2. **Redirects** : Ajouter l'URL de callback :
   ```
   https://votre-domaine.com/system/callback.html
   ```
   
   Pour le développement local :
   ```
   http://localhost:8080/system/callback.html
   ```

3. **Scopes** requis :
   - `identify` : Informations de base de l'utilisateur
   - `guilds` : Liste des serveurs de l'utilisateur
   - `guilds.members.read` : Rôles de l'utilisateur sur le serveur

### Étape 3 : Obtenir les IDs nécessaires

#### Guild ID (ID du serveur Discord)
1. Activer le mode développeur dans Discord (Paramètres > Avancés > Mode développeur)
2. Clic droit sur votre serveur → Copier l'identifiant du serveur

#### Role ID pour MJ (Maître du Jeu)
1. Paramètres du serveur → Rôles
2. Clic droit sur le rôle MJ → Copier l'identifiant du rôle

### Étape 4 : Configuration du code

Éditer le fichier `system/auth.js` et remplacer les valeurs :

```javascript
const DISCORD_CONFIG = {
  clientId: 'VOTRE_CLIENT_ID_ICI',
  redirectUri: window.location.origin + '/system/callback.html',
  scope: 'identify guilds guilds.members.read',
  guildId: 'VOTRE_GUILD_ID_ICI',
  gmRoleId: 'VOTRE_GM_ROLE_ID_ICI'
};
```

---

## 🏗️ Architecture

### Structure des fichiers

```
system/
├── index.html          # Page principale
├── callback.html       # Page de callback OAuth2
├── auth.js            # Gestion de l'authentification Discord
├── system.js          # Logique de l'interface
├── system.css         # Styles personnalisés
└── README.md          # Cette documentation
```

### Flux d'authentification

```
1. Utilisateur clique "Se connecter avec Discord"
   ↓
2. Redirection vers Discord OAuth2
   ↓
3. Utilisateur autorise l'application
   ↓
4. Discord redirige vers callback.html avec access_token
   ↓
5. callback.html récupère le token et les infos utilisateur
   ↓
6. Vérification du rôle MJ sur le serveur Discord
   ↓
7. Sauvegarde de la session (localStorage)
   ↓
8. Redirection vers index.html (vue authentifiée)
```

### Gestion des rôles

- **Utilisateur standard** : Accès aux règles + gestion de ses personnages
- **MJ (Maître du Jeu)** : Accès en plus à la vue MJ avec tous les personnages

Le rôle MJ est détecté automatiquement via l'ID du rôle Discord configuré.

---

## 🗄️ Backend nécessaire

**IMPORTANT** : Le système frontend est prêt, mais nécessite un backend pour stocker les fiches personnages.

### API à implémenter

#### 1. Récupérer les personnages de l'utilisateur
```
GET /api/characters
Authorization: Bearer {discord_access_token}

Response: [
  {
    "id": "char_123",
    "name": "Nom du personnage",
    "class": "Classe",
    "level": 5,
    "hp": 45,
    "playerDiscordId": "123456789",
    "playerName": "Username",
    "data": { ... } // Données complètes du personnage
  }
]
```

#### 2. Récupérer tous les personnages (MJ uniquement)
```
GET /api/characters/all
Authorization: Bearer {discord_access_token}

Response: [
  // Même structure que ci-dessus, tous les personnages
]
```

#### 3. Créer un personnage
```
POST /api/characters
Authorization: Bearer {discord_access_token}
Content-Type: application/json

Body: {
  "name": "Nom",
  "class": "Classe",
  "data": { ... }
}

Response: {
  "id": "char_456",
  "name": "Nom",
  ...
}
```

#### 4. Mettre à jour un personnage
```
PUT /api/characters/{id}
Authorization: Bearer {discord_access_token}
Content-Type: application/json

Body: {
  "name": "Nouveau nom",
  "data": { ... }
}
```

### Options de backend

#### Option A : Netlify Functions + Firebase/Supabase
- **Avantages** : Hébergement gratuit, facile à configurer
- **Stack** : Netlify Functions (serverless) + Firebase Firestore ou Supabase
- **Coût** : Gratuit pour usage modéré

#### Option B : Node.js + MongoDB
- **Avantages** : Plus de contrôle, performances
- **Stack** : Express.js + MongoDB Atlas
- **Coût** : ~10-20€/mois pour hébergement

#### Option C : Supabase seul
- **Avantages** : Backend complet, auth intégrée, temps réel
- **Stack** : Supabase (PostgreSQL + API REST auto-générée)
- **Coût** : Gratuit jusqu'à 500MB, puis ~25$/mois

### Sécurité backend

1. **Validation du token Discord** : Chaque requête API doit valider le token
2. **Vérification des permissions** :
   - Les utilisateurs ne peuvent modifier que leurs personnages
   - Les MJ peuvent voir tous les personnages
3. **Rate limiting** : Limiter les requêtes par utilisateur
4. **CORS** : Configurer pour accepter uniquement votre domaine

---

## 📝 Ajout de la documentation du système de jeu

### Éditer le contenu

Ouvrir `system/index.html` et modifier les sections dans `<div data-panel="rules">` :

```html
<div class="docSection" id="nouvelle-section">
  <h3 class="docSection__title">Titre de la section</h3>
  <div class="docSection__content">
    <p>Contenu...</p>
    
    <h4>Sous-titre</h4>
    <ul>
      <li>Point 1</li>
      <li>Point 2</li>
    </ul>
    
    <table>
      <thead>
        <tr>
          <th>Colonne 1</th>
          <th>Colonne 2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Valeur 1</td>
          <td>Valeur 2</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Sections suggérées

- Introduction au système
- Création de personnage (attributs, races, classes)
- Compétences et capacités
- Système de combat (initiative, actions, dégâts)
- Équipement et inventaire
- Magie/Technologie (selon l'univers)
- Progression et expérience
- Règles spéciales de l'univers Deadwire

---

## 🚀 Déploiement

### Développement local

```bash
# Avec Python
python -m http.server 8080

# Avec Node.js
npx http-server -p 8080

# Accéder à http://localhost:8080/system/
```

### Production

1. Configurer les URLs de callback Discord (domaine de production)
2. Mettre à jour `DISCORD_CONFIG.clientId` avec les vraies valeurs
3. Déployer sur votre hébergeur (GitHub Pages, Netlify, etc.)
4. Vérifier que `/system/` et `/system/callback.html` sont accessibles

---

## 🔧 Personnalisation

### Ajouter des onglets

Dans `index.html` :

```html
<!-- Ajouter un bouton -->
<button class="systemNav__btn" data-tab="nouvel-onglet">
  <i class="fa-solid fa-icon"></i> Titre
</button>

<!-- Ajouter le panel correspondant -->
<div class="systemPanel" data-panel="nouvel-onglet" style="display: none;">
  <div data-reveal>
    <h2 class="sectionTitle">Contenu</h2>
    ...
  </div>
</div>
```

### Modifier le style

Éditer `system.css` pour changer les couleurs, espacements, etc.

Les variables principales :
- Couleur accent : `rgba(255, 42, 61, ...)`
- Fond des cartes : `rgba(255, 255, 255, 0.03)`
- Bordures : `rgba(255, 255, 255, 0.08)`

---

## ⚠️ Limitations actuelles

1. **Pas de backend** : Les personnages ne sont pas sauvegardés
2. **Token expiration** : Le token Discord expire (géré avec localStorage, 7 jours)
3. **Pas de création de personnage** : Interface à implémenter selon les règles du jeu

---

## 📊 Prochaines étapes recommandées

1. ✅ Configuration Discord OAuth2
2. ✅ Test de l'authentification
3. ⏳ Rédaction de la documentation du système de jeu
4. ⏳ Choix et mise en place du backend
5. ⏳ Création du formulaire de personnage
6. ⏳ Interface d'édition de fiche
7. ⏳ Vue MJ avancée (gestion de session, dés, etc.)

---

## 🐛 Debug

### Vérifier l'authentification

Ouvrir la console navigateur :
```javascript
// Vérifier si l'utilisateur est connecté
console.log(window.discordAuth.user);

// Vérifier si l'utilisateur est MJ
console.log(window.discordAuth.isGM);

// Voir le token (ne pas partager !)
console.log(window.discordAuth.accessToken);
```

### Erreurs courantes

- **"Aucun token d'accès reçu"** : Vérifier l'URL de callback dans Discord
- **"Failed to fetch user info"** : Token expiré, se reconnecter
- **Vue MJ invisible** : Vérifier le `gmRoleId` et les rôles Discord
- **CORS errors** : Backend non configuré ou mauvaise config CORS

---

## 📞 Support

Pour toute question sur l'implémentation, vérifier :
1. Console navigateur pour les erreurs JavaScript
2. Network tab pour les erreurs d'API
3. Configuration Discord Developer Portal
4. Ce README pour la documentation

Bon jeu de rôle ! 🎲
