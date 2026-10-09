-- Seed the fictional tool catalog and the Fauxdoo Suite price.
-- All names and prices are made up.

INSERT INTO tools (slug, name, replaces, category, per_user_cents, flat_cents, active, sort_order) VALUES
  ('tasks', 'Taskana',   'Asana/Jira/Monday', 'Projects',   2000, 0,     1, 1),
  ('books', 'Fastbooks', 'QuickBooks',        'Accounting', 0,    8000,  1, 2),
  ('shop',  'Buyify',    'Shopify',           'eCommerce',  0,    8000,  1, 3),
  ('chat',  'Slick',     'Slack',             'Chat',       1600, 0,     1, 4),
  ('cms',   'Siteflo',   'Webflow',           'Website',    0,    4000,  1, 5),
  ('crm',   'Dealforce', 'Salesforce',        'CRM',        0,    10000, 1, 6);

INSERT INTO settings (key, value) VALUES ('suite_per_user_cents', '1200');
