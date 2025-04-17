'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { supabase } from '@/lib/supabase';

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/signin');
      }
    };

    checkSession();
  }, [router]);

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold">Welcome to Fishers of Families!</h2>
              <p className="text-gray-600">
                Your account has been created successfully. You can now start exploring volunteer opportunities.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => router.push('/opportunities')}
                  className="bg-[#2952CC] hover:bg-[#1f3d99]"
                >
                  Browse Opportunities
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}