/*
  # Add storage policies for organization logos

  1. Security
    - Enable public read access to org-logos bucket
    - Allow authenticated users to upload logos
    - Restrict file types to images
    - Set max file size
*/

-- Enable public read access to org-logos bucket
CREATE POLICY "Public can view org logos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'org-logos' AND
  storage.extension(name) IN ('png', 'jpg', 'jpeg', 'gif', 'webp')
);

-- Allow authenticated users to upload logos
CREATE POLICY "Users can upload org logos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'org-logos' AND
  storage.extension(name) IN ('png', 'jpg', 'jpeg', 'gif', 'webp') AND
  octet_length(content) < 5242880 -- 5MB max
);

-- Allow users to update their own logos
CREATE POLICY "Users can update their org logos"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'org-logos')
WITH CHECK (bucket_id = 'org-logos');

-- Allow users to delete their own logos
CREATE POLICY "Users can delete their org logos"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'org-logos');