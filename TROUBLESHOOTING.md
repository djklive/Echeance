# Guide de Dépannage - Erreur 400 lors de la création d'échéance

## Problème : Erreur 400 (Bad Request) lors de la création d'une échéance

Si vous obtenez une erreur 400 lors de la création d'une échéance, voici les solutions :

## Solution 1: Vérifier la structure de la table

1. **Allez dans Supabase Dashboard** > **Table Editor** > **echeances**
2. Vérifiez que la table existe et a les colonnes suivantes :
   - `id` (SERIAL PRIMARY KEY)
   - `titre` (TEXT)
   - `montant` (NUMERIC)
   - `date` (TIMESTAMPTZ)
   - `paid` (BOOLEAN, default false)
   - `owner` (TEXT ou UUID)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

## Solution 2: Vérifier la contrainte de clé étrangère

Le problème peut venir de la contrainte de clé étrangère sur `owner`. Si `owner` est de type TEXT mais que la contrainte attend un UUID, cela peut causer une erreur.

### Option A: Supprimer la contrainte de clé étrangère (Recommandé pour le développement)

Exécutez dans **Supabase SQL Editor** :

```sql
-- Supprimer la contrainte de clé étrangère si elle existe
ALTER TABLE public.echeances 
DROP CONSTRAINT IF EXISTS echeances_owner_fkey;
```

### Option B: Modifier le type de `owner` en UUID

Si vous voulez garder la contrainte de clé étrangère, modifiez le type de `owner` :

```sql
-- Changer owner de TEXT à UUID
ALTER TABLE public.echeances 
ALTER COLUMN owner TYPE UUID USING owner::uuid;

-- Puis recréer la contrainte
ALTER TABLE public.echeances 
ADD CONSTRAINT echeances_owner_fkey 
FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE;
```

**Note** : Si vous faites cela, vous devrez aussi mettre à jour le schéma Prisma pour utiliser UUID au lieu de String.

## Solution 3: Vérifier les RLS Policies

Assurez-vous que les policies RLS sont bien créées :

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'echeances';

-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'echeances';
```

Si les policies n'existent pas, exécutez le script `sql/setup.sql` dans Supabase SQL Editor.

## Solution 4: Vérifier les logs Supabase

1. Allez dans **Supabase Dashboard** > **Logs** > **Postgres Logs**
2. Regardez les erreurs récentes pour voir le message exact

## Solution 5: Tester avec une requête SQL directe

Testez si vous pouvez insérer manuellement dans Supabase SQL Editor :

```sql
-- Remplacez 'YOUR_USER_ID' par votre UUID d'utilisateur
-- Vous pouvez le trouver dans Authentication > Users
INSERT INTO public.echeances (titre, montant, date, owner)
VALUES ('Test', 1000.00, NOW(), 'YOUR_USER_ID');
```

Si cela fonctionne, le problème vient du code. Si cela échoue, le problème vient de la base de données.

## Solution 6: Vérifier la console du navigateur

Ouvrez la console du navigateur (F12) et regardez :
1. L'erreur exacte dans l'onglet Console
2. La requête dans l'onglet Network > Preview/Response

Cela vous donnera le message d'erreur exact de Supabase.

## Solution 7: Recréer la table (Dernier recours)

Si rien ne fonctionne, vous pouvez recréer la table :

```sql
-- ATTENTION : Cela supprimera toutes les données !
DROP TABLE IF EXISTS public.echeances CASCADE;

-- Recréer la table
CREATE TABLE public.echeances (
  id SERIAL PRIMARY KEY,
  titre TEXT NOT NULL,
  montant NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  paid BOOLEAN DEFAULT false,
  owner TEXT NOT NULL, -- Pas de contrainte de clé étrangère pour simplifier
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.echeances ENABLE ROW LEVEL SECURITY;

-- Créer les policies
CREATE POLICY "Users can view their own echeances"
  ON public.echeances FOR SELECT
  USING (auth.uid()::text = owner::text);

CREATE POLICY "Users can insert their own echeances"
  ON public.echeances FOR INSERT
  WITH CHECK (auth.uid()::text = owner::text);

CREATE POLICY "Users can update their own echeances"
  ON public.echeances FOR UPDATE
  USING (auth.uid()::text = owner::text)
  WITH CHECK (auth.uid()::text = owner::text);

CREATE POLICY "Users can delete their own echeances"
  ON public.echeances FOR DELETE
  USING (auth.uid()::text = owner::text);
```

## Message d'erreur spécifique

Après avoir amélioré la gestion des erreurs dans le code, vous devriez voir un message d'erreur plus détaillé dans la console du navigateur. Utilisez ce message pour identifier le problème exact.

