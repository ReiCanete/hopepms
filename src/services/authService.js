import { supabase } from '../lib/supabaseClient';

export async function signUpWithEmail({ email, password, firstName, lastName, username }) {
  return await supabase.auth.signUp({ email, password, options: { data: { firstName, lastName, username } } });
}

export async function signInWithEmail({ email, password }) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}