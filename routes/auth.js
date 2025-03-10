const express = require('express');
const User = require('../models/users.js');

const router = express.Router();

// Signup
 router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, major } = req.body;

        // Check if user already exists
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = new User({ firstName, lastName, email, password , major});  // Password will be hashed in the model
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message }); // details is for debugging purposes
    }
}); 

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {  // Use the comparePassword method from the model
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Store user info in session
        req.session.userId = user._id;
        req.session.cookie.maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);  // Log error for debugging
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Auth Middleware
const authMiddleware = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
    next();
};

// this is a temporary (testing purposes)
router.get('/profile', async (req, res) => {
    // fake user data
    const fakeUser = {
        firstName: 'Hayden',
        lastName: 'Hurst',
        email: 'hhurst3@example.com',
        year: 'Senior',
        major: 'Computer science',
        bio: 'I am a student at UNCC',
    };

    // Simulate the response as if it was fetched from the database
    res.json(fakeUser);
});

// Protected Profile Route
/*
router.get('/profile', authMiddleware, async (req, res) => {
    const user = await User.findById(req.session.userId).select('-password');
    res.json(user);
});
*/
module.exports = router;
