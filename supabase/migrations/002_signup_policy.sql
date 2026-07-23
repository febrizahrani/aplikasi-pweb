-- Allow new users to insert their own profile during signup
-- This policy lets the signup server action create a users row
-- when the auth user doesn't exist yet in public.users

create policy "Allow insert for new user signup"
  on public.users for insert
  with check (true);

-- Allow the trigger (handle_new_user) to insert into users table
-- The trigger runs as SECURITY DEFINER so it bypasses RLS,
-- but this policy provides a fallback for the server action insert
