# Configuration Dataverse pour JiraTrackers

## Étape 1: Obtenir l'URL de l'environnement Dataverse

1. Allez sur https://make.powerapps.com
2. En haut à droite, cliquez sur l'icône **⚙️ Settings**
3. Sélectionnez **Session details** (ou **Admin center**)
4. Vous verrez: `Environment ID` et l'URL au format:
   ```
   https://[ORG-NAME].crm.dynamics.com
   ```
5. Copiez cette URL - c'est votre `VITE_DATAVERSE_URL`

**Exemple:**
```
https://org12345.crm.dynamics.com
```

---

## Étape 2: Créer une application Azure AD

### Option A: Via Azure Portal

1. Allez sur https://portal.azure.com
2. Recherchez **Azure Active Directory**
3. Cliquez sur **App registrations** → **New registration**
4. Remplissez:
   - **Name:** `JiraTrackers-App`
   - **Redirect URI:** `https://[votre-domaine]/auth/callback`
   - Cliquez **Register**

5. Dans l'app créée, cliquez sur **Certificates & secrets**
6. **New client secret** → Copiez la **Value** (c'est votre token)

7. Copiez l'**Application (client) ID** - c'est votre `VITE_CLIENT_ID`

### Option B: Via Power Apps (Plus simple)

1. Allez sur https://make.powerapps.com
2. **Solutions** → Votre solution
3. **Settings** → **Connections**
4. Power Apps devrait gérer l'authentification automatiquement

---

## Étape 3: Créer les tables Dataverse

Dans Power Apps, créez 3 tables avec les colonnes suivantes:

### Table 1: Clients (accounts)

| Colonne | Type | Obligatoire |
|---------|------|-------------|
| Name | Text | Oui |
| Logo | Text | Non |
| Website | URL | Non |

**Données d'exemple:**
```
ID: 1, Name: "DXC Technology", Logo: "🏢"
ID: 2, Name: "Client B", Logo: "🏢"
```

### Table 2: Tickets (incidents)

| Colonne | Type | Obligatoire |
|---------|------|-------------|
| Title | Text | Oui |
| Description | Text | Non |
| Status | Choice: (open, in-progress, review, done) | Oui |
| Priority | Choice: (low, medium, high, critical) | Oui |
| Client | Lookup → Clients | Oui |
| Environment | Text | Oui |
| Fix Version | Text | Non |
| Build ID | Text | Non |
| Assignee | Text | Non |
| Due Date | Date | Non |

### Table 3: Environments (new_environments)

| Colonne | Type | Obligatoire |
|---------|------|-------------|
| Name | Text | Oui |
| Build ID | Text | Non |
| Fix Version | Text | Non |
| Icon | Text | Non |
| Color | Text | Non |
| Client | Lookup → Clients | Oui |

---

## Étape 4: Configurer le fichier .env

Mettez à jour votre `.env`:

```env
# Dataverse Configuration
VITE_DATAVERSE_ENABLED=true
VITE_DATAVERSE_URL=https://ORG-NAME.crm.dynamics.com
VITE_CLIENT_ID=your-azure-app-client-id
VITE_AUTHORITY=https://login.microsoftonline.com/common
VITE_ENV=production
```

---

## Étape 5: Ajouter les données de test

1. Dans Power Apps, allez sur **Data** → Vos tables
2. Ajoutez des clients
3. Ajoutez des environnements pour chaque client
4. Ajoutez des tickets liés aux clients

---

## Dépannage

### Erreur: "401 Unauthorized"
- Vérifiez votre `VITE_DATAVERSE_URL`
- Vérifiez que vous êtes connecté à Power Apps
- Vérifiez les permissions Azure AD

### Erreur: "404 Not Found"
- Vérifiez les noms des tables (case-sensitive)
- Vérifiez que les tables existent et contiennent des données

### Les données ne s'affichent pas
- Ouvrez la console du navigateur (F12)
- Cherchez les erreurs réseau
- Vérifiez les logs Dataverse

---

## Ressources

- [Dataverse API Documentation](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview)
- [Power Apps Dataverse](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/)
- [Azure AD Authentication](https://learn.microsoft.com/en-us/azure/active-directory/)
