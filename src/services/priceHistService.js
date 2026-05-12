import { supabase } from '../lib/supabaseClient';
import { makeStamp } from '../utils/stampHelper';

// ── Fetch price history for a product ────────────────────────────────────────
export async function fetchPriceHistory(prod_code) {
  const { data, error } = await supabase
    .from('price_hist')
    .select('*')
    .eq('prod_code', prod_code)
    .order('eff_date', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Add a new price entry ─────────────────────────────────────────────────────
// eff_date + prod_code is composite PK — DB will reject duplicates automatically
export async function addPriceEntry({ prod_code, eff_date, unit_price, userId }) {
  const stamp = makeStamp('ADD', userId);
  const { data, error } = await supabase
    .from('price_hist')
    .insert([{
      prod_code,
      eff_date,
      unit_price,
      modified_by: userId,
      created_at: new Date().toISOString(),
      stamp,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Edit unit_price only — eff_date is IMMUTABLE ──────────────────────────────
// Never pass eff_date into the update payload.
export async function editPriceEntry({ prod_code, eff_date, unit_price, userId }) {
  const stamp = makeStamp('EDIT', userId);
  const { data, error } = await supabase
    .from('price_hist')
    .update({ unit_price, modified_by: userId, stamp })
    .eq('prod_code', prod_code)
    .eq('eff_date', eff_date)
    .select()
    .single();
  if (error) throw error;
  return data;
}
