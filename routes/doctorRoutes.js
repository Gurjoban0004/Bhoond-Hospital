const express = require('express');
const Doctor  = require('../models/Doctor');

const router = express.Router();

// renders the doctors page server-side using EJS
router.get('/', async (req, res, next) => {
    try {
        const { search = '', specialty = 'All', location = 'All' } = req.query;

        const query = {};
        if (specialty !== 'All') query.specialty = specialty;
        if (location  !== 'All') query.location  = location;
        if (search) {
            query.$or = [
                { name:      { $regex: search, $options: 'i' } },
                { specialty: { $regex: search, $options: 'i' } },
                { hospital:  { $regex: search, $options: 'i' } },
            ];
        }

        const doctors    = await Doctor.find(query).lean();
        const specialties = await Doctor.distinct('specialty');
        const locations   = await Doctor.distinct('location');

        res.render('doctors', {
            doctors,
            specialties,
            locations,
            filters: { search, specialty, location },
            user: req.session.user || null,
        });
    } catch (err) {
        next(err);
    }
});

// JSON endpoint in case we need doctor data client-side
router.get('/api', async (req, res, next) => {
    try {
        res.json(await Doctor.find().lean());
    } catch (err) {
        next(err);
    }
});

module.exports = router;
