insert into storage.buckets (id, name, public)
values ('note_assets', 'note_assets', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload note assets"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'note_assets' AND auth.uid() = owner );

create policy "Authenticated users can update note assets"
on storage.objects for update
to authenticated
using ( bucket_id = 'note_assets' AND auth.uid() = owner );

create policy "Authenticated users can delete note assets"
on storage.objects for delete
to authenticated
using ( bucket_id = 'note_assets' AND auth.uid() = owner );

create policy "Anyone can view note assets"
on storage.objects for select
to public
using ( bucket_id = 'note_assets' );
