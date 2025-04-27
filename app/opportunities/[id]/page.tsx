import { Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { OpportunityDetails } from './opportunity-details';
import { Navbar } from '@/components/ui/navbar';
import { supabase } from '@/lib/supabase';

const montserrat = Montserrat({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

interface Opportunity {
  id: string;
  name: string;
  organization_name: string;
  description: string;
  impact_description: string;
  image_url: string;
  location: string;
  time_commitment: string;
  skills_required: string;
  event_type: 'one-time' | 'recurring';
  event_date: string;
  recurring_schedule: any;
  city: string;
  state: string;
  street_address: string;
  postal_code: string;
  sign_up_external: boolean;
  external_signup_url: string;
}

async function getOpportunity(id: string): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from('volunteer_opportunities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export default async function OpportunityPage({ params }: { params: { id: string } }) {
  const opportunity = await getOpportunity(params.id);

  if (!opportunity) {
    notFound();
  }

  return (
    <main>
      <Navbar />
      <OpportunityDetails opportunity={opportunity} montserrat={montserrat} />
    </main>
  );
}