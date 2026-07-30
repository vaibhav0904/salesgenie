-- Seed tenant A: Oak & Ember Interiors, fully configured. Idempotent (upserts).
-- Catalog mirror: data/catalog-oakember.csv. Tenant B is intentionally NOT seeded (born via MCP in E8).

BEGIN;

INSERT INTO vaibhavcapstone_businesses (business_id, name, industry, config) VALUES (
  'biz_oakember',
  'Oak & Ember Interiors',
  'furniture-retail',
  '{
    "tone": "warm, knowledgeable, unhurried; craftsmanship-proud; no pushy sales language; sign off as \"The Oak & Ember Team\"",
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "reviewer_email": "reviewer@example.com",
    "sender_identity": "reviewer@example.com",
    "intake_email": "reviewer@example.com",
    "customer_email_redirect": "reviewer@example.com",
    "scoring": {
      "weights": {
        "base_enquiry": 15,
        "contact_name": 10,
        "product_interest": 20,
        "budget_stated": 25,
        "budget_fit_bonus": 15,
        "budget_below_catalog_penalty": 40,
        "urgency_high": 20,
        "urgency_medium": 10,
        "company": 10
      },
      "thresholds": { "hot_min": 70, "warm_min": 40 }
    }
  }'::jsonb
)
ON CONFLICT (business_id) DO UPDATE
  SET name = EXCLUDED.name, industry = EXCLUDED.industry,
      config = EXCLUDED.config, updated_at = now();

INSERT INTO vaibhavcapstone_products (business_id, sku, name, category, price, currency, stock_qty, attributes) VALUES
  ('biz_oakember','SOF-001','Aria 3-Seater Fabric Sofa','sofas',45999,'INR',8,'{"material":"fabric","seats":3,"color":"slate grey"}'),
  ('biz_oakember','SOF-002','Ember Chesterfield Leather Sofa','sofas',89999,'INR',3,'{"material":"leather","seats":3,"color":"tan"}'),
  ('biz_oakember','SOF-003','Nook 2-Seater Loveseat','sofas',28999,'INR',0,'{"material":"fabric","seats":2,"color":"sage"}'),
  ('biz_oakember','BED-001','Rosewood King Bed','beds',74999,'INR',0,'{"size":"king","material":"rosewood"}'),
  ('biz_oakember','BED-002','Oakhaven Queen Bed with Storage','beds',58999,'INR',5,'{"size":"queen","material":"oak","storage":true}'),
  ('biz_oakember','DSK-001','Linea Executive Desk','desks',32999,'INR',12,'{"width_cm":160,"material":"walnut veneer"}'),
  ('biz_oakember','DSK-002','Flow Height-Adjustable Standing Desk','desks',41999,'INR',20,'{"width_cm":140,"motorized":true}'),
  ('biz_oakember','DSK-003','Compact Study Desk','desks',12999,'INR',25,'{"width_cm":100,"material":"engineered wood"}'),
  ('biz_oakember','CHR-001','ErgoPro High-Back Mesh Chair','office-chairs',18999,'INR',40,'{"lumbar_support":true,"headrest":true}'),
  ('biz_oakember','CHR-002','Atlas Ergonomic Task Chair','office-chairs',11999,'INR',60,'{"lumbar_support":true,"headrest":false}'),
  ('biz_oakember','CHR-003','Verve Visitor Chair','office-chairs',6999,'INR',30,'{"stackable":true}'),
  ('biz_oakember','DIN-001','Sheesham 6-Seater Dining Set','dining',64999,'INR',4,'{"seats":6,"material":"sheesham"}'),
  ('biz_oakember','DIN-002','Nordic 4-Seater Dining Table','dining',36999,'INR',7,'{"seats":4,"material":"oak"}'),
  ('biz_oakember','STO-001','Hana Wardrobe 3-Door','storage',44999,'INR',6,'{"doors":3,"mirror":true}'),
  ('biz_oakember','STO-002','Modular TV Unit','storage',21999,'INR',10,'{"width_cm":180}'),
  ('biz_oakember','STO-003','Shoe Cabinet','storage',8999,'INR',15,'{"pairs":18}'),
  ('biz_oakember','BSH-001','Ladder Bookshelf','bookshelves',9999,'INR',18,'{"shelves":5}'),
  ('biz_oakember','BSH-002','Wall-Mounted Shelf Set','bookshelves',4499,'INR',22,'{"pieces":3}'),
  ('biz_oakember','TBL-001','Walnut Coffee Table','tables',14999,'INR',9,'{"material":"walnut"}'),
  ('biz_oakember','TBL-002','Side Table Duo','tables',7499,'INR',14,'{"pieces":2}')
ON CONFLICT (business_id, sku) DO UPDATE
  SET name = EXCLUDED.name, category = EXCLUDED.category, price = EXCLUDED.price,
      currency = EXCLUDED.currency, stock_qty = EXCLUDED.stock_qty,
      attributes = EXCLUDED.attributes, updated_at = now();

COMMIT;
