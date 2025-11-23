import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
      body: `Bonjour,\n\nVous avez une échéance à venir:\n\nTitre: ${echeance.titre}\nMontant: ${echeance.montant} €\nDate: ${new Date(echeance.date).toLocaleDateString('fr-FR')}\n\nCordialement`,
    })

    // Example: If you want to use a service like Resend, you would do:
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@yourdomain.com',
    //     to: userEmail,
    //     subject: `Rappel: Échéance "${echeance.titre}"`,
    //     html: `<p>Bonjour,<br><br>Vous avez une échéance à venir:<br><br>Titre: ${echeance.titre}<br>Montant: ${echeance.montant} €<br>Date: ${new Date(echeance.date).toLocaleDateString('fr-FR')}</p>`,
    //   }),
    // })

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

