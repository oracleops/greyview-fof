import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';
import NextImage from 'next/image';
import { supabase } from '@/lib/supabase';

interface LogoUploaderProps {
  disabled?: boolean;
  onFileSelect?: (file: File) => void;
}

export function LogoUploader({ 
  disabled = false,
  onFileSelect
}: LogoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        if (img.width < 800 || img.height < 800) {
          setError('Image must be at least 800x800 pixels');
          resolve(false);
        } else {
          resolve(true);
        }
      };

      img.onerror = () => {
        setError('Invalid image file');
        resolve(false);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    const isValid = await validateImage(file);
    if (isValid) {
      setPreview(URL.createObjectURL(file));
      onFileSelect?.(file);
    } else {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="logo" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Organization Logo
        </Label>

        {preview && (
          <div className="relative w-32 h-32 mb-4">
            <NextImage
              src={preview}
              alt="Logo preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        <Input
          ref={fileInputRef}
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="cursor-pointer"
        />
        
        <p className="text-sm text-gray-500">
          Upload a high-quality logo (minimum 800x800 pixels, max 5MB)
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}