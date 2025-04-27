import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.38.1';
import { Configuration, OpenAIApi } from 'npm:openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  groupSize: number;
  opportunityId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const payload: SignupPayload = await req.json();
    
    // Get the opportunity details
    const { data: opportunity, error: oppError } = await supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        organizations_applications (
          name,
          email
        )
      `)
      .eq('id', payload.opportunityId)
      .single();

    if (oppError) throw oppError;

    // Create the signup
    const { data: signup, error: signupError } = await supabase
      .from('volunteer_signups')
      .insert({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        group_size: payload.groupSize,
        opportunity_id: payload.opportunityId,
        status: 'pending'
      })
      .select()
      .single();

    if (signupError) throw signupError;

    // Generate email content with OpenAI
    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    }));

    const prompt = `Write a friendly email confirming a volunteer signup. Use these details:
    - Volunteer: ${payload.firstName} ${payload.lastName}
    - Opportunity: ${opportunity.name}
    - Organization: ${opportunity.organizations_applications.name}
    - Group Size: ${payload.groupSize} people
    - Date: ${new Date(opportunity.event_date).toLocaleDateString()}
    - Location: ${opportunity.street_address}, ${opportunity.city}, ${opportunity.state}
    
    The email should be warm and welcoming, thank them for volunteering, and include the key details.`;

    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 400,
      temperature: 0.7
    });

    const emailContent = completion.data.choices[0].text?.trim();

    // TODO: Send emails using your preferred email service
    // For now, we'll just log the content
    console.log('Email Content:', emailContent);

    return new Response(
      JSON.stringify({ success: true, signup }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});