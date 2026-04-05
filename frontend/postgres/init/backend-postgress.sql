-- Datenbanken
CREATE DATABASE authentikdb;

-- User
CREATE USER svc_authentik WITH PASSWORD '__PASSWORD__';

-- Rechte
GRANT ALL PRIVILEGES ON DATABASE authentikdb TO svc_authentik;

-- Connect and grant schema rights
\connect authentikdb
GRANT ALL ON SCHEMA public TO svc_authentik;
ALTER SCHEMA public OWNER TO svc_authentik;