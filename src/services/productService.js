import { supabase } from '../lib/supabaseClient';
import { makeStamp } from '../utils/stampHelper';

export async function getProducts(userType) {
  let query = supabase.from('product').select('prod_code,description,unit,record_status,stamp').order('prod_code');
  if (userType === 'USER') query = query.eq('record_status','ACTIVE');
  return await query;
}

export async function addProduct({ prod_code, description, unit, userId }) {
  const stamp = makeStamp('ADDED', userId);
  return await supabase.from('product').insert([{ prod_code, description, unit, record_status:'ACTIVE', stamp }]);
}

export async function updateProduct({ prod_code, description, unit, userId }) {
  const stamp = makeStamp('EDITED', userId);
  return await supabase.from('product').update({ description, unit, stamp }).eq('prod_code', prod_code);
}

export async function softDeleteProduct(prod_code, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  return await supabase.from('product').update({ record_status:'INACTIVE', stamp }).eq('prod_code', prod_code);
}

export async function recoverProduct(prod_code, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  return await supabase.from('product').update({ record_status:'ACTIVE', stamp }).eq('prod_code', prod_code);
}