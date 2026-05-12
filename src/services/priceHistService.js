import { supabase } from '../lib/supabaseClient';
import { makeStamp } from '../utils/stampHelper';

export async function getPriceHistory(prod_code) {
  return await supabase.from('price_hist')
    .select('eff_date,unit_price,stamp').eq('prod_code', prod_code)
    .order('eff_date', { ascending: false });
}

export async function addPriceEntry({ prod_code, eff_date, unit_price, userId }) {
  const stamp = makeStamp('ADDED', userId);
  return await supabase.from('price_hist').insert([{ prod_code, eff_date, unit_price, stamp }]);
}