'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Opportunity {
  id: string;
  name: string;
  organization_id: string;
  description: string;
  image_url: string;
  location: string;
  active: boolean;
}

export function FeaturedOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const router = useRouter();
  const [displayCount, setDisplayCount] = useState('10');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const fetchSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  }, []);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        let query = supabase
          .from('volunteer_opportunities')
          .select(`
            id,
            name,
            organization_id,
            description,
            image_url,
            location,
            active
          `)
          .eq('active', true);

        if (session) {
          // Add any authenticated user specific filters here if needed
        }

        const { data, error } = await query.limit(parseInt(displayCount));

        if (error) {
          console.error('Error fetching opportunities:', error);
          return;
        }

        setOpportunities(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
    fetchOpportunities();
  }, [displayCount, session, fetchSession]);

  return (
    <section className="w-full max-w-6xl mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Featured Opportunities</h2>
        <Select 
          value={displayCount} 
          onValueChange={setDisplayCount}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Show" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Show 5</SelectItem>
            <SelectItem value="10">Show 10</SelectItem>
            <SelectItem value="20">Show 20</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={opportunity.image_url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a'}
                  alt={opportunity.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{opportunity.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 line-clamp-2">{opportunity.description}</p>
                <p className="text-sm text-gray-500 mt-2">{opportunity.location}</p>
                <Button 
                  onClick={() => router.push(`/opportunities/${opportunity.id}`)}
                  className="w-full"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}