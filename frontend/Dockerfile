# SvelteKit frontend Dockerfile with all dependencies
FROM node:20-bullseye-slim

# Install git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Clone the repository (frontend only)
WORKDIR /app
RUN git clone --depth 1 --branch main https://github.com/robinkiefer2001/OnTrack.git repo
WORKDIR /app/repo/frontend

# Install all dependencies (Svelte, DaisyUI, Chart.js, etc.)
RUN npm install --legacy-peer-deps && npm run build

# Expose port and run as a service
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]