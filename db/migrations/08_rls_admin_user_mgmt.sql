DROP TABLE IF EXISTS "UserModule_Rights" CASCADE;
DROP TABLE IF EXISTS "app_user" CASCADE;

CREATE TABLE "app_user" (
  "userId" TEXT PRIMARY KEY, 
  user_type TEXT CHECK (user_type IN ('USER', 'ADMIN', 'SUPERADMIN')),
  record_status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE "UserModule_Rights" (
  id SERIAL PRIMARY KEY,
  "userId" TEXT REFERENCES "app_user"("userId"), 
  module_name TEXT,
  record_status TEXT DEFAULT 'ACTIVE'
);

ALTER TABLE "app_user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserModule_Rights" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_policy" ON "app_user"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "app_user" u2
    WHERE u2."userId" = auth.uid()::text
    AND u2.user_type IN ('ADMIN','SUPERADMIN') 
    AND u2.record_status = 'ACTIVE'
  )
);

CREATE POLICY "user_update_policy" ON "app_user"
FOR UPDATE USING (
  user_type != 'SUPERADMIN'
  AND EXISTS (
    SELECT 1 FROM "app_user" u2
    WHERE u2."userId" = auth.uid()::text
    AND u2.user_type IN ('ADMIN','SUPERADMIN') 
    AND u2.record_status = 'ACTIVE'
  )
);

CREATE POLICY "rights_select_own_policy" ON "UserModule_Rights"
FOR SELECT USING ("userId" = auth.uid()::text);

CREATE POLICY "rights_select_superadmin_policy" ON "UserModule_Rights"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "app_user" 
    WHERE "userId" = auth.uid()::text 
    AND user_type = 'SUPERADMIN'
  )
);