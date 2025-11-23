# 🚀 Démarrage Rapide

## En 5 minutes

### 1. Configuration Supabase (2 min)

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez dans **Settings > API** :
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
3. Récupérez dans **Settings > Database** :
   - Connection string (URI) → `DATABASE_URL` (remplacez `[YOUR-PASSWORD]`)

### 2. Configuration Locale (1 min)

Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:VOTRE_MDP@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### 3. Base de Données (1 min)

```bash
# Option A: Avec Prisma (recommandé)
npx prisma migrate dev --name init

# Option B: Avec SQL
# Copiez-collez sql/setup.sql dans Supabase SQL Editor
```

**Important** : Activez Realtime dans Supabase SQL Editor :
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE echeances;
```

### 4. Lancer l'Application (1 min)

```bash
npm run dev
```

Ouvrez http://localhost:5173

### 5. Tester (30 sec)

1. Créez un compte
2. Créez une échéance
3. Testez les filtres et le realtime (2 onglets)

## ✅ C'est tout !

Votre application est prête. Consultez les autres fichiers pour plus de détails :
- `README.md` - Documentation complète
- `SETUP_INSTRUCTIONS.md` - Instructions détaillées
- `CHECKLIST.md` - Checklist de test
- `COMMANDES.md` - Référence des commandes
- `PRISMA_GUIDE.md` - Guide Prisma

## 🆘 Problème ?

Vérifiez que :
- ✅ `.env` existe et contient les 3 variables
- ✅ La base de données est configurée (migration ou SQL)
- ✅ Realtime est activé pour la table `echeances`
- ✅ RLS est activé (vérifiez dans Supabase)

Consultez `SETUP_INSTRUCTIONS.md` section "Dépannage" pour plus d'aide.

