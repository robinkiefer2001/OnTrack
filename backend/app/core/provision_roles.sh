#!/bin/sh
# Provision Authentik roles/groups at container startup
set -e

python -m app.core.provision_roles

exec "$@"
