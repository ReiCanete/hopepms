CREATE TABLE IF NOT EXISTS product (
    prod_code VARCHAR(6) PRIMARY KEY,
    description VARCHAR(30) NOT NULL,
    unit VARCHAR(3) CHECK (unit IN ('pc','ea','mtr','pkg','ltr')),
    record_status VARCHAR(10) DEFAULT 'ACTIVE',
    stamp VARCHAR(60)
);


CREATE TABLE IF NOT EXISTS price_hist (
    eff_date DATE,
    prod_code VARCHAR(6) REFERENCES product(prod_code),
    unit_price DECIMAL(10,2) CHECK (unit_price > 0),
    stamp VARCHAR(60),
    PRIMARY KEY (eff_date, prod_code)
);

CREATE TABLE IF NOT EXISTS app_user (
    user_id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(50),
    last_name VARCHAR(50),
    first_name VARCHAR(50),
    user_type VARCHAR(20) CHECK (user_type IN ('SUPERADMIN','ADMIN','USER')),
    record_status VARCHAR(10) DEFAULT 'INACTIVE',
    stamp VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS module (
    module_id VARCHAR(20) PRIMARY KEY,
    description VARCHAR(50),
    stamp VARCHAR(60)
);


CREATE TABLE IF NOT EXISTS user_module (
    user_id VARCHAR(100) REFERENCES app_user(user_id),
    module_id VARCHAR(20) REFERENCES module(module_id),
    rights_value INT DEFAULT 0,
    record_status VARCHAR(10) DEFAULT 'ACTIVE',
    stamp VARCHAR(60),
    PRIMARY KEY (user_id, module_id)
);


CREATE TABLE IF NOT EXISTS rights (
    right_id VARCHAR(20) PRIMARY KEY,
    description VARCHAR(50),
    module_id VARCHAR(20) REFERENCES module(module_id),
    stamp VARCHAR(60)
);


CREATE TABLE IF NOT EXISTS user_module_rights (
    user_id VARCHAR(100) REFERENCES app_user(user_id),
    right_id VARCHAR(20) REFERENCES rights(right_id),
    right_value INT DEFAULT 0,
    record_status VARCHAR(10) DEFAULT 'ACTIVE',
    stamp VARCHAR(60),
    PRIMARY KEY (user_id, right_id)
);


ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;


INSERT INTO module (module_id, description) VALUES
    ('Prod_Mod','Product Management'),
    ('Report_Mod','Reports'),
    ('Adm_Mod','Admin / User Management')
ON CONFLICT DO NOTHING;

INSERT INTO rights (right_id, description, module_id) VALUES
    ('PRD_ADD','Add Product','Prod_Mod'),
    ('PRD_EDIT','Edit Product','Prod_Mod'),
    ('PRD_DEL','Soft Delete Product','Prod_Mod'),
    ('REP_001','Product Report Listing','Report_Mod'),
    ('REP_002','Top Selling Report','Report_Mod'),
    ('ADM_USER','Manage Users','Adm_Mod')
ON CONFLICT DO NOTHING;

INSERT INTO product (prod_code, description, unit, record_status) VALUES
    ('AK0001','Ballpen Black','pc','ACTIVE'),
    ('AK0002','Folder Long','pc','ACTIVE'),
    ('AK0003','Tape Clear 1inch','pc','ACTIVE')
ON CONFLICT DO NOTHING;

INSERT INTO price_hist (eff_date, prod_code, unit_price) VALUES
    ('2025-01-01','AK0001',12.00),
    ('2025-01-01','AK0002',15.00),
    ('2025-01-01','AK0003',25.00)
ON CONFLICT DO NOTHING;