'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { useRouter } from 'next/navigation';

export default function SignupConfirmation() {
  const router = useRouter();

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold">Thank You for Volunteering!</h2>
              <p className="text-gray-600">
                We've sent you an email with all the details about your volunteer opportunity.
                The organization will be notified of your interest and will contact you with any
                additional information.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Button 
                  onClick={() => router.push('/opportunities')}
                  className="bg-[#2952CC] hover:bg-[#1f3d99]"
                >
                  Browse More Opportunities
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