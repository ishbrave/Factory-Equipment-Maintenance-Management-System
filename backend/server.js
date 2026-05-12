require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { connectDB } = require('./db');
const { requireAuth } = require('./middleware/auth');
const { seedDefaultUser } = require('./utils/seedDefaultUser');

const authRoutes = require('./routes/auth');
const slotRoutes = require('./routes/slots');
const carRoutes = require('./routes/cars');
const recordRoutes = require('./routes/records');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/PSSMS';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: 'pssms.sid',
    secret: process.env.SESSION_SECRET || 'change_this_session_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      dbName: process.env.DB_NAME || 'PSSMS',
      collectionName: 'sessions',
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.get('/api/health', async (req, res) => {
  return res.json({ status: 'ok', service: 'PSSMS API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/slots', requireAuth, slotRoutes);
app.use('/api/cars', requireAuth, carRoutes);
app.use('/api/records', requireAuth, recordRoutes);
app.use('/api/payments', requireAuth, paymentRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  return res.status(500).json({ message: 'Internal server error.', error: error.message });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultUser();

    app.listen(PORT, () => {
      console.log(`PSSMS backend is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
};

startServer();
