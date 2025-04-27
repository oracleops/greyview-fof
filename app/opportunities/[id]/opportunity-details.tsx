'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Repeat, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { SignupDialog } from '@/components/signup-dialog';
import { useState } from 'react';

interface OpportunityDetailsProps {
  opportunity: {
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
  };
  montserrat: any;
}

export function OpportunityDetails({ opportunity, montserrat }: OpportunityDetailsProps) {
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <>
      <div 
        className="h-[400px] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${opportunity.image_url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className={`max-w-4xl mx-auto px-4 text-white space-y-4 ${montserrat.className}`}>
            <div className="flex items-center gap-2 text-white/90">
              <Building2 className="h-5 w-5" />
              <span className="text-lg">{opportunity.organization_name}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{opportunity.name}</h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="h-5 w-5" />
              <span>{opportunity.street_address}, {opportunity.city}, {opportunity.state} {opportunity.postal_code}</span>
            </div>
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
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className={`${montserrat.className} text-2xl font-bold mb-4`}>About this Opportunity</h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{opportunity.description}</p>
            </section>

            <section>
              <h2 className={`${montserrat.className} text-2xl font-bold mb-4`}>Impact</h2>
              <p className="text-gray-600 leading-relaxed">{opportunity.impact_description}</p>
            </section>

            {opportunity.skills_required && (
              <section>
                <h2 className={`${montserrat.className} text-2xl font-bold mb-4`}>Required Skills</h2>
                <p className="text-gray-600 leading-relaxed">{opportunity.skills_required}</p>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all hover:shadow-xl">
              <h3 className={`${montserrat.className} font-semibold mb-4`}>Details</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-[#2952CC]" />
                  <div>
                    <p className="font-medium">Time Commitment</p>
                    <p className="text-gray-600">{opportunity.time_commitment}</p>
                  </div>
                </div>

                {opportunity.event_type === 'recurring' ? (
                  <div className="flex gap-3">
                    <Repeat className="h-5 w-5 text-[#2952CC]" />
                    <div>
                      <p className="font-medium">Schedule</p>
                      <p className="text-gray-600">{opportunity.recurring_schedule}</p>
                    </div>
                  </div>
                ) : opportunity.event_date && (
                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-[#2952CC]" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-gray-600">
                        {format(new Date(opportunity.event_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.event_date && (
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-3">Add to Calendar</p>
                    <AddToCalendarButton
                      name={opportunity.name}
                      description={opportunity.description}
                      startDate={format(new Date(opportunity.event_date), 'yyyy-MM-dd')}
                      startTime={format(new Date(opportunity.event_date), 'HH:mm')}
                      endTime={format(new Date(opportunity.event_date), 'HH:mm')}
                      location={`${opportunity.street_address}, ${opportunity.city}, ${opportunity.state} ${opportunity.postal_code}`}
                      options={['Google', 'Apple', 'Microsoft365']}
                      buttonStyle="3d"
                      size="2"
                      label="Add to Calendar"
                      styleLight="--btn-background: #2952CC; --btn-text: #fff;"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-[#2952CC]" />
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
                  className="w-full mt-6 bg-[#2952CC] hover:bg-[#1f3d99] transition-all duration-200 hover:scale-[1.02]"
                  asChild
                >
                  <Link href={opportunity.external_signup_url} target="_blank" rel="noopener noreferrer">
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button 
                  className="w-full mt-6 bg-[#2952CC] hover:bg-[#1f3d99] transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => setSignupOpen(true)}
                >
                  Express Interest
                </Button>
              )}
            </div>
          </div>
        </div>
        <SignupDialog
          open={signupOpen}
          onOpenChange={setSignupOpen}
          opportunity={opportunity}
        />
      </div>
    </>
  );
}