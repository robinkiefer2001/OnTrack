-- Datenbanken
CREATE DATABASE authentikdb;

-- User
CREATE USER svc_authentik WITH PASSWORD '__PASSWORD__';

-- Rechte
GRANT ALL PRIVILEGES ON DATABASE authentikdb TO svc_authentik;
