'use client';

import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SearchOpportunities() {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input 
          placeholder="Search opportunities..." 
          className="pl-10"
        />
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input 
          placeholder="Enter location..." 
          className="pl-10"
        />
      </div>
      <Select defaultValue="25">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Distance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">Within 5 miles</SelectItem>
          <SelectItem value="10">Within 10 miles</SelectItem>
          <SelectItem value="25">Within 25 miles</SelectItem>
          <SelectItem value="50">Within 50 miles</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}