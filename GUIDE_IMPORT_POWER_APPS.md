# 📱 Guide d'importation - JiraTrackers Web App

## Étape 1: Télécharger la solution

Fichier: `JiraTrackersApp_1.0.0_unmanaged.zip`
Localisation: `C:\Users\mlebbi\Desktop\ClaudeM\my-app\`

---

## Étape 2: Importer la solution dans Power Apps

### 2.1 Accéder à Power Platform
1. Ouvrez https://make.powerapps.com
2. Sélectionnez votre environnement (fd7b5d45-444c-e5f6-a197-9d287331c409)

### 2.2 Importer la solution
1. Cliquez sur **Solutions** dans le volet gauche
2. Cliquez sur **Importer une solution**
3. Cliquez sur **Parcourir** et sélectionnez `JiraTrackersApp_1.0.0_unmanaged.zip`
4. Cliquez sur **Suivant**
5. Consultez les détails et cliquez sur **Importer**
6. Attendez que l'importation soit terminée (2-5 minutes)

---

## Étape 3: Vérifier les ressources importées

Une fois importée, vous trouverez:
- **jiratracker_index_html** (Type: Page Web HTML)
- **jiratracker_css** (Type: Feuille de style CSS)
- **jiratracker_app_js** (Type: Script JavaScript)

---

## Étape 4: Créer une Page Web pour héberger l'app

### Option A: Créer une nouvelle Page Web (Recommandé)

1. Dans Power Apps, cliquez sur **Créer**
2. Sélectionnez **Page Web**
3. Donnez un nom: `JiraTrackers App`
4. Cliquez sur l'éditeur de code
5. Remplacez le contenu par:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jira Trackers</title>
</head>
<body>
    <div id="root"></div>
    <script src="/WebResources/jiratracker_app_js"></script>
</body>
</html>
```

6. Enregistrez et publiez

### Option B: Ajouter dans un formulaire existant

1. Ouvrez une table/formulaire existant
2. Cliquez sur **+ Ajouter un composant**
3. Sélectionnez **Web Resource**
4. Choisissez `jiratracker_index_html`
5. Configurez la taille et les propriétés
6. Enregistrez et publiez

---

## Étape 5: Accéder à l'application

Une fois publiée:
1. Accédez à la **Page Web JiraTrackers App**
2. L'application React se chargera automatiquement
3. Vérifiez la console (F12) pour les erreurs potentielles

---

## 🔧 Dépannage

### La page est blanche
- Vérifiez que toutes les ressources web sont importées
- Ouvrez les outils de développement (F12) et consultez la console
- Vérifiez les chemins des ressources

### Erreur CORS
- Vérifiez que votre API backend autorise les requêtes depuis Power Apps
- Ajoutez les origines Power Apps à votre liste blanche CORS

### Les styles ne s'appliquent pas
- Assurez-vous que `jiratracker_css` est correctement importée
- Vérifiez le chemin de la ressource CSS dans le HTML

---

## 📝 Notes importantes

✅ **Avantages de cette approche:**
- Pas besoin de permissions Code App
- Solution réutilisable et versionnée
- Peut être personnalisée après importation
- Peut être exportée et transférée vers d'autres environnements

⚠️ **Limitations:**
- Requiert une ressource web pour accéder à l'API
- Les chemins des ressources doivent être corrects

---

## 🔄 Mise à jour future

Pour mettre à jour l'application:
1. Exécutez `npm run build` localement
2. Créez une nouvelle solution avec `npm run create-solution` (si créé)
3. Importez la nouvelle version dans Power Apps
4. Sélectionnez "Mettre à jour" lors de l'importation

---

**Besoin d'aide?** Contactez votre administrateur Power Platform.
