# Minimal Dockerfile for Python backend
FROM node:20-alpine
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN pip3 install --no-cache-dir -r requirements.txt || true
EXPOSE 8000
CMD ["python3", "run.py"]