-- Allow users to delete their own plant photos (row + underlying file).
create policy "plant_photo_delete_own" on plant_photo
  for delete using (user_id = auth.uid());

create policy "plant_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'plant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
