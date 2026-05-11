import { supabase } from '../lib/supabaseClient';
import { makeStamp } from '../utils/stampHelper';

export async function getPriceHistory(prodCode) {
  return await supabase.from('priceHist')
    .select('effDate,unitPrice,stamp').eq('prodCode',prodCode)
    .order('effDate', { ascending: false });
}


export async function addPriceEntry({ prodCode, effDate, unitPrice, userId }) {
  const stamp = makeStamp('ADDED', userId);
  return await supabase.from('priceHist').insert([{ prodCode, effDate, unitPrice, stamp }]);
}