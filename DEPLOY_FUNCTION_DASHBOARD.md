# Déployer l'Edge Function via le Dashboard Supabase

## Problème : Pas de privilèges pour utiliser le CLI

Si vous obtenez l'erreur "Your account does not have the necessary privileges", vous pouvez déployer la fonction directement via le Dashboard Supabase.

## Solution : Déployer via le Dashboard

### Étape 1 : Accéder aux Edge Functions

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Edge Functions**

### Étape 2 : Créer une nouvelle fonction

1. Cliquez sur **Create a new function** ou **New Function**
2. Nommez-la : `notify-echeance`
3. Cliquez sur **Create function**

### Étape 3 : Copier le code

1. Ouvrez le fichier `supabase/functions/notify-echeance/index.ts` dans votre éditeur
2. Copiez tout le contenu du fichier
3. Collez-le dans l'éditeur de code du Dashboard Supabase

### Étape 4 : Déployer

1. Cliquez sur **Deploy** ou **Save**
2. Attendez que le déploiement se termine (quelques secondes)

### Étape 5 : Vérifier

1. La fonction devrait apparaître dans la liste des Edge Functions
2. Vous pouvez tester en cliquant sur **Invoke function**

## Code à copier

Voici le code complet de la fonction (déjà dans `supabase/functions/notify-echeance/index.ts`) :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { echeanceId, userEmail } = await req.json()

    if (!echeanceId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing echeanceId or userEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the echeance from the database
    const { data: echeance, error: dbError } = await supabaseAdmin
      .from('echeances')
      .select('*')
      .eq('id', echeanceId)
      .eq('owner', user.id)
      .single()

    if (dbError || !echeance) {
      return new Response(
        JSON.stringify({ error: 'Echeance not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Here you would integrate with an email service (SendGrid, Resend, etc.)
    // For now, we'll just log and return a success response
    console.log('Sending notification email:', {
      to: userEmail,
      subject: `Rappel: Échéance "${echeance.titre}"`,
      body: `Bonjour,\n\nVous avez une échéance à venir:\n\nTitre: ${echeance.titre}\nMontant: ${echeance.montant} FCFA\nDate: ${new Date(echeance.date).toLocaleDateString('fr-FR')}\n\nCordialement`,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        echeance: {
          id: echeance.id,
          titre: echeance.titre,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in notify-echeance function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## Tester la fonction

Après le déploiement, vous pouvez tester la fonction :

1. Dans le Dashboard, cliquez sur la fonction `notify-echeance`
2. Cliquez sur **Invoke function**
3. Ajoutez le body JSON :
   ```json
   {
     "echeanceId": 1,
     "userEmail": "votre@email.com"
   }
   ```
4. Ajoutez l'en-tête `Authorization` avec votre token JWT (vous pouvez le récupérer depuis la console du navigateur quand vous êtes connecté)
5. Cliquez sur **Invoke**

## Vérifier que ça fonctionne dans l'app

Une fois déployée, la fonction devrait fonctionner dans votre application. Testez en cliquant sur le bouton "Notifier" sur une échéance.

## Alternative : Désactiver temporairement

Si vous ne voulez pas utiliser l'Edge Function pour l'instant, vous pouvez modifier le code pour désactiver le bouton ou afficher un message :

Dans `src/components/EcheanceList.tsx`, modifiez `handleNotify` :

```typescript
const handleNotify = async (echeance: Echeance) => {
  alert('Fonctionnalité de notification en cours de développement')
  // Ou simplement ne pas appeler la fonction
}
```

