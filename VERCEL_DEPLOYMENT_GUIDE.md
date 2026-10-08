# Déployer sur Vercel + Intégrer dans Power Apps

## **Étape 1: Préparer GitHub (ou créer un compte)**

### Option A: Si vous avez déjà Git
```bash
cd C:\Users\mlebbi\Desktop\ClaudeM\my-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/my-app.git
git branch -M main
git push -u origin main
```

### Option B: Créer un repo GitHub
1. Allez sur https://github.com/new
2. Créez un repo `my-app`
3. Copiez les commandes et exécutez-les (comme ci-dessus)

---

## **Étape 2: Déployer sur Vercel**

### Via Vercel Dashboard (Plus simple):

1. **Allez sur:** https://vercel.com/signup
2. **Inscrivez-vous** (gratuit) avec GitHub
3. **Cliquez:** "New Project"
4. **Sélectionnez** votre repo `my-app`
5. **Configurez les variables d'environnement:**
   - Cliquez "Environment Variables"
   - Ajoutez:
     ```
     VITE_DATAVERSE_ENABLED = true
     VITE_DATAVERSE_URL = https://orgfa22e578.crm.dynamics.com
     ```
6. **Cliquez:** "Deploy"

### ⏳ Attendre ~2 minutes pour le déploiement

---

## **Étape 3: Obtenir l'URL publique**

Après le déploiement, Vercel vous donne une URL comme:
```
https://my-app-[hash].vercel.app
```

✅ **Votre app React est maintenant publique!**

Testez-la: Cliquez sur l'URL → Vous devriez voir votre app

---

## **Étape 4: Créer une Power App avec iFrame**

Maintenant, créez une simple Power App pour afficher votre app React:

1. Allez sur https://make.powerapps.com
2. **Create** → **Canvas app** → **Blank app**
3. **Insérez un Web Browser (iFrame)**:
   - Insert → Web and media → Web browser
4. **Configurez l'URL:**
   - Dans la propriété `URL` du Web browser:
   ```
   "https://my-app-[hash].vercel.app"
   ```
5. **Sauvegardez** et **testez**

---

## **Étape 5: Connecter Dataverse (optionnel)**

Si vous voulez que Power Apps et votre React app partagent des données:

1. Dans Power Apps, créez les tables Dataverse:
   - Clients
   - Tickets
   - Environments

2. Configurez vos `.env` variables

3. Cliquez "Initialize Dataverse" dans votre app

---

## **FAQ**

**Q: Pourquoi Vercel?**
A: Gratuit, déploie automatiquement depuis Git, HTTPS inclus

**Q: Comment mettre à jour l'app?**
A: Faites un `git push` et Vercel redéploie automatiquement

**Q: L'app a besoin d'une authentification?**
A: Power Apps gère l'authentification, pas l'app

**Q: Comment gérer les secrets (API keys)?**
A: Utilisez les "Environment Variables" de Vercel

---

## **Commandes Git rapides**

```bash
# Après chaque modification:
git add .
git commit -m "Votre message"
git push

# Vercel redéploie automatiquement!
```

---

## **Votre URL finale sera:**
```
Power Apps → Canvas App → Web Browser → https://my-app-[hash].vercel.app
```

C'est tout! 🎉
