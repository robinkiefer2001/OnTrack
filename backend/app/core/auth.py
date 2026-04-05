from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os

# Stelle sicher, dass der Public Key und Algorithmus korrekt sind!
JWT_PUBLIC_KEY = os.getenv("AUTHENTIK_PUBLIC_KEY", "DEIN_PUBLIC_KEY")
JWT_ALGORITHM = os.getenv("AUTHENTIK_ALGORITHM", "RS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_PUBLIC_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        groups = payload.get("groups", [])
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No user in token")
        # Extrahiere alle tenant-rollen
        tenant_roles = [g for g in groups if g.startswith("tenant-")]
        # Optional: tenant und rolle extrahieren
        tenants = {}
        for g in tenant_roles:
            # Format: tenant-abc-admin
            parts = g.split("-")
            if len(parts) >= 3:
                tenant = parts[1]
                role = "-".join(parts[2:])
                tenants[tenant] = role
        return {"user_id": user_id, "groups": groups, "tenant_roles": tenant_roles, "tenants": tenants}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
