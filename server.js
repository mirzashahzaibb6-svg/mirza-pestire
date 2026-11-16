// =========================================
// MIRZA BAKERY — Express Backend Server
// =========================================

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// ---- Environment / Config ----
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_NAME = process.env.APP_NAME || 'Mirza Bakery';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const JWT_SECRET = process.env.JWT_SECRET || 'mirza-bakery-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

const CURRENCY = process.env.CURRENCY || 'PKR';
const DELIVERY_FEE = Number(process.env.DELIVERY_FEE) || 0;
const FREE_DELIVERY_ABOVE = Number(process.env.FREE_DELIVERY_ABOVE) || 0;
const TAX_PERCENT = Number(process.env.TAX_PERCENT) || 0;
const ORDER_PREFIX = process.env.ORDER_PREFIX || 'MRZ';

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'orders@mirzabakery.com';
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || '';
const SUPPORT_WHATSAPP = process.env.SUPPORT_WHATSAPP || '';

const ADMIN_NAME = process.env.ADMIN_NAME || 'Mirza Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Safety warning: a production deploy must have its own secret
if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠ JWT_SECRET is not set — using an insecure fallback!');
}

// ---- Middleware ----
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : '*';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ---- In-memory "database" (no SQL needed) ----
const db = {
  users: [],
  orders: [],
  products: [
    { id: 1, name: 'Easter Bundt Cake', price: 4500, category: 'Festive Collection', img: 'assets/images/cake1.jpg', rating: 5, stock: 10 },
    { id: 2, name: 'Marble Chocolate Bundt', price: 5200, category: 'Signature Series', img: 'assets/images/cake2.jpg', rating: 5, stock: 8 },
    { id: 3, name: 'Red Velvet Supreme', price: 5800, category: 'Luxury Selection', img: 'assets/images/cake3.jpg', rating: 5, stock: 6 },
    { id: 4, name: 'Classic Red Velvet Bundt', price: 4800, category: 'Classic Collection', img: 'assets/images/cake4.png', rating: 4, stock: 12 },
    { id: 5, name: 'Dark Chocolate Coconut', price: 6200, category: 'Exclusive Reserve', img: 'assets/images/cake5.jpg', rating: 5, stock: 4 },
    { id: 6, name: 'Chocolate Cream Filled', price: 5500, category: 'Signature Series', img: 'assets/images/cake6.jpg', rating: 5, stock: 7 },
  ]
};

// ---- JWT helpers ----
function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role || 'customer', type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

function authPayload(user) {
  return {
    token: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role || 'customer' }
  };
}

// ---- Auth Middleware ----
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type && payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ---- Error helper ----
function serverError(res, err, context) {
  console.error(`[${context}]`, err);
  res.status(500).json({ error: 'Server error' });
}

// =========================================
// ROUTES
// =========================================

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: APP_NAME,
    env: NODE_ENV,
    message: `✦ ${APP_NAME} API is running`,
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// ---- Store config (used by the frontend) ----
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    config: {
      appName: APP_NAME,
      currency: CURRENCY,
      deliveryFee: DELIVERY_FEE,
      freeDeliveryAbove: FREE_DELIVERY_ABOVE,
      taxPercent: TAX_PERCENT,
      orderPrefix: ORDER_PREFIX,
      contact: {
        email: SUPPORT_EMAIL,
        phone: SUPPORT_PHONE,
        whatsapp: SUPPORT_WHATSAPP
      }
    }
  });
});

// ---- Products ----
app.get('/api/products', (req, res) => {
  res.json({ success: true, products: db.products });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, product });
});

// ---- Auth: Register ----
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.users.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'customer',
      createdAt: new Date(),
    };
    db.users.push(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      ...authPayload(user)
    });
  } catch (err) {
    serverError(res, err, 'register');
  }
});

// ---- Auth: Login ----
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      ...authPayload(user)
    });
  } catch (err) {
    serverError(res, err, 'login');
  }
});

// ---- Auth: Refresh access token ----
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = db.users.find(u => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    res.json({ success: true, message: 'Token refreshed', ...authPayload(user) });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// ---- Auth: Get current user ----
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'customer'
    }
  });
});

// ---- Orders ----
app.post('/api/orders', authMiddleware, (req, res) => {
  const { items, total, address } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  const order = {
    id: `${ORDER_PREFIX}-${Date.now()}`,
    userId: req.user.id,
    userName: req.user.name,
    items,
    total,
    currency: CURRENCY,
    address: address || 'Not provided',
    status: 'confirmed',
    createdAt: new Date(),
  };
  db.orders.push(order);

  res.status(201).json({
    success: true,
    message: `Order ${order.id} confirmed!`,
    order
  });
});

app.get('/api/orders', authMiddleware, (req, res) => {
  const userOrders = db.orders.filter(o => o.userId === req.user.id);
  res.json({ success: true, orders: userOrders });
});

// ---- Contact form ----
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }
  console.log(`\n✦ New Contact Message\nTo: ${SUPPORT_EMAIL}\nFrom: ${name} <${email}>\nSubject: ${subject}\n${message}\n`);
  res.json({
    success: true,
    message: 'Message received! We will get back to you soon.',
    support: { email: SUPPORT_EMAIL, phone: SUPPORT_PHONE, whatsapp: SUPPORT_WHATSAPP }
  });
});

// ---- Serve frontend ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- Seed admin account from env ----
async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  if (db.users.find(u => u.email === ADMIN_EMAIL)) return;

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);
  db.users.push({
    id: Date.now(),
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    phone: '',
    role: 'admin',
    createdAt: new Date(),
  });
  console.log(`✦ Admin account ready: ${ADMIN_EMAIL}`);
}

// ---- Start ----
async function start() {
  await seedAdmin();

  app.listen(PORT, HOST, () => {
    console.log(`\n✦ ${APP_NAME} Server (${NODE_ENV})\n`);
    console.log(`🌐 Frontend: ${APP_URL}`);
    console.log(`📡 API: ${APP_URL}/api`);
    console.log(`\nRoutes:`);
    console.log(`  GET  /api/health`);
    console.log(`  GET  /api/config`);
    console.log(`  GET  /api/products`);
    console.log(`  POST /api/auth/register`);
    console.log(`  POST /api/auth/login`);
    console.log(`  POST /api/auth/refresh`);
    console.log(`  GET  /api/auth/me`);
    console.log(`  POST /api/orders`);
    console.log(`  POST /api/contact\n`);
  });
}

start();

module.exports = app;
