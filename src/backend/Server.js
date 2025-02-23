import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import adminuser from './schemas/adminuser.js'; // Ensure this path is correct

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000'], // Modify to your frontend's URL
    methods: ['GET', 'POST', 'PUT'],
}));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected!"))
    .catch(err => console.log(err));

// Admin password authentication
app.post('/adminlogin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the admin user by username
        console.log("uname:",username);
        console.log("pw:",password);
        const admin = await adminuser.findOne({ username: username });
        console.log("uname2:",admin.username);
        console.log("pw2:",admin.password);
        // If admin not found
        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // If passwords match, login is successful
        res.status(200).json({ message: 'Login successful', admin });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});