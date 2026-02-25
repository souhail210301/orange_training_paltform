// Load environment variables FIRST before any other require that might need them
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const formationRoutes = require('./routes/formationRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const catalogueRoutes = require('./routes/catalogueRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const universityRoutes = require('./routes/universityRoutes');
const universityRepresentativeRoutes = require('./routes/universityRepresentativeRoutes');
const trainingRequestRoutes = require('./routes/trainingRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/catalogues', catalogueRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/university-reps', universityRepresentativeRoutes);
app.use('/api/training-requests', trainingRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chatbot', chatbotRoutes);




// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error logging middleware (must be last, after all routes)
const logError = require('./middleware/logError');
app.use(logError);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});