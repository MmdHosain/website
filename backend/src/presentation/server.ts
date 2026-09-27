import express from 'express';
import { watchRoutes } from './routes/watchRoutes';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Enable simple CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clean Architecture Backend is running' });
});

// Mount Domain Routes
app.use('/api/watches', watchRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
