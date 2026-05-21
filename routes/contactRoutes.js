const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const mongoose = require('mongoose');
const { sendContactEmail } = require('../utils/mailer');

const router = express.Router();

const CONTACTS_PATH = path.join(__dirname, '..', 'data', 'contacts.json');

function readContacts() {
    try { return JSON.parse(fs.readFileSync(CONTACTS_PATH, 'utf8')); }
    catch { return []; }
}

function writeContacts(contacts) {
    fs.writeFileSync(CONTACTS_PATH, JSON.stringify(contacts, null, 2));
}

function mongoReady() {
    return mongoose.connection.readyState === 1;
}

// GET /api/contacts
router.get('/', async (req, res) => {
    try {
        if (mongoReady()) {
            const Contact = require('../models/Contact');
            return res.json(await Contact.find().sort({ createdAt: -1 }));
        }
        res.json(readContacts());
    } catch {
        res.json(readContacts());
    }
});

// POST /api/contacts
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message)
            return res.status(400).json({ error: 'Name, email and message are required.' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ error: 'Invalid email address.' });

        const data = {
            name,
            email,
            phone: phone || '',
            subject: subject || 'Website Enquiry',
            message,
        };

        if (mongoReady()) {
            const Contact = require('../models/Contact');
            await Contact.create(data);
            console.log('✓ Contact saved to MongoDB');
        } else {
            const contacts = readContacts();
            contacts.push({ ...data, id: Date.now(), receivedAt: new Date().toISOString() });
            writeContacts(contacts);
            console.log('⚠ MongoDB down — contact saved to JSON');
        }

        // send notification email but don't block the response
        sendContactEmail(data).catch(e => console.error('Contact email failed:', e.message));

        res.status(201).json({ success: true, message: 'Message received! We will get back to you shortly.' });

    } catch (err) {
        console.error('Contact error:', err.message);
        // last resort fallback
        try {
            const { name, email, phone, subject, message } = req.body;
            const contacts = readContacts();
            contacts.push({ name, email, phone: phone || '', subject: subject || 'Website Enquiry', message, id: Date.now(), receivedAt: new Date().toISOString() });
            writeContacts(contacts);
            res.status(201).json({ success: true, message: 'Message received! We will get back to you shortly.' });
        } catch {
            res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }
});

module.exports = router;
