# Dépannage : Les mises à jour ne fonctionnent pas

## Problème

Les mises à jour (bouton "Payée" et "Modifier") semblent réussir (message de succès) mais les changements ne sont pas visibles dans Supabase.

## Causes possibles

### 1. Policies RLS qui bloquent les UPDATE

Les policies RLS peuvent bloquer les mises à jour si elles ne sont pas correctement configurées.

**Vérification :**

Exécutez dans Supabase SQL Editor :

```sql
-- Vérifier les policies UPDATE
SELECT * FROM pg_policies 
WHERE tablename = 'echeances' 
AND policyname LIKE '%update%';
```

**Solution :**

Assurez-vous que cette policy existe :

```sql
CREATE POLICY "Users can update their own echeances"
  ON public.echeances
  FOR UPDATE
  USING (auth.uid()::text = owner::text)
  WITH CHECK (auth.uid()::text = owner::text);
```

### 2. Problème avec les colonnes created_at et updated_at

Lors d'une mise à jour, ne pas envoyer `created_at` et laisser `updated_at` être géré par le trigger PostgreSQL.

**Solution appliquée :**
- Le code a été modifié pour ne pas envoyer `created_at` et `updated_at` lors des mises à jour
- Seuls `titre`, `montant`, et `date` sont envoyés lors d'une modification

### 3. Problème de permissions

Vérifiez que votre utilisateur a bien les permissions.

**Test :**

Dans Supabase SQL Editor, testez manuellement :

```sql
-- Remplacez YOUR_USER_ID et ECHANCE_ID
UPDATE public.echeances 
SET paid = true 
WHERE id = ECHANCE_ID AND owner = 'YOUR_USER_ID';
```

Si cela fonctionne, le problème vient du code. Si cela échoue, c'est un problème de permissions/RLS.

### 4. Problème avec le trigger updated_at

Le trigger pourrait causer des problèmes.

**Vérification :**

```sql
-- Vérifier que le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'update_echeances_updated_at';
```

**Solution :**

Si le trigger n'existe pas, créez-le :

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_echeances_updated_at
  BEFORE UPDATE ON public.echeances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Solutions appliquées dans le code

### 1. Amélioration des logs

Le code affiche maintenant :
- Les données envoyées avant la mise à jour
- La réponse de Supabase après la mise à jour
- Les erreurs détaillées

### 2. Utilisation de `.select()` après UPDATE

```typescript
const { data: updatedData, error } = await supabase
  .from('echeances')
  .update(updateData)
  .eq('id', echeance.id)
  .select()  // ← Retourne les données mises à jour
```

Cela permet de vérifier que la mise à jour a bien eu lieu.

### 3. Ne pas envoyer created_at/updated_at lors des mises à jour

```typescript
// ❌ Avant (problématique)
const data = {
  titre: ...,
  created_at: now,  // Écrase la date de création
  updated_at: now,  // Peut causer des problèmes
}

// ✅ Maintenant (correct)
const updateData = {
  titre: ...,
  montant: ...,
  date: ...,
  // Pas de created_at ni updated_at
}
```

## Vérifications à faire

### 1. Ouvrir la console du navigateur (F12)

Regardez les logs :
- `Toggling paid status...` - Confirme que la fonction est appelée
- `Paid status updated successfully:` - Confirme que Supabase a retourné des données
- `Updating echeance:` - Confirme les données envoyées
- `Échéance mise à jour avec succès:` - Confirme la réponse de Supabase

### 2. Vérifier dans Supabase Dashboard

1. Allez dans **Table Editor** > **echeances**
2. Regardez si les valeurs changent réellement
3. Vérifiez la colonne `updated_at` - elle devrait changer à chaque modification

### 3. Tester les policies RLS

Exécutez dans Supabase SQL Editor :

```sql
-- Tester si vous pouvez mettre à jour (remplacez les valeurs)
SET ROLE authenticated;
UPDATE public.echeances 
SET paid = true 
WHERE id = 1 AND owner = (SELECT auth.uid()::text);
```

## Solution rapide : Recréer les policies

Si rien ne fonctionne, recréez les policies :

```sql
-- Supprimer toutes les policies
DROP POLICY IF EXISTS "Users can view their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can insert their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can update their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can delete their own echeances" ON public.echeances;

-- Recréer les policies
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

## Test final

Après avoir appliqué les corrections :

1. **Testez le bouton "Payée"** :
   - Cliquez sur "Payée" sur une échéance non payée
   - Regardez la console : vous devriez voir `Paid status updated successfully:`
   - Vérifiez dans Supabase Dashboard que `paid` est maintenant `true`

2. **Testez le bouton "Modifier"** :
   - Cliquez sur "Modifier"
   - Changez la date
   - Cliquez sur "Modifier" dans le formulaire
   - Regardez la console : vous devriez voir `Échéance mise à jour avec succès:`
   - Vérifiez dans Supabase Dashboard que la date a changé

Si les logs montrent le succès mais que Supabase ne change pas, c'est un problème de RLS. Exécutez le script SQL ci-dessus pour recréer les policies.

