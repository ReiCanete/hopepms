- M1 (Full Stack Developer) - Integrated Product and Price History APIs with role-based access control, app-wide user rights handling, route protection for restricted pages, and improved product pages through error boundaries and loading states.
- M2 (Front-End Developer) - Developed product management UI components including product listing, add/edit forms, soft delete and recovery features, and price history management with role-based visibility and access control for USER, ADMIN, and SUPERADMIN accounts.
- M3 (Backend/Database Engineer) - Implemented Supabase RLS policies for products and price history with role-based permissions for viewing, adding, editing, deleting, and recovering records. Created the current_product_price SQL view to retrieve the latest product prices and tested all policies using user impersonation in the Supabase SQL editor.
- M4 (Rights & Authentication Specialist) - Implemented centralized role- and permission-based UI access using UserRightsContext and the useRights() hook, controlling visibility of add, edit, delete, stamp, and deleted items features based on user rights and account type.
- M5 (QA/Documentation) - Conducted and documented comprehensive testing for role-based access, soft-delete and recovery workflows, RLS security enforcement, UI visibility restrictions, and verification that no hard delete operations exist in the codebase, with all Sprint 2 tests successfully completed.

# Problems/Challenges Encounter:
- Code Error/Code does not work.

# Up Next:
- Add reports service and final App.jsx
- Add deployment guide
- Add REP_001 product report with search and CSV export
- Add admin page with user management and audit trail tabs
- Add top selling page and final polish
- Add top_selling_products view
- Add RLS for user table with SUPERADMIN guard
- Verify rights gating in production
- Confirm SUPERADMIN row protection
- Test: E2E rights regression test log
