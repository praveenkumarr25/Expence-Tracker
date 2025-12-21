const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB (free Atlas)
mongoose.connect('mongodb+srv://praveenkumar2525k_db_user:Praveen2005k@cluster0.cvpwe40.mongodb.net/?appName=Cluster0')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: String,
  type: String,
  category: String,
  description: String,
  amount: Number,
  paymentMethod: String
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user._id, email } });
  } catch (error) {
    res.status(400).json({ error: 'User exists' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user._id, email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/transactions', authMiddleware, async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.userId }).sort({ date: -1 });
  res.json(transactions);
});

app.post('/api/transactions', authMiddleware, async (req, res) => {
  const transaction = new Transaction({ ...req.body, userId: req.user.userId });
  await transaction.save();
  res.json(transaction);
});

app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
  await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true });
});

app.listen(5000, () => console.log('🚀 Backend running on http://localhost:5000'));
