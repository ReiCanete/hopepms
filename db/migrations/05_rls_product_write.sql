CREATE TABLE IF NOT EXISTS usermodule_rights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, 
    right_id TEXT NOT NULL, 
    right_value INTEGER DEFAULT 0, 
    record_status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE usermodule_rights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_insert_policy" ON product;
DROP POLICY IF EXISTS "product_update_policy" ON product;

CREATE POLICY "product_insert_policy" ON product
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM usermodule_rights 
    WHERE user_id = auth.uid()::text 
    AND right_id = 'PRD_ADD' 
    AND right_value = 1 
    AND record_status = 'ACTIVE'
  )
);

CREATE POLICY "product_update_policy" ON product
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM usermodule_rights
    WHERE user_id = auth.uid()::text 
    AND right_id = 'PRD_EDIT' 
    AND right_value = 1 
    AND record_status = 'ACTIVE'
  )
);