ALTER TABLE product ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_select_policy" ON product;

CREATE POLICY "product_select_policy" ON product
FOR SELECT USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM app_user
    WHERE user_id = auth.uid()::text
    AND user_type IN ('ADMIN', 'SUPERADMIN')
    AND record_status = 'ACTIVE'
  )
);