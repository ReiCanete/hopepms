import { supabase } from '../lib/supabaseClient';
import { makeStamp } from '../utils/stampHelper';

export async function getProducts(userType) {
  let query = supabase.from('product').select('prodCode,description,unit,record_status,stamp').order('prodCode');
  if (userType === 'USER') query = query.eq('record_status','ACTIVE');
  return await query;
}

export async function addProduct({ prodCode, description, unit, userId }) {
  const stamp = makeStamp('ADDED', userId);
  return await supabase.from('product').insert([{ prodCode, description, unit, record_status:'ACTIVE', stamp }]);
}

export async function updateProduct({ prodCode, description, unit, userId }) {
  const stamp = makeStamp('EDITED', userId);
  return await supabase.from('product').update({ description, unit, stamp }).eq('prodCode', prodCode);
}

export async function softDeleteProduct(prodCode, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  return await supabase.from('product').update({ record_status:'INACTIVE', stamp }).eq('prodCode', prodCode);
}

export async function recoverProduct(prodCode, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  return await supabase.from('product').update({ record_status:'ACTIVE', stamp }).eq('prodCode', prodCode);
}