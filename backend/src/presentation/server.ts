import express from 'express';
import { watchRoutes } from './routes/watchRoutes';
import { authRoutes } from './routes/authRoutes';
import { initDb } from '../infrastructure/database/postgres';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Enable CORS and handle Preflight (OPTIONS) requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clean Architecture Backend is running' });
});

// Mount Domain Routes
app.use('/api/watches', watchRoutes);
app.use('/api/auth', authRoutes);

// Initialize DB tables and start server
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
