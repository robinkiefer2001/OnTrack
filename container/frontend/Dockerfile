# SvelteKit frontend Dockerfile for CI/CD (COPY instead of git clone)
FROM node:20-bullseye-slim

WORKDIR /app

# Copy frontend source code from build context
COPY . .

# Install all dependencies (Svelte, DaisyUI, Chart.js, etc.)
RUN npm install --legacy-peer-deps && npm run build

# Expose port and run as a service
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]