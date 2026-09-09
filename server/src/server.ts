import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import hodRoutes from './routes/hodRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'College Management System API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();

export default app;
