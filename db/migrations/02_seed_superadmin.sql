DO $$
DECLARE v_id UUID := 'b56b3d26-59b0-48a9-bb4e-92c03261dac4';
BEGIN

  INSERT INTO app_user (user_id, username, last_name, first_name, user_type, record_status, stamp)
  VALUES (v_id, 'Jerry', 'Esperanza', 'Jeremias', 'SUPERADMIN', 'ACTIVE', 'SEEDED SUPERADMIN')
  ON CONFLICT (user_id) DO UPDATE 
  SET user_type = 'SUPERADMIN', record_status = 'ACTIVE';

  INSERT INTO user_module (user_id, module_id, rights_value, record_status, stamp) 
  VALUES
    (v_id, 'Prod_Mod', 1, 'ACTIVE', 'SEEDED'),
    (v_id, 'Report_Mod', 1, 'ACTIVE', 'SEEDED'),
    (v_id, 'Adm_Mod', 1, 'ACTIVE', 'SEEDED')
  ON CONFLICT DO NOTHING;

 
  INSERT INTO user_module_rights (user_id, right_id, right_value, record_status, stamp) 
  VALUES
    (v_id, 'PRD_ADD', 1, 'ACTIVE', 'SEEDED'),
    (v_id, 'PRD_EDIT', 1, 'ACTIVE', 'SEEDED'),
    (v_id, 'PRD_DEL', 1, 'ACTIVE', 'SEEDED'),
    (v_id, 'REP_001', 1, 'ACTIVE', 'SEEDED'),
    (v_id, 'REP_002', 1, 'ACTIVE', 'SEEDED'),
    (v_id, 'ADM_USER', 1, 'ACTIVE', 'SEEDED')
  ON CONFLICT DO NOTHING;
END $$;