#!/bin/sh
# Wait for Authentik to be ready
set -e

until curl -sf http://ontrack-authentik:9000/; do
  echo "Waiting for Authentik..."
  sleep 5
done

# Erstelle API-Token für den Superuser (admin)
# Hinweis: Username und Passwort müssen bekannt sein oder als Secrets bereitgestellt werden
# Beispiel: initadmin@informait.ch/sicherespasswor
USERNAME=${AUTHENTIK_ADMIN_USER:-initadmin@informait.ch}
PASSWORD=${AUTHENTIK_INIT_ADMIN_PW}

TOKEN=$(curl -sf -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "'$USERNAME'", "password": "'$PASSWORD'"}' \
  http://ontrack-authentik:9000/api/v3/tokens/login/ | jq -r .token)

echo "$TOKEN" > /authentik-token/token.txt
