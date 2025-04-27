'use client';

import { Building2, MapPin, Globe, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface OrganizationDetailsProps {
  organization: {
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
  };
  montserrat: any;
}

export function OrganizationDetails({ organization, montserrat }: OrganizationDetailsProps) {
  return (
    <>
      <div 
        className="h-[400px] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${organization.logo_url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className={`max-w-4xl mx-auto px-4 text-white space-y-4 ${montserrat.className}`}>
            <div className="flex items-center gap-2 text-white/90">
              <Building2 className="h-5 w-5" />
              <span className="text-lg">Partner Organization</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{organization.name}</h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="h-5 w-5" />
              <span>{organization.address}, {organization.city}, {organization.state} {organization.postal_code}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className={`${montserrat.className} text-2xl font-bold mb-4`}>About {organization.name}</h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{organization.description}</p>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className={`${montserrat.className} font-semibold mb-4`}>Contact Information</h3>
              
              <div className="space-y-4">
                {organization.contact_email && (
                  <div className="flex gap-3">
                    <Mail className="h-5 w-5 text-[#2952CC]" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a 
                        href={`mailto:${organization.contact_email}`}
                        className="text-[#2952CC] hover:underline"
                      >
                        {organization.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {organization.contact_phone && (
                  <div className="flex gap-3">
                    <Phone className="h-5 w-5 text-[#2952CC]" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a 
                        href={`tel:${organization.contact_phone}`}
                        className="text-[#2952CC] hover:underline"
                      >
                        {organization.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {organization.website && (
                  <div className="flex gap-3">
                    <Globe className="h-5 w-5 text-[#2952CC]" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2952CC] hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-[#2952CC]" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">
                      {organization.address}<br />
                      {organization.city}, {organization.state} {organization.postal_code}
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-[#2952CC] hover:bg-[#1f3d99]"
                asChild
              >
                <Link href="/opportunities">View Opportunities</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}