DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS sales_detail CASCADE; 
DROP VIEW IF EXISTS top_selling_products CASCADE;

CREATE TABLE product (
  prod_code VARCHAR(6) PRIMARY KEY,
  description TEXT,
  unit VARCHAR(20),
  record_status VARCHAR(10) DEFAULT 'ACTIVE'
);

CREATE TABLE sales_detail (
  sale_id VARCHAR(20),
  prod_code VARCHAR(6) REFERENCES product(prod_code),
  quantity INT CHECK (quantity > 0),
  sale_date DATE,
  PRIMARY KEY (sale_id, prod_code)
);

CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
    p.prod_code, 
    p.description, 
    p.unit, 
    COALESCE(SUM(sd.quantity), 0) AS total_qty
FROM product p
LEFT JOIN sales_detail sd ON sd.prod_code = p.prod_code
WHERE p.record_status = 'ACTIVE'
GROUP BY p.prod_code, p.description, p.unit
ORDER BY total_qty DESC
LIMIT 10;