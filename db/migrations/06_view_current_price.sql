CREATE OR REPLACE VIEW current_product_price AS
SELECT
  p.prod_code, 
  p.description, 
  p.unit, 
  p.record_status, 
  p.stamp,
  ph.unit_price, 
  ph.eff_date
FROM product p
LEFT JOIN price_hist ph ON ph.prod_code = p.prod_code
  AND ph.eff_date = (
    SELECT MAX(eff_date) 
    FROM price_hist 
    WHERE prod_code = p.prod_code
  )
ORDER BY p.prod_code;