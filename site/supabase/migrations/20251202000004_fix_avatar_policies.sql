-- Fix RLS policies for avatars bucket
drop policy if exists "anyone can upload a profile picture to a folder with their uid" on storage.objects;
drop policy if exists "anyone can update a profile picture in a folder with their uid" on storage.objects;
drop policy if exists "anyone can delete a profile picture in a folder with their uid" on storage.objects;
drop policy if exists "universal read on avatars" on storage.objects;

create policy "universal read on avatars"
on storage.objects
for select
using (
    bucket_id = 'avatars'
);

create policy "anyone can upload a profile picture to a folder with their uid"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "anyone can update a profile picture in a folder with their uid"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "anyone can delete a profile picture in a folder with their uid"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);
