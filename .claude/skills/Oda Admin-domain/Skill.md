---
name: oda-admin-dashboard
description: Reference for the Oda Admin Dashboard (UAT) — navigation, sections, fields, filters, and actions for Sales Rep Management, Outlet Management, Credit Management, Promotion Management, Product Management, Rewards Management, Order Management, User Management, Content Management, Opay Account Management, and Rider Payment Methods. Use this whenever writing test cases, Playwright scripts, bug reports, or QA documentation for the Oda Admin Dashboard, or when asked how a specific dashboard page/feature works. Does not cover Route Management, or delete/archive/publish/permanent-removal actions.
---

# Oda Admin Dashboard

Web-based control panel for managing sales reps, outlets, credit, promotions, products, rewards,
orders, users, and compliance documents for the ODA business. Environment referenced: UAT.

## Login & navigation
- Login: Username (registered email) + Password → "Sign in"/"Login".
- Mobile/small screens: hamburger menu (☰, top-left) opens the main menu; sections with `›` expand into sub-sections; close via X or click outside.
- Every page shows a breadcrumb (e.g. `Outlet Management > All Outlets`); earlier breadcrumb steps are clickable.
- Row-level actions live behind a three-dot menu (⋮) at the end of each row, unless noted otherwise.

## Home
Landing page after login. Shows summary tiles ("Waiting for approval" count, "All outlets" count) and a short table of outlets waiting for approval. Click a tile to jump to that filtered list; "View More" opens the full list.

## Sections reference

| Section > Sub-section | Purpose | Key filters | Key actions |
|---|---|---|---|
| Sales Rep Mgmt > Sales Rep Activity | Daily clock-in/out, banking, visit counts per rep | Region, Depot, Date | Download CSV |
| Sales Rep Mgmt > Daily Outlet Plan | Planned outlet visits per rep per weekday | search (ED code/name), Day, Region, Depot | ⋮ → "View Daily Route" (ordered outlet list) |
| Sales Rep Mgmt > Daily Loadout ("Load Out Manager") | Products/targets loaded per rep for the day | search, Region, Depot | ⋮ → "View" (products, targets, qty sold) |
| Sales Rep Mgmt > Sales Rep Data Usage | Mobile data used per rep on the app | search, Region, Depot, Company, Distribution Channel, Time Period | Download CSV; ⋮ → "View Data Usage History" |
| Outlet Mgmt > Pending Outlets | New outlets awaiting approval | search, Region, Depot, Date Added/Updated | ⋮ → "View Outlet Details" (tabs: Outlet Details, Physical Address, Additional Info); "Approve Outlet"/"Reject Outlet" (authorised users only) |
| Outlet Mgmt > All Outlets | Full searchable outlet list | search, Status, Route Assigned, Region, Depot, ODA Merchant Onboarded, Phone Verified, Phone Correct, Date Added/Updated | "Create Outlet" (3-step form: Outlet Details → Physical Address → Additional Info → Update); ⋮ → "View Outlet Details" to edit; ⋮ → "Request to Archive" (not covered) |
| Outlet Mgmt > Outlet Retention | Outlet performance vs GMV sales target | search, Depot, Segment, Channel | Row icons: call, directions, map pin, view details |
| Outlet Mgmt > Outlet Archive Requests | Outlets requesting closure + reason | search, Region | ⋮ → "Archive Outlet"/"Reject Outlet" (not covered — permanent); Download CSV |
| Credit Mgmt > Credit Eligible SKUs | Which SKUs are creditable, per region | region list | ⋮ → "Edit Credit Eligibility" (tick/untick products) → Update |
| Credit Mgmt > Credit Limits | Max credit per outlet | search, Credit Eligible, Region, Credit Period Starting Date, Credit Limit | ⋮ → "Edit Credit Limit" (limit, period, Oda Merchant/Rider); ⋮ → "View Credit History" (read-only) |
| Credit Mgmt > Credit Utilisation | Credit used/settled/overdue per outlet | search, Credit Period, Region, Utilised, Limit, Overdue, Settled | "View Settlements" per row; Download CSV |
| Promotion Mgmt > Promotion Management | Discounts & bundle offers | search, Status, Type, Category, Hot Deal, Best Seller, Availability, Region, Depot, Distribution Channel, Offer Points | "Create Promotion" (type → visibility/channels → region → dates → qualifying items → rewarding items); ⋮ → "Edit" |
| Promotion Mgmt > Splash Alert Management | Pop-up alerts for riders/merchants | search, Status, Alert Type, Region, Depot, Alert Valid Period | "Create Splash Alert" (name, title, region, type, dates, daily frequency) |
| Product Mgmt > Category Management | Product categories & where shown | search | "Create New Category" (name, display on Merchant/Rider/USSD, order); ⋮ → "Edit Category" |
| Product Mgmt > Brand Management | Brands & their categories | search, Category | "Create New Brand"; ⋮ to edit |
| Product Mgmt > Supplier Management | Suppliers & brands they provide | search, Brand | "Create New Supplier"; ⋮ to edit |
| Product Mgmt > UOM Management | Units of Measure (Pack, Roll, Case…) | search | "Create New UOM"; ⋮ to edit |
| Product Mgmt > Product Management | Full SKU catalogue | search, Status, Category, Brand, Show on Rider/Merchant, Offer Points | ⋮ → "Edit" (name, category, brand, UOM, best-seller, visibility, image); ⋮ → "Manage Availability" |
| Product Mgmt > Competitor Product Management | Competitor products for comparison | search, Category, Status, Region, Depot | "Add New Competitor Product"; ⋮ to edit |
| Rewards Mgmt > Rewards Management | Loyalty rewards catalogue | search, Status, Category | "Create New Reward" (name, product, category, min points, UOM, qty, status); ⋮ to edit |
| Rewards Mgmt > Rewards Visibility | Which outlets (by region/depot) can see rewards | region/depot groups | "Select Outlets" or "Select All" toggle per depot; remove via "x"; Update |
| Order Management | All platform orders + totals (Total/Delivered/Cancelled/Expired) | search, Status, Region, Depot, Product Category, Platform, Created/Delivered/Cancelled At | 👁 icon → Order Details (tabs: Order Details, Delivery Details, Sale Rep & Depot) |
| User Management > User Management | Staff accounts (not outlet customers) | search, Region, Depot, Company, Distribution Channel, Role, Status | "Add New User" (Role → Personal Info → Company Info → save); ⋮ → "Edit" |
| User Management > User Issue | Reps with flagged issues (e.g. bad phone number) on a date | search, Date, User Issue, Region, Depot, Company | Download CSV |
| Content Mgmt > Compliance Document Management | Terms of Use / Privacy Policy versions | search, Type, Status | ⋮ → "View Document"; "Upload Document" (type, PDF <10MB) |
| Opay Account Management | Opay accounts linked to outlets | search, Region, Created At | Copy icon for Customer Code/Opay Account; "Create New Opay Account" (Customer Code, First/Last Name, Region) |
| Rider Payment Methods | Platform-wide toggle of payment methods riders can collect (Bank Transfer, Cash, OPay) × (Single Payment, Split Payment) | — | Toggle switches → Update/Cancel |

## Good practices / QA notes
- Most list pages support search + multiple dropdown/date filters, and a "Download CSV" export.
- Row actions are almost always behind the ⋮ (three-dot) menu; Order Management and Outlet Retention use inline icons instead.
- Records with live/financial data (Credit Limits, Opay accounts, Rider Payment Methods) warn that changes apply immediately/real-money — test with a small number of sample records, never bulk.
- **Not covered by this manual / treat as out of scope for standard "view/add/edit" test flows:** Route Management (whole section), deleting or permanently removing records, "Approve/Reject Outlet", "Archive Outlet"/"Reject Outlet" (archive requests), "Request to Archive", publishing a new Compliance Document version. These require an authorised user and extra caution.
- When practising/testing, change only a small number of test/sample records rather than many at once, and double-check money amounts, phone numbers, and addresses before Save/Update/Create.