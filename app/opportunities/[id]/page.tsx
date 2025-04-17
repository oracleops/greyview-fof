import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Repeat, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Opportunity {
  id: string;
  name: string;
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
      
      <div 
        className="h-[400px] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${opportunity.image_url})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-4xl mx-auto px-4 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{opportunity.name}</h1>
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-lg">
                {opportunity.event_type === 'recurring' ? 'Recurring' : 'One-time'} Opportunity
              </Badge>
              {opportunity.skills_required && (
                <Badge variant="outline" className="text-lg">
                  {opportunity.skills_required}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">About this Opportunity</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{opportunity.description}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Impact</h2>
              <p className="text-gray-600">{opportunity.impact_description}</p>
            </section>

            {opportunity.skills_required && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Required Skills</h2>
                <p className="text-gray-600">{opportunity.skills_required}</p>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Details</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Time Commitment</p>
                    <p className="text-gray-600">{opportunity.time_commitment}</p>
                  </div>
                </div>

                {opportunity.event_type === 'recurring' ? (
                  <div className="flex gap-3">
                    <Repeat className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Schedule</p>
                      <p className="text-gray-600">{opportunity.recurring_schedule}</p>
                    </div>
                  </div>
                ) : opportunity.event_date && (
                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-gray-600">
                        {format(new Date(opportunity.event_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">
                      {opportunity.street_address}<br />
                      {opportunity.city}, {opportunity.state} {opportunity.postal_code}
                    </p>
                  </div>
                </div>
              </div>

              {opportunity.sign_up_external ? (
                <Button 
                  className="w-full mt-6"
                  asChild
                >
                  <Link href={opportunity.external_signup_url} target="_blank" rel="noopener noreferrer">
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button className="w-full mt-6">
                  Express Interest
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}