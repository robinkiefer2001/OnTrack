-- Datenbanken
CREATE DATABASE AuthentikDB;

-- User
CREATE USER svc_authentik WITH PASSWORD '__PASSWORD__';

-- Rechte
GRANT ALL PRIVILEGES ON DATABASE AuthentikDB TO svc_authentik;
