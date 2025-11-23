# Instructions de Configuration Détaillées

## Étape 1: Configuration Supabase

1. **Créer un projet Supabase**
   - Allez sur https://supabase.com
   - Créez un compte ou connectez-vous
   - Cliquez sur "New Project"
   - Remplissez les informations (nom, mot de passe DB, région)
   - Attendez que le projet soit créé (2-3 minutes)

2. **Récupérer les clés API**
   - Dans votre projet Supabase, allez dans **Settings > API**
   - Copiez :
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public key** → `VITE_SUPABASE_ANON_KEY`
     - **service_role key** → (à garder secret, utilisé uniquement dans Edge Functions)

3. **Récupérer la connection string**
   - Allez dans **Settings > Database**
   - Sous "Connection string", sélectionnez "URI"
   - Copiez la chaîne et remplacez `[YOUR-PASSWORD]` par le mot de passe de votre base de données
   - Ajoutez `?sslmode=require` à la fin si ce n'est pas déjà présent
   - Cette chaîne est votre `DATABASE_URL`

## Étape 2: Configuration Locale

1. **Créer le fichier .env**
   ```bash
   # À la racine du projet
   cp .env.example .env  # Si .env.example existe, sinon créez .env manuellement
   ```

2. **Remplir .env avec vos valeurs**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres?sslmode=require
   ```

## Étape 3: Configuration de la Base de Données

### Option A: Avec Prisma (Recommandé)

```bash
# 1. Générer le client Prisma
npx prisma generate

# 2. Créer et appliquer la migration
npx prisma migrate dev --name init

# 3. (Optionnel) Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

### Option B: Avec SQL Direct (Alternative)

1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Créez une nouvelle requête
3. Copiez-collez le contenu de `sql/setup.sql`
4. Cliquez sur "Run" pour exécuter

**Important**: Même si vous utilisez Prisma, vous devez exécuter les policies RLS depuis SQL Editor car Prisma ne gère pas les policies Supabase.

## Étape 4: Vérifier RLS et Policies

1. Dans Supabase, allez dans **SQL Editor**
2. Exécutez cette requête pour vérifier que RLS est activé :
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'echeances';
   ```
   La colonne `rowsecurity` doit être `true`.

3. Vérifiez les policies :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'echeances';
   ```
   Vous devriez voir 4 policies (SELECT, INSERT, UPDATE, DELETE).

## Étape 5: Tester Localement

```bash
# Démarrer le serveur de développement
npm run dev
```

Ouvrez http://localhost:5173 dans votre navigateur.

### Tests à effectuer :

1. **Authentification**
   - Cliquez sur "Créer un compte"
   - Entrez un email et un mot de passe
   - Vérifiez votre email pour confirmer (si l'email de confirmation est activé)
   - Connectez-vous

2. **CRUD**
   - Créez une échéance (titre, montant, date)
   - Vérifiez qu'elle apparaît dans la liste
   - Modifiez l'échéance
   - Marquez-la comme payée
   - Supprimez-la

3. **Filtres**
   - Créez plusieurs échéances (certaines payées, d'autres non)
   - Testez le filtre "Payées"
   - Testez le filtre "Non payées"
   - Testez le filtre par date

4. **Realtime**
   - Ouvrez deux onglets du navigateur
   - Connectez-vous avec le même compte sur les deux
   - Créez/modifiez/supprimez une échéance dans un onglet
   - Vérifiez que l'autre onglet se met à jour automatiquement

## Étape 6: Déployer l'Edge Function

1. **Installer Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Se connecter**
   ```bash
   supabase login
   ```

3. **Lier votre projet**
   ```bash
   # Trouvez votre project ref dans Settings > General > Reference ID
   supabase link --project-ref votre-project-ref
   ```

4. **Déployer la fonction**
   ```bash
   supabase functions deploy notify-echeance
   ```

5. **Tester la fonction**
   - Dans votre app, créez une échéance
   - Cliquez sur le bouton "Notifier"
   - Vérifiez la console du navigateur et les logs Supabase

## Étape 7: Configuration Email (Optionnel)

Pour envoyer de vrais emails, vous pouvez intégrer un service comme Resend, SendGrid, etc.

### Exemple avec Resend:

1. Créez un compte sur https://resend.com
2. Récupérez votre API key
3. Configurez le secret dans Supabase:
   ```bash
   supabase secrets set RESEND_API_KEY=votre_api_key
   ```
4. Décommentez et modifiez le code dans `supabase/functions/notify-echeance/index.ts`

## Étape 8: Déploiement Production

### Frontend sur Vercel:

1. Push sur GitHub
2. Allez sur vercel.com
3. Importez le repository
4. Ajoutez les variables d'environnement:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Déployez

### Frontend sur Netlify:

1. Push sur GitHub
2. Allez sur netlify.com
3. Importez le repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Ajoutez les variables d'environnement dans Site settings
6. Déployez

## Dépannage

### Erreur: "Missing Supabase environment variables"
- Vérifiez que votre fichier `.env` existe et contient les bonnes variables
- Redémarrez le serveur de dev après avoir modifié `.env`

### Erreur: "relation does not exist"
- Exécutez `npx prisma migrate dev` ou le script SQL `sql/setup.sql`

### Erreur: "new row violates row-level security policy"
- Vérifiez que les policies RLS sont bien créées (voir Étape 4)
- Vérifiez que l'utilisateur est bien connecté

### Realtime ne fonctionne pas
- Vérifiez que Realtime est activé dans Supabase (Settings > API > Realtime)
- Vérifiez que la table `echeances` a la publication activée:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE echeances;
  ```

### Edge Function retourne 401
- Vérifiez que vous passez le token d'authentification dans l'en-tête Authorization
- Vérifiez que la fonction est bien déployée

