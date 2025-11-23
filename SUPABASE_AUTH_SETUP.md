# Configuration de l'Authentification Supabase

## Problème : Erreurs 429 (Too Many Requests) et 400 (Bad Request)

Si vous rencontrez ces erreurs lors de la connexion/inscription, voici comment les résoudre :

## Solution 1: Désactiver la Confirmation d'Email (Recommandé pour le développement)

Par défaut, Supabase demande la confirmation d'email avant de permettre la connexion. Pour le développement, vous pouvez désactiver cette fonctionnalité :

### Étapes :

1. **Allez dans votre dashboard Supabase**
   - Connectez-vous sur https://supabase.com
   - Sélectionnez votre projet

2. **Accédez aux paramètres d'authentification**
   - Menu gauche : **Authentication** > **Settings** (ou **Configuration**)
   - Ou directement : **Settings** > **Auth**

3. **Désactiver l'email confirmation**
   - Cherchez la section **"Email Auth"** ou **"Email"**
   - Trouvez l'option **"Enable email confirmations"** ou **"Confirm email"**
   - **Désactivez-la** (toggle OFF)
   - Cliquez sur **"Save"** ou **"Update"**

4. **Alternative : Désactiver via SQL** (si l'interface ne fonctionne pas)
   ```sql
   -- Dans Supabase SQL Editor
   UPDATE auth.config 
   SET enable_signup = true, 
       enable_email_confirmations = false;
   ```

## Solution 2: Gérer le Rate Limiting (429 Too Many Requests)

Le rate limiting de Supabase limite le nombre de tentatives de connexion pour éviter les abus.

### Solutions :

1. **Attendre quelques minutes**
   - Le rate limiting se réinitialise automatiquement après quelques minutes
   - Ne réessayez pas immédiatement

2. **Vérifier les limites dans Supabase**
   - Allez dans **Settings** > **Auth** > **Rate Limits**
   - Vous pouvez ajuster les limites si vous avez un plan payant

3. **Pour le développement, vous pouvez augmenter temporairement les limites**
   - Dans **Settings** > **Auth** > **Rate Limits**
   - Augmentez les valeurs pour les tests (attention : cela peut avoir des implications de sécurité)

## Solution 3: Vérifier la Configuration Email

Si vous voulez garder l'email confirmation activé :

1. **Vérifier que les emails sont bien envoyés**
   - Allez dans **Authentication** > **Users**
   - Vérifiez si les utilisateurs ont reçu les emails de confirmation

2. **Utiliser un service email personnalisé**
   - Dans **Settings** > **Auth** > **SMTP Settings**
   - Configurez un service SMTP (SendGrid, Mailgun, etc.)
   - Cela permet d'envoyer des emails de confirmation fiables

3. **Pour le développement local, utiliser un service de test email**
   - Services comme Mailtrap ou MailHog pour tester les emails localement

## Solution 4: Vérifier les Variables d'Environnement

Assurez-vous que vos variables d'environnement sont correctes :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

**Vérification :**
- L'URL doit commencer par `https://`
- L'URL doit se terminer par `.supabase.co`
- La clé anon doit être la clé publique (pas la service_role key)

## Solution 5: Tester avec un Compte Existant

Si vous avez déjà créé un compte mais que la connexion échoue :

1. **Vérifier l'email de confirmation**
   - Vérifiez votre boîte de réception (et les spams)
   - Cliquez sur le lien de confirmation

2. **Réinitialiser le mot de passe**
   - Utilisez "Forgot password" dans l'interface de login
   - Ou via Supabase Dashboard : **Authentication** > **Users** > Sélectionnez l'utilisateur > **Send password reset**

3. **Supprimer et recréer le compte**
   - Dans Supabase Dashboard : **Authentication** > **Users**
   - Supprimez l'utilisateur problématique
   - Recréez-le depuis l'application

## Configuration Recommandée pour le Développement

Pour un développement fluide, configurez Supabase ainsi :

1. ✅ **Email confirmation** : **DÉSACTIVÉ**
2. ✅ **Rate limiting** : **Augmenté** (si possible)
3. ✅ **Site URL** : `http://localhost:5173` (dans **Settings** > **Auth** > **URL Configuration**)

## Configuration pour la Production

Pour la production, activez :

1. ✅ **Email confirmation** : **ACTIVÉ**
2. ✅ **Rate limiting** : **Standard** (pour la sécurité)
3. ✅ **Site URL** : Votre URL de production (ex: `https://votre-app.vercel.app`)
4. ✅ **Redirect URLs** : Ajoutez votre URL de production

## Commandes Utiles

### Vérifier la configuration actuelle (SQL)
```sql
-- Voir la configuration d'authentification
SELECT * FROM auth.config;
```

### Créer un utilisateur directement (pour tests)
```sql
-- ATTENTION : Utilisez uniquement pour les tests !
-- Dans Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'test@example.com',
  crypt('votre_mot_de_passe', gen_salt('bf')),
  now(), -- Email confirmé immédiatement
  now(),
  now()
);
```

## Dépannage Rapide

| Erreur | Cause | Solution |
|--------|-------|----------|
| 429 Too Many Requests | Trop de tentatives | Attendre quelques minutes |
| 400 Bad Request | Email non confirmé | Confirmer l'email ou désactiver la confirmation |
| Invalid credentials | Mauvais email/password | Vérifier les identifiants |
| User not found | Compte inexistant | Créer un nouveau compte |

## Support

Si le problème persiste :
1. Vérifiez les logs dans **Supabase Dashboard** > **Logs** > **Auth Logs**
2. Consultez la documentation Supabase : https://supabase.com/docs/guides/auth
3. Vérifiez la console du navigateur pour plus de détails sur l'erreur

