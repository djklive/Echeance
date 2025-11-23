# Configuration de l'Edge Function Supabase

## Problème : Erreur CORS lors de l'appel de l'Edge Function

Si vous obtenez une erreur CORS lors de l'appel de l'Edge Function, voici comment la résoudre :

## Solution 1: Vérifier que la fonction est déployée

1. **Vérifiez dans Supabase Dashboard**
   - Allez dans **Edge Functions** dans le menu de gauche
   - Vérifiez que `notify-echeance` apparaît dans la liste
   - Si elle n'est pas là, vous devez la déployer

2. **Déployer la fonction**
   
   **Installation de Supabase CLI sur Windows :**
   
   **Option A : Via Scoop (Recommandé)**
   ```powershell
   # Installer Scoop si vous ne l'avez pas
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   
   # Installer Supabase CLI
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```
   
   **Option B : Via Chocolatey**
   ```powershell
   # Installer Chocolatey si vous ne l'avez pas
   # Puis installer Supabase CLI
   choco install supabase
   ```
   
   **Option C : Télécharger directement (Windows)**
   - Allez sur https://github.com/supabase/cli/releases
   - Téléchargez `supabase_windows_amd64.zip`
   - Extrayez et ajoutez le dossier au PATH
   
   **Option D : Via npx (sans installation globale)**
   ```bash
   # Utiliser npx pour exécuter sans installation globale
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase functions deploy notify-echeance
   ```
   
   **Après installation, déployer la fonction :**
   ```bash
   # Se connecter
   supabase login
   
   # Lier votre projet (remplacez YOUR_PROJECT_REF par votre référence de projet)
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Déployer la fonction
   supabase functions deploy notify-echeance
   ```

## Solution 2: Vérifier les variables d'environnement

L'Edge Function a besoin de variables d'environnement :

1. **Dans Supabase Dashboard** > **Edge Functions** > **Settings**
2. Vérifiez que ces variables sont définies :
   - `SUPABASE_URL` : Votre URL Supabase (automatiquement disponible)
   - `SUPABASE_SERVICE_ROLE_KEY` : Votre clé service_role (automatiquement disponible)

   **Note** : Ces variables sont normalement disponibles automatiquement, mais vous pouvez les vérifier.

## Solution 3: Tester la fonction directement

Vous pouvez tester la fonction depuis Supabase Dashboard :

1. Allez dans **Edge Functions** > **notify-echeance**
2. Cliquez sur **Invoke function**
3. Ajoutez le body :
   ```json
   {
     "echeanceId": 1,
     "userEmail": "votre@email.com"
   }
   ```
4. Ajoutez l'en-tête Authorization avec votre token JWT
5. Cliquez sur **Invoke**

## Solution 4: Vérifier les logs

1. Allez dans **Edge Functions** > **notify-echeance** > **Logs**
2. Regardez les erreurs récentes
3. Cela vous donnera plus d'informations sur le problème

## Solution 5: Alternative - Désactiver temporairement la fonction

Si vous ne voulez pas utiliser l'Edge Function pour l'instant, vous pouvez désactiver le bouton de notification ou afficher un message :

```typescript
const handleNotify = async (echeance: Echeance) => {
  alert('Fonctionnalité de notification en cours de développement')
  // Ou simplement ne pas appeler la fonction
}
```

## Solution 6: Utiliser l'API REST directement (Alternative)

Si l'Edge Function pose problème, vous pouvez créer une route API simple ou utiliser directement Supabase pour envoyer des notifications via un webhook ou un service externe.

## Commandes utiles

```bash
# Voir les logs de la fonction
supabase functions logs notify-echeance

# Tester la fonction localement
supabase functions serve notify-echeance

# Redéployer la fonction
supabase functions deploy notify-echeance --no-verify-jwt
```

## Vérification rapide

Pour vérifier que tout fonctionne :

1. ✅ La fonction est déployée dans Supabase Dashboard
2. ✅ Les variables d'environnement sont définies
3. ✅ Vous êtes connecté dans l'application
4. ✅ Le token JWT est bien envoyé dans l'en-tête Authorization
5. ✅ Les logs ne montrent pas d'erreurs

## Note importante

L'Edge Function nécessite que vous soyez authentifié. Le client Supabase gère automatiquement l'en-tête Authorization, mais assurez-vous que :
- Vous êtes bien connecté
- Votre session est valide
- Le token n'a pas expiré

