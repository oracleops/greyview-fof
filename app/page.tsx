import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { SearchOpportunities } from '@/components/search-opportunities';
import { FeaturedOpportunities } from '@/components/featured-opportunities';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <Navbar />
      
      <section className="relative min-h-[600px] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-[#2952CC]">Volunteer</span> to create lasting{' '}
            <span className="text-[#2952CC]">Impact</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Connect with meaningful volunteer opportunities and create lasting change
            in your community
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              asChild
            >
              <Link href="/opportunities">Find Opportunities</Link>
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="bg-transparent border-2 hover:bg-white/10"
              asChild
            >
              <Link href="/about">FoF: Our Mission</Link>
            </Button>
          </div>

          <SearchOpportunities />
        </div>
      </section>

      <FeaturedOpportunities />

      <footer className="bg-[#1a1f2e] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-6">Stay updated with new opportunities</p>
            <form className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md bg-white/10 border border-white/20"
              />
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </footer>
    </main>
  );
}