import { supabase } from '../lib/supabaseClient';

// ── Fetch all products with current price for reports ─────────────────────────
export async function fetchReportData() {
  const { data, error } = await supabase
    .from('current_product_price')
    .select('prod_code, description, unit, unit_price, eff_date, record_status')
    .order('prod_code', { ascending: true });
  if (error) throw error;
  return data;
}

// ── CSV export helper ─────────────────────────────────────────────────────────
export function exportToCSV(data) {
  const headers = ['Product Code', 'Description', 'Unit', 'Current Price', 'Effective Date'];
  const rows = data.map(r => [
    r.prod_code,
    r.description,
    r.unit,
    r.unit_price ?? '',
    r.eff_date ?? '',
  ]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products_report.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF export helper (requires jsPDF + jspdf-autotable) ─────────────────────
// npm install jspdf jspdf-autotable
export async function exportToPDF(data) {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('HopePMS — Products Report', 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);

  doc.autoTable({
    startY: 28,
    head: [['Product Code', 'Description', 'Unit', 'Current Price', 'Effective Date']],
    body: data.map(r => [
      r.prod_code,
      r.description,
      r.unit,
      r.unit_price != null ? `₱${Number(r.unit_price).toFixed(2)}` : '—',
      r.eff_date ?? '—',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] }, // blue-800
  });

  doc.save('products_report.pdf');
}
