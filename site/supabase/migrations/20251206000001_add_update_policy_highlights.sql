create policy "Users can update their own highlights"
  on public.document_highlights for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
