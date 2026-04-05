# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /code

# Dependencies zuerst (Docker Cache nutzen)
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# App-Code
COPY ./app /code/app

# Provision Authentik roles/groups at container startup
RUN chmod +x /code/app/core/provision_roles.sh

ENTRYPOINT ["/code/app/core/provision_roles.sh"]
CMD ["fastapi", "run", "app/main.py", "--port", "4000"]