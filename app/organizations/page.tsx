'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Organization {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  city: string;
  state: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('verified', true);

        if (error) throw error;
        setOrganizations(data || []);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  return (
    <main>
      <Navbar />
      
      <section className="relative min-h-[300px] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-10 w-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Partnered Organizations</h1>
          </div>
          <p className="text-xl max-w-3xl mx-auto">
            Working together to create positive change in our community
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  <Image
                    src={org.logo_url || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca'}
                    alt={org.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{org.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 line-clamp-2">{org.description}</p>
                  <p className="text-sm text-gray-500">{org.city}, {org.state}</p>
                  <Button 
                    onClick={() => router.push(`/organizations/${org.id}`)}
                    className="w-full bg-[#2952CC] hover:bg-[#1f3d99]"
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#2952CC] py-16 mt-12 rounded-3xl mx-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-white max-w-xl">
              <h2 className="text-3xl font-bold">Join Our Network</h2>
              <p className="text-white/90 text-lg">
                Are you a non-profit organization looking to connect with volunteers? Join our network and start making a difference today.
              </p>
              <Button 
                asChild
                className="bg-white text-[#2952CC] hover:bg-white/90"
              >
                <Link href="/apply">Register Your Organization</Link>
              </Button>
            </div>
            <div className="w-64 h-64 relative opacity-20">
              <Building2 className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}