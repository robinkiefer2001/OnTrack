-- Datenbanken
CREATE DATABASE AuthentikDB;

-- User
CREATE USER svc_authentik WITH PASSWORD '${AUTHENTIK_DB_PASSWORD}';

-- Rechte
GRANT ALL PRIVILEGES ON DATABASE AuthentikDB TO svc_authentik;
