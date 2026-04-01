# Minimal Dockerfile for Python backend
FROM python:3.12-alpine
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt || true
EXPOSE 8000
CMD ["python", "run.py"]