-- Script pour vérifier et corriger les policies RLS
-- Exécutez ce script dans Supabase SQL Editor si les mises à jour ne fonctionnent pas

-- 1. Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'echeances';

-- Si rowsecurity est false, activez-le :
ALTER TABLE public.echeances ENABLE ROW LEVEL SECURITY;

-- 2. Vérifier les policies existantes
SELECT * FROM pg_policies WHERE tablename = 'echeances';

-- 3. Supprimer toutes les policies existantes (pour repartir de zéro)
DROP POLICY IF EXISTS "Users can view their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can insert their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can update their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can delete their own echeances" ON public.echeances;

-- 4. Recréer les policies correctement

-- Policy SELECT (lecture)
CREATE POLICY "Users can view their own echeances"
  ON public.echeances
  FOR SELECT
  USING (auth.uid()::text = owner::text);

-- Policy INSERT (création)
CREATE POLICY "Users can insert their own echeances"
  ON public.echeances
  FOR INSERT
  WITH CHECK (auth.uid()::text = owner::text);

-- Policy UPDATE (modification) - IMPORTANT : avec USING et WITH CHECK
CREATE POLICY "Users can update their own echeances"
  ON public.echeances
  FOR UPDATE
  USING (auth.uid()::text = owner::text)  -- Condition pour voir les lignes à modifier
  WITH CHECK (auth.uid()::text = owner::text);  -- Condition pour les nouvelles valeurs

-- Policy DELETE (suppression)
CREATE POLICY "Users can delete their own echeances"
  ON public.echeances
  FOR DELETE
  USING (auth.uid()::text = owner::text);

-- 5. Vérifier que les policies sont bien créées
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'echeances'
ORDER BY policyname;

-- 6. Vérifier le trigger updated_at
SELECT * FROM pg_trigger WHERE tgname = 'update_echeances_updated_at';

-- Si le trigger n'existe pas, créez-le :
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_echeances_updated_at ON public.echeances;
CREATE TRIGGER update_echeances_updated_at
  BEFORE UPDATE ON public.echeances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Test : Vérifier que vous pouvez voir vos échéances
-- (Exécutez cette requête quand vous êtes connecté dans l'app)
-- SELECT * FROM public.echeances WHERE owner = auth.uid()::text;

