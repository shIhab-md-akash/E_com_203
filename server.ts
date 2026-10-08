import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DJANGO_PORT = 8001;
const DJANGO_HOST = '127.0.0.1';

// 1. Ensure MariaDB is running
function ensureDatabaseRunning() {
  try {
    execSync('mariadb -u root -e "SELECT 1;"', { stdio: 'ignore' });
    console.log('[Database] MariaDB is already active and responding.');
  } catch (err) {
    console.log('[Database] Starting MariaDB service...');
    try {
      execSync('mkdir -p /var/run/mysqld && chown mysql:mysql /var/run/mysqld');
      spawn('/usr/bin/mysqld_safe', ['--user=mysql'], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      // wait a moment for socket
      execSync('sleep 3');
      console.log('[Database] MariaDB daemon started successfully.');
    } catch (e) {
      console.error('[Database] Failed starting MariaDB daemon:', e);
    }
  }
}

// 2. Start Django Backend Server
let djangoProcess: any = null;
function startDjangoServer() {
  ensureDatabaseRunning();

  const backendDir = path.resolve(__dirname, 'backend');
  const managePy = path.join(backendDir, 'manage.py');

  console.log(`[Django] Launching Django backend on http://${DJANGO_HOST}:${DJANGO_PORT}...`);
  djangoProcess = spawn('python3', [managePy, 'runserver', `${DJANGO_HOST}:${DJANGO_PORT}`, '--noreload'], {
    cwd: backendDir,
    env: {
      ...process.env,
      PYTHONPATH: backendDir,
      DJANGO_SETTINGS_MODULE: 'config.settings',
    },
    stdio: ['ignore', 'inherit', 'inherit']
  });

  djangoProcess.on('error', (err: any) => {
    console.error('[Django] Failed to start Django server:', err);
  });

  djangoProcess.on('exit', (code: number, signal: string) => {
    console.log(`[Django] Process exited with code ${code} signal ${signal}`);
  });
}

// Clean up processes on shutdown
process.on('SIGINT', () => {
  if (djangoProcess) djangoProcess.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  if (djangoProcess) djangoProcess.kill();
  process.exit();
});

async function startServer() {
  startDjangoServer();

  // Wait 1 second for Django socket
  await new Promise((res) => setTimeout(res, 1500));

  // Reverse proxy for Django endpoints
  const djangoProxy = createProxyMiddleware({
    target: `http://${DJANGO_HOST}:${DJANGO_PORT}`,
    changeOrigin: true,
    ws: true,
  });

  app.use((req, res, next) => {
    if (
      req.url.startsWith('/api') ||
      req.url.startsWith('/admin') ||
      req.url.startsWith('/static/admin') ||
      req.url.startsWith('/static/rest_framework') ||
      req.url.startsWith('/static/drf_spectacular')
    ) {
      return djangoProxy(req, res, next);
    }
    next();
  });

  // Vite development middleware or production static build
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FullStack] ApexStore Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[FullStack] Proxied Django REST API: http://0.0.0.0:${PORT}/api/`);
    console.log(`[FullStack] Swagger Documentation: http://0.0.0.0:${PORT}/api/docs/`);
  });
}

startServer();
