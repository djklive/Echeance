-- Créer la table echeances si elle n'existe pas déjà
-- Note: Cette table sera créée automatiquement par Prisma migrate, mais vous pouvez aussi l'exécuter manuellement dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.echeances (
  id SERIAL PRIMARY KEY,
  titre TEXT NOT NULL,
  montant NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  paid BOOLEAN DEFAULT false,
  owner TEXT NOT NULL, -- UUID stocké comme TEXT pour compatibilité avec Prisma String
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ajouter la contrainte de clé étrangère si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'echeances_owner_fkey'
  ) THEN
    ALTER TABLE public.echeances 
    ADD CONSTRAINT echeances_owner_fkey 
    FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Activer Row Level Security (RLS)
ALTER TABLE public.echeances ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent (pour éviter les erreurs lors de la ré-exécution)
DROP POLICY IF EXISTS "Users can manage their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can view their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can insert their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can update their own echeances" ON public.echeances;
DROP POLICY IF EXISTS "Users can delete their own echeances" ON public.echeances;

-- Policy pour permettre aux utilisateurs de voir uniquement leurs propres échéances
CREATE POLICY "Users can view their own echeances"
  ON public.echeances
  FOR SELECT
  USING (auth.uid()::text = owner::text);

-- Policy pour permettre aux utilisateurs d'insérer leurs propres échéances
CREATE POLICY "Users can insert their own echeances"
  ON public.echeances
  FOR INSERT
  WITH CHECK (auth.uid()::text = owner::text);

-- Policy pour permettre aux utilisateurs de mettre à jour leurs propres échéances
CREATE POLICY "Users can update their own echeances"
  ON public.echeances
  FOR UPDATE
  USING (auth.uid()::text = owner::text)
  WITH CHECK (auth.uid()::text = owner::text);

-- Policy pour permettre aux utilisateurs de supprimer leurs propres échéances
CREATE POLICY "Users can delete their own echeances"
  ON public.echeances
  FOR DELETE
  USING (auth.uid()::text = owner::text);

-- Créer un trigger pour mettre à jour automatiquement updated_at
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

