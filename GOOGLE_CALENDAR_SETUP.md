# Configuration Google Calendar API

Ce guide vous explique comment obtenir votre clé API Google Calendar et configurer l'intégration automatique pour votre page programme.

## 📋 Étapes de configuration

### 1️⃣ Créer un projet Google Cloud

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Créer un projet"** en haut
4. Donnez un nom à votre projet (ex: "Deadwire Calendar")
5. Cliquez sur **"Créer"**

### 2️⃣ Activer l'API Google Calendar

1. Dans le menu de gauche, allez dans **"API et services"** → **"Bibliothèque"**
2. Recherchez **"Google Calendar API"**
3. Cliquez dessus puis sur **"Activer"**

### 3️⃣ Créer une clé API

1. Allez dans **"API et services"** → **"Identifiants"**
2. Cliquez sur **"+ Créer des identifiants"** en haut
3. Sélectionnez **"Clé API"**
4. Votre clé API s'affiche → **Copiez-la**
5. ⚠️ **Important** : Cliquez sur **"Restreindre la clé"** pour sécuriser :
   - Dans "Restrictions liées à l'application", sélectionnez **"Référents HTTP (sites web)"**
   - Ajoutez votre domaine (ex: `https://votre-site.com/*`)
   - Dans "Restrictions liées aux API", sélectionnez **"Google Calendar API"**
   - Cliquez sur **"Enregistrer"**

### 4️⃣ Obtenir l'ID de votre calendrier

#### Option A : Calendrier principal
Votre ID de calendrier principal est généralement : `votre.email@gmail.com`

#### Option B : Calendrier personnalisé
1. Ouvrez [Google Calendar](https://calendar.google.com)
2. Cliquez sur les **3 points** à côté du calendrier que vous voulez utiliser
3. Sélectionnez **"Paramètres et partage"**
4. Faites défiler jusqu'à **"Intégrer l'agenda"**
5. Copiez l'**"ID d'agenda"** (format: `xxxxx@group.calendar.google.com`)

### 5️⃣ Rendre le calendrier public (obligatoire)

⚠️ **Sans cette étape, l'API ne fonctionnera pas !**

1. Dans les paramètres du calendrier (étape 4)
2. Allez dans **"Autorisations d'accès"**
3. Cochez **"Rendre disponible publiquement"**
4. ✅ Sauvegardez

### 6️⃣ Configurer calendar.js

Ouvrez le fichier `calendar.js` et modifiez ces lignes :

```javascript
const CALENDAR_CONFIG = {
  apiKey: 'VOTRE_CLE_API_GOOGLE', // ← Remplacez par votre clé API (étape 3)
  calendarId: 'VOTRE_CALENDAR_ID@group.calendar.google.com', // ← Remplacez par votre ID (étape 4)
  maxResults: 50
};
```

**Exemple :**
```javascript
const CALENDAR_CONFIG = {
  apiKey: 'AIzaSyC1234567890abcdefghijklmnopqrstuvw',
  calendarId: 'deadwire.events@gmail.com',
  maxResults: 50
};
```

---

## 🎯 Comment ça fonctionne

### Structure des événements

Le script récupère automatiquement :
- **Titre** : Le nom de l'événement
- **Description** : Les détails de l'événement
- **Date & heure** : Début et fin
- **Jour de la semaine** : Lundi à Dimanche

### Mise à jour automatique

- ✅ Le programme affiche **toujours la semaine en cours** (du lundi au dimanche)
- ✅ Les dates se mettent à jour automatiquement chaque jour
- ✅ Les événements sont récupérés à chaque visite de la page
- ✅ Si aucun événement : affiche "Aucun événement"

### Format d'affichage

Pour chaque jour :
```
┌─────────────────────────┐
│ Ven                     │ ← Jour
│ 17 janv.                │ ← Date
│ 21h00 - 00h00          │ ← Horaires
│                         │
│ Soirée Synthwave        │ ← Titre
│ DJ Neon en live         │ ← Description
└─────────────────────────┘
```

---

## 🧪 Test

1. Ajoutez un événement dans votre Google Calendar pour cette semaine
2. Ouvrez `programme/index.html` dans votre navigateur
3. Ouvrez la console (F12) pour voir les logs
4. Les événements doivent apparaître automatiquement !

---

## ⚠️ Résolution des problèmes

### Erreur 403 : "Daily Limit for Unauthenticated Use Exceeded"
→ Votre calendrier n'est pas public (voir étape 5)

### Erreur 400 : "Invalid API Key"
→ Vérifiez que vous avez bien copié la clé API complète

### Les événements ne s'affichent pas
→ Ouvrez la console (F12) et vérifiez les messages d'erreur

### "0 événement(s) trouvé(s)"
→ Vérifiez que :
  - Votre calendrier contient des événements cette semaine
  - L'ID du calendrier est correct
  - Le calendrier est bien public

---

## 🔒 Sécurité

- ✅ La clé API est **restreinte** au domaine du site
- ✅ Seule l'API Google Calendar est autorisée
- ✅ Le calendrier est en lecture seule
- ⚠️ Ne commitez jamais votre clé API dans un repo public GitHub

### Pour protéger votre clé API (optionnel)

Si vous publiez sur GitHub, créez un fichier `calendar-config.js` :

```javascript
// calendar-config.js (à ajouter au .gitignore)
const CALENDAR_CONFIG = {
  apiKey: 'VOTRE_VRAIE_CLE',
  calendarId: 'votre.calendrier@gmail.com',
  maxResults: 50
};
```

Puis dans `calendar.js`, remplacez la section config par :
```javascript
// Supprimez la déclaration de CALENDAR_CONFIG
```

Et ajoutez dans `programme/index.html` :
```html
<script defer src="../calendar-config.js"></script>
<script defer src="../calendar.js"></script>
```

Ajoutez au `.gitignore` :
```
calendar-config.js
```

---

## 📚 Documentation

- [Google Calendar API v3](https://developers.google.com/calendar/api/v3/reference)
- [Guide officiel](https://developers.google.com/calendar/api/guides/overview)
