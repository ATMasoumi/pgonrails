-- Add mastered_indices column to track which flashcards the user has mastered
alter table flashcards add column if not exists mastered_indices integer[] default '{}';

-- Add update policy for flashcards
create policy "Users can update their own flashcards"
  on flashcards for update
  using (auth.uid() = user_id);
