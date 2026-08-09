-- Private bucket for plant photos. Path convention: {user_id}/{plant_id}/{uuid}.{ext}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plant-photos',
  'plant-photos',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- storage.objects already has RLS enabled by Supabase by default.
create policy "plant_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'plant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "plant_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'plant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
