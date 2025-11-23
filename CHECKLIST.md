# Checklist de Test et Déploiement

## ✅ Checklist de Configuration Initiale

### Environnement Local
- [ ] Node.js 18+ installé (`node --version`)
- [ ] npm/pnpm installé (`npm --version`)
- [ ] Projet Supabase créé
- [ ] Fichier `.env` créé avec toutes les variables
- [ ] Dépendances installées (`npm install`)

### Base de Données
- [ ] Schéma Prisma créé (`prisma/schema.prisma`)
- [ ] Migration Prisma exécutée (`npx prisma migrate dev --name init`)
- [ ] OU script SQL exécuté dans Supabase SQL Editor (`sql/setup.sql`)
- [ ] RLS activé sur la table `echeances`
- [ ] Policies RLS créées (SELECT, INSERT, UPDATE, DELETE)
- [ ] Trigger `updated_at` créé (optionnel mais recommandé)

### Supabase Configuration
- [ ] Realtime activé pour la table `echeances`
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE echeances;
  ```
- [ ] Email confirmation désactivé (pour tests) OU email vérifié

## ✅ Checklist de Test Local

### Authentification
- [ ] L'application démarre (`npm run dev`)
- [ ] La page de login s'affiche
- [ ] Création de compte fonctionne
- [ ] Connexion avec email/password fonctionne
- [ ] Déconnexion fonctionne
- [ ] Redirection automatique si non connecté

### CRUD Échéances
- [ ] Affichage de la liste (vide au début)
- [ ] Création d'une échéance :
  - [ ] Formulaire s'affiche
  - [ ] Validation des champs (titre, montant, date requis)
  - [ ] Échéance créée et visible dans la liste
- [ ] Modification d'une échéance :
  - [ ] Formulaire pré-rempli avec les données
  - [ ] Modification sauvegardée
  - [ ] Liste mise à jour
- [ ] Toggle statut payé/non payé :
  - [ ] Bouton change le statut
  - [ ] Couleur de la carte change (vert pour payé)
- [ ] Suppression d'une échéance :
  - [ ] Confirmation demandée
  - [ ] Échéance supprimée de la liste

### Filtres
- [ ] Filtre "Toutes" affiche toutes les échéances
- [ ] Filtre "Payées" affiche uniquement les payées
- [ ] Filtre "Non payées" affiche uniquement les non payées
- [ ] Filtre par date fonctionne (échéances à partir d'une date)

### Realtime
- [ ] Ouvrir deux onglets avec le même compte
- [ ] Créer une échéance dans l'onglet 1
- [ ] Vérifier qu'elle apparaît automatiquement dans l'onglet 2
- [ ] Modifier une échéance dans l'onglet 1
- [ ] Vérifier la mise à jour dans l'onglet 2
- [ ] Supprimer une échéance dans l'onglet 1
- [ ] Vérifier la suppression dans l'onglet 2

### Sécurité (RLS)
- [ ] Créer un deuxième compte utilisateur
- [ ] Se connecter avec le compte 1, créer des échéances
- [ ] Se connecter avec le compte 2
- [ ] Vérifier que les échéances du compte 1 ne sont PAS visibles
- [ ] Vérifier que seules les échéances du compte 2 sont visibles
- [ ] Tenter de modifier une échéance d'un autre utilisateur (devrait échouer)

### Edge Function
- [ ] Edge Function déployée (`supabase functions deploy notify-echeance`)
- [ ] Bouton "Notifier" présent sur chaque échéance
- [ ] Clic sur "Notifier" :
  - [ ] Pas d'erreur dans la console
  - [ ] Message de succès affiché
  - [ ] Logs visibles dans Supabase Dashboard > Edge Functions > Logs

## ✅ Checklist de Déploiement Production

### Préparation
- [ ] Code poussé sur GitHub/GitLab
- [ ] Variables d'environnement listées et documentées
- [ ] `.env` ajouté à `.gitignore` (vérifié)

### Frontend (Vercel/Netlify)
- [ ] Repository connecté à Vercel/Netlify
- [ ] Variables d'environnement configurées :
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Build command : `npm run build`
- [ ] Publish directory : `dist`
- [ ] Déploiement réussi
- [ ] URL de production accessible

### Supabase Production
- [ ] Edge Function déployée en production
- [ ] Secrets configurés (si nécessaire pour email) :
  ```bash
  supabase secrets set RESEND_API_KEY=xxx
  ```
- [ ] RLS et policies vérifiées en production
- [ ] Realtime activé en production

### Tests Production
- [ ] Authentification fonctionne
- [ ] CRUD fonctionne
- [ ] Realtime fonctionne
- [ ] Edge Function fonctionne
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Performance acceptable (chargement rapide)

## ✅ Checklist de Sécurité

- [ ] `.env` dans `.gitignore`
- [ ] Pas de clés secrètes dans le code source
- [ ] `service_role_key` jamais utilisée dans le frontend
- [ ] Seulement `anon_key` utilisée dans le frontend
- [ ] RLS activé et testé
- [ ] Policies RLS testées (un utilisateur ne peut pas accéder aux données d'un autre)
- [ ] Edge Functions utilisent l'authentification (vérification du token)

## ✅ Checklist de Performance

- [ ] Chargement initial < 3 secondes
- [ ] Pas de requêtes inutiles (vérifier Network tab)
- [ ] Realtime fonctionne sans latence excessive
- [ ] Images/assets optimisés (si applicable)

## 🐛 Dépannage Rapide

### Problème : "Missing Supabase environment variables"
**Solution** : Vérifier que `.env` existe et contient `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Problème : "relation does not exist"
**Solution** : Exécuter `npx prisma migrate dev` ou le script `sql/setup.sql`

### Problème : "new row violates row-level security policy"
**Solution** : Vérifier que les policies RLS sont créées et que l'utilisateur est connecté

### Problème : Realtime ne fonctionne pas
**Solution** : 
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE echeances;
```

### Problème : Edge Function retourne 401
**Solution** : Vérifier que le token d'authentification est passé dans l'en-tête Authorization

### Problème : Build échoue sur Vercel/Netlify
**Solution** : Vérifier que toutes les variables d'environnement sont configurées avec le préfixe `VITE_`

## 📝 Notes Finales

- Gardez toujours une copie de votre `DATABASE_URL` en sécurité
- Ne partagez jamais votre `service_role_key`
- Testez régulièrement les backups de votre base de données
- Surveillez les logs Supabase pour détecter les erreurs

