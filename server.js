require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// connect to MongoDB 
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✓ MongoDB connected'))
    .catch(err => console.warn('⚠ MongoDB not connected:', err.message));

// EJS for the doctors page
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
}));

// log every request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/contacts', contactRoutes);
app.use('/api', authRoutes);
app.use('/doctors', doctorRoutes);

// 404
app.use((req, res, next) => {
    const err = new Error(`Page not found: ${req.url}`);
    err.status = 404;
    next(err);
});

// central error handler — 4 params tells Express this is an error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong.';

    console.error(`[${status}] ${message}`);

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: messages.join(', ') });
    }

    if (err.code === 11000) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    if (req.path.startsWith('/api')) {
        return res.status(status).json({ error: message });
    }

    res.status(status).send(`
        <div style="font-family:sans-serif;padding:40px;max-width:500px;margin:auto">
            <h2>${status} — ${status === 404 ? 'Page Not Found' : 'Something went wrong'}</h2>
            <p>${message}</p>
            <a href="/">← Back to Home</a>
        </div>`);
});

app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
});
