'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-[#2952CC] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-yellow-400" fill="currentColor" />
            <span className="text-lg font-semibold">Fishers of Families</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/opportunities"
              className="text-white/90 hover:text-white transition-colors"
            >
              Browse Volunteer Opportunities
            </Link>
            <Link 
              href="/organizations"
              className="text-white/90 hover:text-white transition-colors"
            >
              Partnered Organizations
            </Link>
            <Link 
              href="/about"
              className="text-white/90 hover:text-white transition-colors"
            >
              About Us
            </Link>
          </div>

          <Button 
            asChild
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            <Link href="/auth/signup">
              Become a Volunteer
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}