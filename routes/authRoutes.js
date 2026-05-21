const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const path     = require('path');
const fs       = require('fs');
const mongoose = require('mongoose');
const { sendWelcomeEmail } = require('../utils/mailer');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

function readUsers() {
    try { return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8')); }
    catch { return []; }
}

function writeUsers(users) {
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

function mongoReady() {
    return mongoose.connection.readyState === 1;
}

// POST /api/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ error: 'All fields are required.' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ error: 'Invalid email address.' });
        if (password.length < 8)
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });

        const hashed = await bcrypt.hash(password, 10);

        if (mongoReady()) {
            const User = require('../models/User');
            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing)
                return res.status(409).json({ error: 'An account with this email already exists.' });

            // insert directly to skip the model's pre-save hash hook (we already hashed above)
            await User.collection.insertOne({
                name,
                email: email.toLowerCase(),
                password: hashed,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✓ User saved to MongoDB');
        } else {
            const users = readUsers();
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
                return res.status(409).json({ error: 'An account with this email already exists.' });

            users.push({ id: Date.now(), name, email: email.toLowerCase(), password: hashed, createdAt: new Date().toISOString() });
            writeUsers(users);
            console.log('⚠ MongoDB down — user saved to JSON');
        }

        // send welcome email but don't block the response if it fails
        sendWelcomeEmail({ name, email }).catch(e => console.error('Welcome email failed:', e.message));

        res.status(201).json({ success: true, message: 'Account created successfully! Please log in.' });

    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// POST /api/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required.' });

        let user = null;

        if (mongoReady()) {
            const User = require('../models/User');
            const found = await User.findOne({ email: email.toLowerCase() });
            if (found && await bcrypt.compare(password, found.password)) {
                user = { id: found._id, name: found.name, email: found.email };
            }
            // also check JSON in case user was created during a MongoDB outage
            if (!user) {
                const jsonUser = readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
                if (jsonUser && await bcrypt.compare(password, jsonUser.password)) {
                    user = { id: jsonUser.id, name: jsonUser.name, email: jsonUser.email };
                }
            }
        } else {
            const found = readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
            if (found && await bcrypt.compare(password, found.password)) {
                user = { id: found.id, name: found.name, email: found.email };
            }
        }

        if (!user)
            return res.status(401).json({ error: 'Invalid email or password.' });

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        req.session.user = user;

        res.json({ success: true, message: 'Logged in successfully!', token, user });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// POST /api/logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out.' });
});

module.exports = router;
