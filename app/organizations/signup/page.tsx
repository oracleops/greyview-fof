'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Mail, Phone, MapPin, Globe, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OrganizationSignup() {
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        if (img.width < 800 || img.height < 800) {
          setImageError('Image must be at least 800x800 pixels');
          e.target.value = '';
        }
      };
    }
  };

  return (
    <main>
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Partner with Fishers of Families</CardTitle>
            <CardDescription>
              Register your organization to post volunteer opportunities and connect with dedicated volunteers
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Details
                </h3>
                
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" placeholder="Enter organization name" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Organization Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Tell us about your organization's mission and impact"
                      className="h-24"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="logo" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Organization Logo
                    </Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-gray-500">
                      Upload a high-quality logo (minimum 800x800 pixels)
                    </p>
                    {imageError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{imageError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </h3>
                
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="Enter street address" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="City" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="State" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="postal">Postal Code</Label>
                      <Input id="postal" placeholder="Postal code" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="Country" defaultValue="United States" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h3>
                
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="organization@example.com" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="(555) 555-5555" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="website" className="pl-9" placeholder="https://www.example.org" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-[#2952CC] hover:bg-[#1f3d99]">
                  Submit Application
                </Button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}