import json
from .authentik_api import ensure_group
import os

ROLES_PATH = os.path.join(os.path.dirname(__file__), "roles.json")

def provision_roles_in_authentik():
    """Liest die Rollen aus roles.json und stellt sicher, dass jede Rolle als Gruppe in Authentik existiert."""
    with open(ROLES_PATH, "r", encoding="utf-8") as f:
        roles = json.load(f)
    for role in roles:
        ensure_group(role["name"])

if __name__ == "__main__":
    provision_roles_in_authentik()
