import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sensorRoutes from './routes/sensor.routes.js';
import manageUserRoutes from './routes/manageuser.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', sensorRoutes);
app.use('/api/manage-user', manageUserRoutes);

// Basic Health Check
app.get('/', (req, res) => {
  res.send('Earth-To-Air API is running...');
});

app.listen(port, () => {
  console.log(`⚡️ [server]: API is running at http://localhost:${port}`);
});