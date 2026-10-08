# ✅ Checklist d'importation - JiraTrackers App

## Phase 1: Préparation (2 min)

- [ ] Fichier `JiraTrackersApp_1.0.0_unmanaged.zip` prêt
- [ ] Accès à https://make.powerapps.com
- [ ] Permissions d'administrateur ou importation de solution

## Phase 2: Importation (5-10 min)

### 2.1 Accéder à Power Platform
- [ ] Ouvrir https://make.powerapps.com
- [ ] Sélectionner l'environnement cible
- [ ] Note: Environnement ID: `fd7b5d45-444c-e5f6-a197-9d287331c409`

### 2.2 Lancer l'importation
- [ ] Cliquer sur **Solutions** (menu gauche)
- [ ] Cliquer sur **Importer une solution**
- [ ] Cliquer sur **Parcourir**
- [ ] Sélectionner `JiraTrackersApp_1.0.0_unmanaged.zip`
- [ ] Cliquer sur **Suivant**

### 2.3 Confirmer l'importation
- [ ] Vérifier les détails:
  - Nom: "Jira Trackers Web App"
  - Version: "1.0.0"
- [ ] Cliquer sur **Importer**
- [ ] Attendre la fin du processus (voir barre de progression)

### 2.4 Vérifier l'importation
- [ ] Vérifier que la solution est maintenant listée dans Solutions
- [ ] Ouvrir la solution "Jira Trackers App"
- [ ] Vérifier les 3 ressources web:
  - [ ] jiratracker_index_html
  - [ ] jiratracker_css
  - [ ] jiratracker_app_js

## Phase 3: Création de la Page Web (10 min)

### 3.1 Créer une nouvelle page web
- [ ] Cliquer sur **Créer** (menu gauche)
- [ ] Sélectionner **Page Web** (ou **Élément personnalisé**)
- [ ] Donner un nom: `JiraTrackers App`
- [ ] Cliquer sur **Créer**

### 3.2 Ajouter le contenu
- [ ] Option A (Simple):
  - [ ] Ajouter un composant Web Resource
  - [ ] Sélectionner `jiratracker_index_html`
  - [ ] Configurer la taille (100% × 100%)

- [ ] Option B (Avancée):
  - [ ] Passer en mode code
  - [ ] Ajouter le HTML:
  ```html
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8" />
      <title>Jira Trackers</title>
  </head>
  <body>
      <div id="root"></div>
      <script src="/WebResources/jiratracker_app_js"></script>
  </body>
  </html>
  ```

### 3.3 Enregistrer et publier
- [ ] Cliquer sur **Enregistrer**
- [ ] Cliquer sur **Publier**
- [ ] Attendre la fin de la publication

## Phase 4: Test et Validation (5 min)

### 4.1 Ouvrir l'application
- [ ] Ouvrir la page web "JiraTrackers App"
- [ ] Vérifier que l'interface se charge correctement
- [ ] Vérifier que l'application est réactive

### 4.2 Tester les fonctionnalités
- [ ] Tester la navigation entre les onglets
- [ ] Tester l'affichage des données (si datalake est configurée)
- [ ] Vérifier la console (F12) pour les erreurs

### 4.3 Checker les erreurs courantes
- [ ] Page blanche → Vérifier les chemins des ressources
- [ ] Erreur 404 → Vérifier l'API URL
- [ ] Styles manquants → Vérifier l'importation CSS

## Phase 5: Post-déploiement

- [ ] Partager l'application avec les utilisateurs
- [ ] Configurer les permissions d'accès
- [ ] Documenter les points d'accès
- [ ] Mettre en place le monitoring

## 🚀 Lancement

- [ ] L'application est prête en production
- [ ] Les utilisateurs peuvent y accéder
- [ ] Support en place pour les incidents

---

## 📞 Besoin d'aide?

**Erreur lors de l'importation:**
→ Consultez `GUIDE_IMPORT_POWER_APPS.md` section "Dépannage"

**L'application ne s'affiche pas:**
→ Vérifiez que toutes les ressources web sont importées
→ Consultez la console (F12) pour les détails

**Questions sur la configuration:**
→ Lisez `SOLUTION_README.md` pour la configuration de l'API

---

**Statut:** ⏳ Prêt à être importé  
**Mise à jour:** 2026-10-07  
**Version:** 1.0.0
