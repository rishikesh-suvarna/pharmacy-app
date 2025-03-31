import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { errorHandler } from './middleware/errorMiddleware';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import supplierRoutes from './routes/supplierRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import prescriptionRoutes from './routes/prescriptionRoutes';
import reportRoutes from './routes/reportRoutes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Pharmacy Admin API' });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

export default app;