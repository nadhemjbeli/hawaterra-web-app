-- Allow users to delete their own observations (V0.1 originally left this
-- select/insert-only; a remove button on the plant detail page needs it).
create policy "observation_delete_own" on observation
  for delete using (user_id = auth.uid());
