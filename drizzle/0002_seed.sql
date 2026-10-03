-- Seed the fictional tool catalog and the Fauxdoo Suite price.
-- All names and prices are made up.

INSERT INTO tools (slug, name, replaces, category, per_user_cents, flat_cents, active, sort_order) VALUES
  ('tasks', 'Taskana',   'Asana/Jira/Monday', 'Project management', 2000, 0,    1, 1),
  ('books', 'Fastbooks', 'QuickBooks',        'Accounting',         0,    7600, 1, 2),
  ('shop',  'Buyify',    'Shopify',           'eCommerce',          0,    7900, 1, 3),
  ('chat',  'Slick',     'Slack',             'Chat',               800,  0,    1, 4),
  ('cms',   'Siteflow',  'Webflow',           'CMS',                0,    3900, 1, 5),
  ('crm',   'Dealforce', 'Salesforce',        'CRM',                5000, 0,    1, 6);

INSERT INTO settings (key, value) VALUES ('suite_per_user_cents', '1200');
