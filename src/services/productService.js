import { supabase } from '../lib/supabaseClient';
import { makeStamp } from '../utils/stampHelper';

// ── Fetch all ACTIVE products with current price (from view) ──────────────────
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('current_product_price')
    .select('*')
    .eq('record_status', 'ACTIVE')
    .order('prod_code', { ascending: true });
  if (error) throw error;
  return data;
}

// ── Fetch all INACTIVE products (Deleted Items page) ─────────────────────────
export async function fetchDeletedProducts() {
  const { data, error } = await supabase
    .from('current_product_price')
    .select('*')
    .eq('record_status', 'INACTIVE')
    .order('prod_code', { ascending: true });
  if (error) throw error;
  return data;
}

// ── Add product (auto-generates prod_code via DB function) ────────────────────
export async function addProduct({ description, unit, userId }) {
  // 1. Generate prod_code
  const { data: codeData, error: codeError } = await supabase.rpc('generate_prod_code');
  if (codeError) throw codeError;
  const prod_code = codeData;

  // 2. Insert product
  const stamp = makeStamp('ADD', userId);
  const { data, error } = await supabase
    .from('product')
    .insert([{ prod_code, description, unit, record_status: 'ACTIVE', stamp }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Edit product ──────────────────────────────────────────────────────────────
export async function editProduct({ prod_code, description, unit, userId }) {
  const stamp = makeStamp('EDIT', userId);
  const { data, error } = await supabase
    .from('product')
    .update({ description, unit, stamp })
    .eq('prod_code', prod_code)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Deactivate product (soft delete) ─────────────────────────────────────────
export async function deactivateProduct({ prod_code, userId }) {
  const stamp = makeStamp('DEACTIVATE', userId);
  const { data, error } = await supabase
    .from('product')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('prod_code', prod_code)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Recover product ───────────────────────────────────────────────────────────
export async function recoverProduct({ prod_code, userId }) {
  const stamp = makeStamp('RECOVER', userId);
  const { data, error } = await supabase
    .from('product')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('prod_code', prod_code)
    .select()
    .single();
  if (error) throw error;
  return data;
}
