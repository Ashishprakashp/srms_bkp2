import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import adminuser from './schemas/adminuser.js'; // Ensure this path is correct
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'], // Modify to your frontend's URL
  credentials: true, // Allow cookies to be sent with requests
}));
app.use(express.json());
app.use(cookieParser());

// Session Configuration
app.use(
  session({
    secret: process.env.SECRET_KEY, // Secret key to sign the session ID cookie
    resave: false, // Don't save the session if it wasn't modified
    saveUninitialized: false, // Don't create a session until something is stored
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // MongoDB connection URL
      ttl: 14 * 24 * 60 * 60, // Session TTL (time-to-live) in seconds (14 days)
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // Cookie expiration (14 days)
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Adjust for development
    },
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected!"))
  .catch(err => console.log(err));

// Admin login route with session creation
app.post('/adminlogin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Find the admin user by username
    const admin = await adminuser.findOne({ username });

    // If admin not found
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create a session for the admin
    req.session.user = {
      id: admin._id, // Store the admin's MongoDB ID
      username: admin.username, // Store the admin's username
    };

    console.log('Session created for admin:', req.session.user); // Debugging

    // Send success response
    res.status(200).json({ message: 'Login successful', admin });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Example route to get session data
app.get('/profile', (req, res) => {
  if (req.session.user) {
    res.send(`Welcome, ${req.session.user.username}`);
  } else {
    res.send('Not logged in');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});