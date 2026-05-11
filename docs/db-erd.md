# HopePMS Database ERD

## Tables
- product — stores all products with record_status and stamp
- price_hist — stores price history per product
- app_user — stores all registered users with user_type and record_status
- module — stores system modules
- user_module — maps users to modules
- rights — stores individual rights per module
- user_module_rights — maps users to specific rights

## Rights Matrix

| Right_ID | USER | ADMIN | SUPERADMIN |
|----------|------|-------|------------|
| PRD_ADD  | 1    | 1     | 1          |
| PRD_EDIT | 1    | 1     | 1          |
| PRD_DEL  | 0    | 0     | 1          |
| REP_001  | 1    | 1     | 1          |
| REP_002  | 0    | 0     | 1          |
| ADM_USER | 0    | 0     | 1          |