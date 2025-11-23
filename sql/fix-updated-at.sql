-- Script pour corriger la colonne updated_at
-- Exécutez ce script dans Supabase SQL Editor si vous avez l'erreur "null value in column updated_at"

-- Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'echeances'
AND column_name IN ('created_at', 'updated_at');

-- Modifier updated_at pour avoir une valeur par défaut
ALTER TABLE public.echeances
ALTER COLUMN updated_at SET DEFAULT now();

-- Modifier created_at pour avoir une valeur par défaut (au cas où)
ALTER TABLE public.echeances
ALTER COLUMN created_at SET DEFAULT now();

-- Vérifier que les modifications ont été appliquées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'echeances'
AND column_name IN ('created_at', 'updated_at');

