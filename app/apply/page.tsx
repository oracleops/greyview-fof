'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Mail, Phone, MapPin, Globe, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogoUploader } from '@/components/logo-uploader';
import { supabase } from '@/lib/supabase';

interface FormData {
  name: string;
  description: string;
  logo_url?: string;
  website_url?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  email: string;
  phone: string;
}

export default function OrganizationApplication() {
  const router = useRouter();
  const [imageError, setImageError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const validateForm = (data: FormData) => {
    const errors: Partial<FormData> = {};
    
    if (!data.name.trim()) errors.name = 'Organization name is required';
    if (!data.description.trim()) errors.description = 'Description is required';
    if (!data.email.trim()) errors.email = 'Email is required';
    if (!data.phone.trim()) errors.phone = 'Phone number is required';
    if (!data.address.trim()) errors.address = 'Address is required';
    if (!data.city.trim()) errors.city = 'City is required';
    if (!data.state.trim()) errors.state = 'State is required';
    if (!data.postal_code.trim()) errors.postal_code = 'Postal code is required';
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    
    // Create properly typed data object
    const data: FormData = {
      name: formValues.name as string,
      description: formValues.description as string,
      website_url: formValues.website_url as string,
      address: formValues.address as string,
      city: formValues.city as string,
      state: formValues.state as string,
      postal_code: formValues.postal_code as string,
      country: formValues.country as string,
      email: formValues.email as string,
      phone: formValues.phone as string,
    };
    
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitStatus('loading');

    try {
      const { data: applicationData, error } = await supabase
        .from('organizations_applications')
        .insert([{ ...data, logo_url: null }]) // Initialize logo_url as null
        .select()
        .single();

      if (error) throw error;
      
      // If we have a logo file, upload it now that we have an applicationId
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${applicationData.id}/logo.${fileExt}`;

        // Upload to storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('org-logos')
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('org-logos')
          .getPublicUrl(filePath);

        // Update application with new logo URL
        const { error: updateError } = await supabase
          .from('organizations_applications')
          .update({ logo_url: publicUrl })
          .eq('id', applicationData.id);

        if (updateError) throw updateError;
      }

      // Only set success if we reach this point without errors
      setSubmitStatus('success'); 
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      if (submitStatus === 'error') {
        setSubmitStatus('idle');
      }
    }
  };

  if (submitStatus === 'success') {
    return (
      <main>
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="text-2xl font-bold">Application Submitted!</h2>
                <p className="text-gray-600">
                  Thanks! We've emailed you a link to sign up so you can manage your application.
                </p>
                <Button 
                  onClick={() => router.push('/')}
                  className="mt-4"
                >
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Details
                </h3>
                
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="Enter organization name"
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Organization Description</Label>
                    <Textarea 
                      id="description"
                      name="description"
                      placeholder="Tell us about your organization's mission and impact"
                      className={`h-24 ${formErrors.description ? 'border-red-500' : ''}`}
                    />
                    {formErrors.description && (
                      <p className="text-sm text-red-500">{formErrors.description}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <LogoUploader
                      disabled={submitStatus === 'loading'}
                      onFileSelect={(file) => {
                        setLogoFile(file);
                      }}
                    />
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
                    <Input 
                      id="address"
                      name="address"
                      placeholder="Enter street address"
                      className={formErrors.address ? 'border-red-500' : ''}
                    />
                    {formErrors.address && (
                      <p className="text-sm text-red-500">{formErrors.address}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city"
                        name="city"
                        placeholder="City"
                        className={formErrors.city ? 'border-red-500' : ''}
                      />
                      {formErrors.city && (
                        <p className="text-sm text-red-500">{formErrors.city}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state"
                        name="state"
                        placeholder="State"
                        className={formErrors.state ? 'border-red-500' : ''}
                      />
                      {formErrors.state && (
                        <p className="text-sm text-red-500">{formErrors.state}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input 
                        id="postal_code"
                        name="postal_code"
                        placeholder="Postal code"
                        className={formErrors.postal_code ? 'border-red-500' : ''}
                      />
                      {formErrors.postal_code && (
                        <p className="text-sm text-red-500">{formErrors.postal_code}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country"
                        name="country"
                        placeholder="Country"
                        defaultValue="United States"
                      />
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
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      placeholder="organization@example.com"
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 555-5555"
                      className={formErrors.phone ? 'border-red-500' : ''}
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="website_url">Website (Optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="website_url"
                        name="website_url"
                        className="pl-9"
                        placeholder="https://www.example.org"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {submitStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    There was an error submitting your application. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4">
                <Button 
                  type="submit"
                  className="w-full bg-[#2952CC] hover:bg-[#1f3d99]"
                  disabled={submitStatus === 'loading'}
                >
                  {submitStatus === 'loading' ? 'Submitting...' : 'Submit Application'}
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