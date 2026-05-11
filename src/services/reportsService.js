import { supabase } from '../lib/supabaseClient';

export async function getProductReport() {
  return await supabase.from('current_product_price')
    .select('*').eq('record_status','ACTIVE').order('prodCode');
}

export async function getTopSellingReport() {
  return await supabase.from('top_selling_products').select('*').limit(10);
}