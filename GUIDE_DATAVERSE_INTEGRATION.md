# 🔗 Guide d'intégration Dataverse

Votre application peut maintenant se connecter directement à **Microsoft Dataverse** dans Power Apps, sans nécessiter une API externe.

## 📋 Prérequis

- ✅ Environnement Power Apps/Dataverse
- ✅ Tables Dataverse créées (Comptes, Incidents, Environnements personnalisée)
- ✅ Permissions pour accéder à Dataverse Web API

---

## 🔧 Configuration

### Option 1: Variables d'environnement (.env)

Créez/modifiez `.env.local`:

```env
REACT_APP_DATAVERSE_ENABLED=true
REACT_APP_DATAVERSE_URL=https://your-environment.crm.dynamics.com
```

### Option 2: Configuration lors de l'importation

Une fois dans Power Apps, les variables s'auto-configurent via le contexte Xrm.

---

## 📊 Tables Dataverse requises

### 1. **Comptes (Accounts)**
Table standard Dynamics 365

| Colonne | Type | Usage |
|---------|------|-------|
| accountid | GUID | ID Client |
| name | Texte | Nom du client |
| websiteurl | URL | Site web |

### 2. **Incidents (Incidents)**
Table standard Dynamics 365

| Colonne | Type | Mapping |
|---------|------|---------|
| incidentid | GUID | ID Ticket |
| title | Texte | Titre |
| statuscode | Option | Status (1=open, 2=in-progress, 3=review, 4=done) |
| prioritycode | Option | Priorité (0=low, 1=medium, 2=high) |
| ownerid | Lookup | Assigné à |
| followupby | DateTime | Due Date |
| _customerid_value | GUID | Lié au compte |

### 3. **Environnements (Personnalisée)**
À créer manuellement

```
Nom logique: new_environment
Nom d'affichage: Environnement
```

| Colonne | Type | Description |
|---------|------|-------------|
| new_environmentid | GUID | ID unique |
| new_name | Texte | Nom (prod, uat, etc.) |
| new_buildid | Texte | Numéro de build |
| new_fixversion | Texte | Version du correctif |
| new_icon | Texte | Icône (emoji) |
| new_color | Texte | Classe CSS couleur |
| new_accountid | Lookup | Lien vers compte |

---

## 🚀 Utilisation dans le code

### Importer le service Dataverse

```typescript
import { 
  getClientsFromDataverse,
  getTicketsFromDataverse,
  getClientEnvironmentsFromDataverse 
} from '@/services/dataverse'
```

### Exemples d'utilisation

**Récupérer tous les clients:**
```typescript
const clients = await getClientsFromDataverse()
```

**Récupérer les tickets d'un client:**
```typescript
const tickets = await getTicketsFromDataverse(clientId, environment)
```

**Récupérer les environnements:**
```typescript
const envs = await getClientEnvironmentsFromDataverse(clientId)
```

---

## 🔐 Authentification dans Power Apps

Quand l'app est hébergée dans Power Apps:

1. **Authentification automatique** via le contexte Xrm
2. **Token géré** par Power Apps automatiquement
3. **Permissions** basées sur les rôles de sécurité Dataverse

### Configuration manuelle (si nécessaire)

```typescript
// Le service détecte automatiquement le contexte
if (window.Xrm) {
  // Contexte Power Apps détecté
  // Authentification automatique
}
```

---

## 📝 Migration depuis l'API externe

Si vous aviez une API externe:

**Avant (datalake.ts):**
```typescript
const url = `${DATALAKE_API_URL}/query`
```

**Après (dataverse.ts):**
```typescript
const url = `${DATAVERSE_URL}/api/data/v9.2/accounts`
```

---

## 🧪 Tester l'intégration

### 1. Vérifier la configuration

```typescript
console.log('Dataverse URL:', import.meta.env.REACT_APP_DATAVERSE_URL)
console.log('Dataverse Enabled:', import.meta.env.REACT_APP_DATAVERSE_ENABLED)
```

### 2. Vérifier la console F12

Ouvrez les outils développeur (F12) et vérifiez:
- Messages `[Dataverse]` dans la console
- Requêtes XHR vers le Dataverse Web API

### 3. Résoudre les erreurs courantes

**Erreur: "Dataverse URL not configured"**
→ Vérifiez que `REACT_APP_DATAVERSE_URL` est défini

**Erreur: 401 Unauthorized**
→ Vérifiez les permissions Dataverse de votre utilisateur

**Erreur: 403 Forbidden**
→ L'utilisateur n'a pas accès à la table. Contactez votre admin.

---

## 📚 Créer une table personnalisée

### Via Power Apps UI

1. Allez dans **Solutions**
2. Créez une **Nouvelle table**
3. Nommez-la `Environnement`
4. Ajoutez les colonnes requises
5. Publiez

### Exemple PowerShell

```powershell
# Créer une table Dataverse
New-DynamicsTable -Name "new_environment" `
  -DisplayName "Environnement" `
  -PluralName "Environnements"

# Ajouter des colonnes
Add-DynamicsColumn -TableName "new_environment" `
  -Name "new_buildid" `
  -Type "String"
```

---

## ✅ Avantages de l'intégration Dataverse

✔️ **Pas d'API externe** - Tous les données dans Dataverse  
✔️ **Authentification native** - Utilise l'auth Power Apps  
✔️ **Sécurité renforcée** - Rôles de sécurité Dataverse  
✔️ **Données en temps réel** - Sync automatique  
✔️ **Évolutif** - Fonctionne avec Dataverse à grande échelle  

---

## 🔄 Prochaines étapes

1. **Créer les tables** personnalisées dans Dataverse
2. **Configurer l'URL** Dataverse dans `.env`
3. **Activer Dataverse** (`REACT_APP_DATAVERSE_ENABLED=true`)
4. **Tester** les requêtes
5. **Déployer** la nouvelle solution

---

**Documentation Dataverse:** https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview

**Questions?** Consultez `SOLUTION_README.md` ou `GUIDE_IMPORT_POWER_APPS.md`
