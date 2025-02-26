import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import adminuser from './schemas/adminuser.js';
import Course from './schemas/Course.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    }
  })
);

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB Connected!"))
.catch(err => console.log(err));

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Routes
app.get('/check-auth', (req, res) => {
  res.status(req.session.user ? 200 : 401).json({
    authenticated: !!req.session.user,
    user: req.session.user
  });
});

app.post('/adminlogin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error('Missing credentials');

    const admin = await adminuser.findOne({ username });
    if (!admin) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error('Invalid credentials');

    req.session.user = {
      id: admin._id,
      username: admin.username
    };

    req.session.save(err => {
      if (err) throw new Error('Session save failed');
      res.status(200).json({ 
        message: 'Login successful', 
        user: { username: admin.username }
      });
    });

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.post('/create-course', isAuthenticated, async (req, res) => {
  try {
  
    // Validate request body
    if (!req.body.course_name || typeof req.body.course_name !== 'string') {
      return res.status(400).json({ message: 'Invalid course name' });
    }

    // Create course with explicit field mapping
    const newCourse = new Course({
      course_name: req.body.course_name,
      semester_count: req.body.semester_count || 0,
      semesters: [],
      creation_time: new Date(),
      user_created: req.session.user.username
    });
    
    // Save and return response
    const savedCourse = await newCourse.save();
    res.status(201).json({
      message: "Course created successfully",
      course: savedCourse
    });
    
  } catch (error) {
    console.error("Creation error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Course name already exists",
        field: "course_name"
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: "Course creation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));