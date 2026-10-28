# AgriPulse-AI Production Deployment Guide

This guide provides end-to-end instructions for deploying **AgriPulse-AI** to production across multiple environments:
1. [Docker Compose (Single-Command Local or Server Deployment)](#option-1-docker-compose-recommended)
2. [Cloud PaaS (Render & Vercel)](#option-2-cloud-paas-render--vercel)
3. [Virtual Private Server (VPS / Ubuntu / AWS EC2 / DigitalOcean)](#option-3-ubuntu-vps--aws-ec2--digitalocean)
4. [Environment Variables Reference](#environment-variables-reference)

---

## Pre-Deployment Checklist

Before deploying, ensure:
- [x] All backend unit and integration tests pass: `pytest` (54/54 passing)
- [x] Frontend builds cleanly without TypeScript errors: `npm run build`
- [x] CORS origin list allows the production frontend URL
- [x] Sensitive API keys (IMD, LLM, Database credentials) are set via environment variables (never committed to Git)

---

## Option 1: Docker Compose (Recommended)

Docker Compose bundles the **FastAPI Backend**, the **Nginx-served React Frontend**, and **PostgreSQL** into isolated containers that communicate over an internal network.

### Step 1: Install Docker
Make sure Docker Desktop (Windows/macOS) or Docker Engine + Docker Compose plugin (Linux) is installed:
```bash
docker --version
docker compose version
```

### Step 2: Build and Run Containers
From the root of the project (`AgriPulse-AI`):
```bash
docker compose up --build -d
```

### Step 3: Verify Running Services
```bash
docker compose ps
```
You should see 3 running containers:
- `agripulse-frontend` on port `80`
- `agripulse-backend` on port `8000`
- `agripulse-postgres` on port `5432`

### Step 4: Access the Application
- **Frontend App**: Open your browser at `http://localhost`
- **Backend API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/v1/health`

To stop the containers:
```bash
docker compose down
```

---

## Option 2: Cloud PaaS (Render & Vercel)

### Deploying the Backend on Render (Free / Starter Tier)
1. Push your repository to **GitHub** or **GitLab**.
2. Sign in to [Render.com](https://render.com).
3. Click **New +** > **Blueprint** and select your repository (Render will automatically detect `render.yaml`).
4. Alternatively, create a **Web Service**:
   - **Environment**: Python
   - **Root Directory**: `backend`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
5. Under **Environment Variables**, set:
   - `CORS_ORIGINS`: `https://your-frontend-domain.vercel.app`
   - `APP_NAME`: `AgriPulse AI`
   - `DATABASE_URL`: Your managed PostgreSQL URL

### Deploying the Frontend on Vercel
1. Sign in to [Vercel.com](https://vercel.com) and click **Add New...** > **Project**.
2. Import the `AgriPulse-AI` repository.
3. In Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api/v1`
5. Click **Deploy**. Vercel will build and assign an SSL-enabled `.vercel.app` domain.

---

## Option 3: Ubuntu VPS / AWS EC2 / DigitalOcean

### Step 1: Update Server and Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx git curl
```

### Step 2: Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/your-username/AgriPulse-AI.git
sudo chown -R $USER:$USER /var/www/AgriPulse-AI
cd AgriPulse-AI
```

### Step 3: Setup Backend Environment
```bash
cd /var/www/AgriPulse-AI/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Configure Systemd Daemon for FastAPI
Create a systemd service file:
```bash
sudo nano /etc/systemd/system/agripulse-backend.service
```
Paste the following:
```ini
[Unit]
Description=AgriPulse AI FastAPI Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/AgriPulse-AI/backend
Environment="PATH=/var/www/AgriPulse-AI/backend/venv/bin"
EnvironmentFile=/var/www/AgriPulse-AI/backend/.env
ExecStart=/var/www/AgriPulse-AI/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable agripulse-backend
sudo systemctl start agripulse-backend
sudo systemctl status agripulse-backend
```

### Step 5: Build Frontend
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

cd /var/www/AgriPulse-AI/frontend
npm install
# Set API base url to relative path /api/v1 (handled by Nginx reverse proxy)
echo "VITE_API_BASE_URL=/api/v1" > .env.production
npm run build
```

### Step 6: Configure Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/agripulse
```
Paste the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend SPA files
    location / {
        root /var/www/AgriPulse-AI/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API reverse proxy
    location /api/v1/ {
        proxy_pass http://127.0.0.1:8000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/agripulse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Enable HTTPS with Free Let's Encrypt SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Environment Variables Reference

| Variable | Location | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Frontend (`.env.production`) | Base URL for FastAPI backend endpoints | `/api/v1` or `https://api.yourdomain.com/api/v1` |
| `CORS_ORIGINS` | Backend (`.env`) | Comma-separated allowed web origins | `https://yourdomain.com,http://localhost:5173` |
| `DATABASE_URL` | Backend (`.env`) | PostgreSQL connection string | `postgresql+psycopg://user:pass@host:5432/dbname` |
| `WEATHER_PRIMARY_PROVIDER` | Backend (`.env`) | Primary meteorology provider | `open_meteo` |
| `WEATHER_FALLBACK_PROVIDER` | Backend (`.env`) | Fallback meteorology provider | `open_meteo` |
| `IMD_API_KEY` | Backend (`.env`) | Official IMD API key (optional) | *(Leave empty if using Open-Meteo)* |
| `LLM_PROVIDER` | Backend (`.env`) | LLM provider name | `ollama` or `groq` or `openai` |
| `LLM_API_KEY` | Backend (`.env`) | Optional API key for external LLM | *(Optional)* |
