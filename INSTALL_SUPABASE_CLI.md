# Installation de Supabase CLI sur Windows

## Problème

L'installation via `npm install -g supabase` n'est plus supportée. Voici les alternatives pour Windows.

## Solution 1 : Via npx (Recommandé - Pas d'installation nécessaire)

Vous pouvez utiliser `npx` pour exécuter Supabase CLI sans l'installer globalement :

```bash
# Se connecter
npx supabase login

# Lier votre projet
npx supabase link --project-ref VOTRE_PROJECT_REF

# Déployer la fonction
npx supabase functions deploy notify-echeance
```

**Avantages** :
- ✅ Pas d'installation nécessaire
- ✅ Toujours la dernière version
- ✅ Fonctionne immédiatement

## Solution 2 : Via Scoop (Recommandé si vous voulez l'installer)

Scoop est un gestionnaire de paquets pour Windows.

### Installation de Scoop

Ouvrez PowerShell en tant qu'administrateur et exécutez :

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Installation de Supabase CLI

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Vérification

```bash
supabase --version
```

## Solution 3 : Via Chocolatey

Si vous avez Chocolatey installé :

```powershell
choco install supabase
```

## Solution 4 : Téléchargement direct

1. Allez sur https://github.com/supabase/cli/releases
2. Téléchargez `supabase_windows_amd64.zip` (ou `supabase_windows_arm64.zip` pour ARM)
3. Extrayez le fichier `supabase.exe`
4. Ajoutez le dossier au PATH Windows ou placez-le dans un dossier déjà dans le PATH

## Solution 5 : Utiliser le Dashboard Supabase (Alternative)

Si vous ne voulez pas installer le CLI, vous pouvez :

1. **Créer la fonction directement dans Supabase Dashboard** :
   - Allez dans **Edge Functions** > **Create a new function**
   - Nommez-la `notify-echeance`
   - Copiez-collez le code de `supabase/functions/notify-echeance/index.ts`
   - Cliquez sur **Deploy**

2. **Ou utiliser l'API REST directement** au lieu d'une Edge Function

## Déploiement après installation

Une fois Supabase CLI installé (ou en utilisant npx) :

```bash
# 1. Se connecter à Supabase
supabase login
# ou
npx supabase login

# 2. Trouver votre Project Reference ID
# Dans Supabase Dashboard > Settings > General > Reference ID

# 3. Lier votre projet
supabase link --project-ref VOTRE_PROJECT_REF
# ou
npx supabase link --project-ref VOTRE_PROJECT_REF

# 4. Déployer la fonction
supabase functions deploy notify-echeance
# ou
npx supabase functions deploy notify-echeance
```

## Vérification

Pour vérifier que tout fonctionne :

```bash
# Voir les fonctions déployées
supabase functions list
# ou
npx supabase functions list

# Voir les logs
supabase functions logs notify-echeance
# ou
npx supabase functions logs notify-echeance
```

## Recommandation

Pour un démarrage rapide, utilisez **Solution 1 (npx)** car :
- Pas d'installation nécessaire
- Fonctionne immédiatement
- Toujours à jour

Pour un usage régulier, installez via **Scoop (Solution 2)** pour avoir la commande `supabase` disponible partout.

