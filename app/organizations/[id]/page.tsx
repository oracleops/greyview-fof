import { Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { OrganizationDetails } from './organization-details';
import { Navbar } from '@/components/ui/navbar';
import { supabase } from '@/lib/supabase';

const montserrat = Montserrat({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

interface Organization {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
}

async function getOrganization(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export default async function OrganizationPage({ params }: { params: { id: string } }) {
  const organization = await getOrganization(params.id);

  if (!organization) {
    notFound();
  }

  return (
    <main>
      <Navbar />
      <OrganizationDetails organization={organization} montserrat={montserrat} />
    </main>
  );
}