# Commandes Rapides - Référence

## Installation Initiale

```bash
# Installer les dépendances
npm install

# Installer Supabase CLI globalement (pour Edge Functions)
npm install -g supabase
```

## Développement Local

```bash
# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview

# Linter
npm run lint
```

## Prisma

```bash
# Générer le client Prisma (après modification du schéma)
npx prisma generate

# Créer et appliquer une migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Introspecter la base de données (mettre à jour le schéma depuis la DB)
npx prisma db pull

# Ouvrir Prisma Studio (GUI)
npx prisma studio

# Formater le schéma
npx prisma format

# Valider le schéma
npx prisma validate
```

## Supabase CLI

```bash
# Se connecter à Supabase
supabase login

# Lier un projet local à Supabase
supabase link --project-ref votre-project-ref

# Déployer une Edge Function
supabase functions deploy notify-echeance

# Lister les secrets
supabase secrets list

# Définir un secret
supabase secrets set KEY_NAME=value

# Supprimer un secret
supabase secrets unset KEY_NAME

# Voir les logs des Edge Functions
supabase functions logs notify-echeance

# Tester une Edge Function localement
supabase functions serve notify-echeance
```

## Git & Déploiement

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Ajouter un remote
git remote add origin https://github.com/votre-username/votre-repo.git

# Push
git push -u origin main

# Après modifications
git add .
git commit -m "Description des changements"
git push
```

## Commandes SQL Utiles (Supabase SQL Editor)

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'echeances';

-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'echeances';

-- Activer Realtime pour la table
ALTER PUBLICATION supabase_realtime ADD TABLE echeances;

-- Vérifier les publications Realtime
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Compter les échéances par utilisateur
SELECT owner, COUNT(*) as count 
FROM echeances 
GROUP BY owner;

-- Voir toutes les échéances (admin uniquement, bypass RLS)
SET ROLE postgres;
SELECT * FROM echeances;
RESET ROLE;
```

## Commandes de Test Rapides

```bash
# Tester que le serveur démarre
npm run dev

# Tester le build
npm run build && npm run preview

# Vérifier les types TypeScript
npx tsc --noEmit

# Vérifier le linting
npm run lint
```

## Dépannage

```bash
# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Réinitialiser Prisma
rm -rf prisma/migrations
npx prisma migrate dev --name init

# Vérifier les variables d'environnement (Node.js)
node -e "console.log(process.env.VITE_SUPABASE_URL)"
```

## Workflow Complet de Développement

```bash
# 1. Cloner le projet (si nouveau)
git clone https://github.com/votre-repo.git
cd Echeances

# 2. Installer les dépendances
npm install

# 3. Configurer .env
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Initialiser la base de données
npx prisma migrate dev --name init

# 5. Configurer RLS dans Supabase SQL Editor
# Copier-coller sql/setup.sql

# 6. Activer Realtime
# Dans Supabase SQL Editor:
ALTER PUBLICATION supabase_realtime ADD TABLE echeances;

# 7. Démarrer le développement
npm run dev

# 8. Après modifications du schéma
npx prisma migrate dev --name description
npx prisma generate

# 9. Déployer l'Edge Function
supabase functions deploy notify-echeance

# 10. Build et déploiement
npm run build
# Push sur GitHub, puis déployer sur Vercel/Netlify
```

