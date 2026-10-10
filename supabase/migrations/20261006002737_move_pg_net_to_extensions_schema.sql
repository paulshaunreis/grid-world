-- pg_net is non-relocatable, so recreate it in the dedicated extensions schema.
-- The live request queue and response table were verified empty before applying.
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;
