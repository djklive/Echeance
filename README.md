# Application de Gestion d'Échéances

Application SPA pour gérer des échéances avec React, Vite, TypeScript, Supabase et Prisma.

## Stack Technique

- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Supabase (Auth, Postgres, Realtime, Storage)
- **ORM**: Prisma (migrations & client local)
- **Edge Functions**: Supabase Functions (notifications/emails)

## Prérequis

- Node.js 18+ et npm/pnpm
- Un compte Supabase (gratuit)
- Git (pour le déploiement)

## Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez votre URL et clé anonyme dans **Settings > API**
3. Récupérez votre connection string dans **Settings > Database > Connection string (URI)**

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key

# Database URL for Prisma
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

**Important**: Remplacez `[PASSWORD]` par le mot de passe de votre base de données Supabase et `[PROJECT_REF]` par la référence de votre projet.

### 4. Configuration de la base de données

#### Option A: Utiliser Prisma (recommandé pour le développement)

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init
```

#### Option B: Utiliser SQL directement dans Supabase

1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Copiez-collez le contenu de `sql/setup.sql`
3. Exécutez le script

### 5. Configuration des Row Level Security (RLS)

Les policies RLS sont incluses dans `sql/setup.sql`. Si vous utilisez Prisma, exécutez quand même le script SQL pour les policies dans Supabase SQL Editor.

## Développement Local

```bash
# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Déploiement

### Frontend (Vercel/Netlify)

1. **Push sur GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-username/votre-repo.git
git push -u origin main
```

2. **Déployer sur Vercel**

- Allez sur [vercel.com](https://vercel.com)
- Importez votre repository GitHub
- Ajoutez les variables d'environnement :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Déployez

3. **Déployer sur Netlify**

- Allez sur [netlify.com](https://netlify.com)
- Importez votre repository GitHub
- Build command: `npm run build`
- Publish directory: `dist`
- Ajoutez les variables d'environnement dans **Site settings > Environment variables**

### Edge Functions Supabase

1. **Installer Supabase CLI**

```bash
npm install -g supabase
```

2. **Se connecter à votre projet**

```bash
supabase login
supabase link --project-ref votre-project-ref
```

3. **Déployer la fonction**

```bash
supabase functions deploy notify-echeance
```

4. **Configurer les secrets (pour les services d'email)**

```bash
# Exemple avec Resend (remplacez par votre service)
supabase secrets set RESEND_API_KEY=votre_api_key
```

## Structure du Projet

```
.
├── prisma/
│   └── schema.prisma          # Schéma Prisma
├── src/
│   ├── components/
│   │   ├── Login.tsx          # Composant d'authentification
│   │   ├── ProtectedRoute.tsx # Route protégée
│   │   ├── EcheanceForm.tsx   # Formulaire CRUD
│   │   └── EcheanceList.tsx   # Liste avec filtres et realtime
│   ├── lib/
│   │   └── supabase.ts        # Client Supabase
│   ├── App.tsx                # Composant principal
│   └── main.tsx              # Point d'entrée
├── supabase/
│   └── functions/
│       └── notify-echeance/
│           └── index.ts      # Edge Function pour notifications
├── sql/
│   └── setup.sql             # Script SQL pour RLS et policies
└── .env                      # Variables d'environnement (non versionné)
```

## Fonctionnalités

- ✅ Authentification email/password (Supabase Auth)
- ✅ CRUD complet des échéances
- ✅ Filtrage par statut (payé/non payé) et date
- ✅ Mise à jour en temps réel (Realtime)
- ✅ Row Level Security (RLS) pour la sécurité
- ✅ Edge Function pour notifications par email

## Utilisation de Prisma vs Supabase Client

- **Prisma**: Utilisé localement pour les migrations et la modélisation. Le client Prisma peut être utilisé pour des scripts locaux ou des opérations batch.
- **Supabase Client**: Utilisé dans le frontend pour toutes les opérations CRUD. C'est la méthode recommandée car elle utilise RLS et fonctionne avec l'authentification Supabase.

## Tests Manuels

### Checklist Locale

- [ ] `npm install` exécuté sans erreur
- [ ] Fichier `.env` configuré avec les bonnes valeurs
- [ ] `npx prisma migrate dev --name init` exécuté avec succès
- [ ] `npm run dev` démarre sans erreur
- [ ] Créer un compte utilisateur
- [ ] Se connecter avec le compte créé
- [ ] Ajouter une échéance
- [ ] Vérifier qu'elle apparaît dans la liste
- [ ] Modifier une échéance
- [ ] Marquer une échéance comme payée
- [ ] Supprimer une échéance
- [ ] Tester les filtres (payé/non payé, date)
- [ ] Ouvrir deux onglets et vérifier le realtime (modifier dans un onglet, voir la mise à jour dans l'autre)
- [ ] Appeler la fonction "Notifier" pour tester l'Edge Function

### Checklist Production

- [ ] Variables d'environnement configurées sur Vercel/Netlify
- [ ] Frontend déployé et accessible
- [ ] Edge Function déployée sur Supabase
- [ ] RLS activé et policies créées dans Supabase
- [ ] Tester l'authentification en production
- [ ] Tester le CRUD en production
- [ ] Tester le realtime en production
- [ ] Tester l'Edge Function en production

## Commandes Utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Preview du build
npm run preview

# Prisma
npx prisma generate              # Générer le client Prisma
npx prisma migrate dev           # Créer et appliquer une migration
npx prisma studio                # Ouvrir Prisma Studio (GUI)
npx prisma db pull               # Introspecter la DB et mettre à jour le schéma

# Supabase
supabase functions deploy notify-echeance
supabase secrets list
supabase secrets set KEY=value
```

## Notes Importantes

- **Ne jamais exposer la `service_role_key` dans le frontend**. Utilisez uniquement l'`anon_key` dans le frontend.
- Les Edge Functions utilisent la `service_role_key` pour les opérations admin, mais elle est stockée comme secret Supabase.
- Les policies RLS garantissent que les utilisateurs ne peuvent accéder qu'à leurs propres échéances.

## Support

Pour toute question ou problème, consultez la documentation :
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
