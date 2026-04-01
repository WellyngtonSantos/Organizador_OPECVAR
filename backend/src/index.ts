import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const isProduction = env.NODE_ENV === 'production';

// Trust proxy when behind reverse proxy (Nginx, load balancer, etc.)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security headers — customized for production
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  } : false,
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false, // needed for some frontend assets
}));

// CORS — in production the frontend is served by this same server (same-origin),
// so browser requests from the UI never carry a cross-origin Origin header.
// We allow same-origin (no Origin header) and any explicitly listed origins.
// For local-network deployments we also accept private-network IPs automatically.
const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const isPrivateNetworkOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    );
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header = same-origin request (browser serving frontend from this server)
    if (!origin) {
      callback(null, true);
      return;
    }
    // Explicitly listed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    // Allow any private-network origin (safe for LAN deployments)
    if (isPrivateNetworkOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global rate limiter — prevents brute-force/DoS on all endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 200 : 1000, // tighter in production
  message: { error: 'Too Many Requests', message: 'Limite de requisicoes atingido. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (_req) => !isProduction, // skip in dev for convenience (individual route limits still apply)
});
app.use(globalLimiter);

// Body size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.use('/api', routes);

// === Servir frontend em produção ===
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Qualquer rota que não seja /api vai retornar o index.html (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
});

app.use(errorHandler);

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
