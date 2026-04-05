import requests
import os

authentik_url = os.getenv("AUTHENTIK_URL", "http://localhost:9000")
authentik_token = os.getenv("AUTHENTIK_TOKEN", "changeme")

HEADERS = {
    "Authorization": f"Bearer {authentik_token}",
    "Content-Type": "application/json"
}

def create_group(name: str, parent: int = None):
    """Erstellt eine neue Gruppe (z.B. tenant-abc-admin) in Authentik."""
    data = {"name": name}
    if parent:
        data["parent"] = parent
    resp = requests.post(f"{authentik_url}/api/v3/core/groups/", json=data, headers=HEADERS)
    resp.raise_for_status()
    return resp.json()

def get_group_by_name(name: str):
    resp = requests.get(f"{authentik_url}/api/v3/core/groups/?name={name}", headers=HEADERS)
    resp.raise_for_status()
    results = resp.json().get("results", [])
    return results[0] if results else None

def ensure_group(name: str, parent: int = None):
    group = get_group_by_name(name)
    if group:
        return group
    return create_group(name, parent)
