# 🚀 JiraTrackers Web App - Solution Power Apps

Votre application React est maintenant prête à être déployée dans Power Apps en tant que solution web resource.

## 📦 Fichiers disponibles

| Fichier | Description |
|---------|-------------|
| `JiraTrackersApp_1.0.0_unmanaged.zip` | **Solution prête à importer** |
| `GUIDE_IMPORT_POWER_APPS.md` | Guide complet d'importation |
| `build-solution.ps1` | Script pour reconstruire la solution |

## ⚡ Démarrage rapide

### 1️⃣ Importer la solution (5 min)
```
1. Ouvrez https://make.powerapps.com
2. Solutions → Importer une solution
3. Sélectionnez JiraTrackersApp_1.0.0_unmanaged.zip
4. Cliquez sur Importer
```

### 2️⃣ Créer une page web (5 min)
```
1. Power Apps → Créer → Page Web
2. Nommez-la "JiraTrackers App"
3. Ajoutez la ressource web: jiratracker_index_html
4. Publiez
```

### 3️⃣ Accéder à l'app
Ouvrez la page web créée et commencez à utiliser l'application!

---

## 🔄 Mettre à jour l'application

Pour mettre à jour après des changements de code:

```powershell
# Reconstruire la solution
.\build-solution.ps1 -Version "1.0.1"

# Ensuite importer la nouvelle version dans Power Apps
```

---

## 📂 Structure de la solution

```
JiraTrackersApp_1.0.0_unmanaged.zip
├── solution.xml              (Manifeste de la solution)
├── customizations.xml        (Définition des ressources web)
└── Other/WebResources/       (Fichiers de l'application)
    ├── index.html
    ├── power-apps.svg
    └── assets/
        ├── index-*.js        (Bundle React)
        └── index-*.css       (Styles)
```

---

## ✅ Prérequis

- ✓ Compte Power Apps avec accès à un environnement
- ✓ Permissions pour importer des solutions
- ✓ Navigateur moderne (Chrome, Edge, Firefox)

---

## 🆘 Support

### La page est blanche
→ Consultez `GUIDE_IMPORT_POWER_APPS.md` section "Dépannage"

### Erreur lors de l'importation
→ Vérifiez que le fichier .zip n'est pas corrompu
→ Réessayez avec une version reconstruite: `.\build-solution.ps1`

### L'API ne répond pas
→ Vérifiez les paramètres dans `src/services/datalake.ts`
→ Consultez la console (F12) pour les erreurs CORS

---

## 📋 Configuration de l'API

L'application utilise les variables d'environnement suivantes:
- `REACT_APP_DATALAKE_API_URL`: URL de votre API backend
- `REACT_APP_DATALAKE_ENABLED`: Activez/désactivez la datalake

Modifiez ces valeurs dans `src/services/datalake.ts` avant de reconstruire.

---

## 🎯 Prochaines étapes recommandées

1. **Configurer l'authentification** - Intégrez MSAL pour l'authentification Azure AD
2. **Connecter votre API** - Pointez vers votre backend réel
3. **Personnaliser l'apparence** - Adaptez les styles à votre marque
4. **Ajouter des champs** - Customisez les données affichées

---

**Besoin du guide complet?** Consultez `GUIDE_IMPORT_POWER_APPS.md`

**Version:** 1.0.0  
**Dernière mise à jour:** 2026-10-07
