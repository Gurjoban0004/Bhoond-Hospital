// Run once to seed doctors into MongoDB:  node utils/seedDoctors.js
require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

const doctors = [
    {
        name: 'Dr. Arjun Mehta',
        specialty: 'Cardiology',
        hospital: 'Bhoond Heart Institute',
        location: 'Delhi',
        experience: 18,
        fees: 1200,
        rating: 4.9,
        reviews: 1240,
        photo: 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png',
        nextAvailable: ['2026-05-02 10:00', '2026-05-03 14:00'],
    },
    {
        name: 'Dr. Priya Kapoor',
        specialty: 'Cardiology',
        hospital: 'Bhoond Heart Institute',
        location: 'Gurgaon',
        experience: 38,
        fees: 1600,
        rating: 4.7,
        reviews: 980,
        photo: 'https://cdn-icons-png.flaticon.com/512/2922/2922512.png',
        nextAvailable: ['2026-05-04 16:00', '2026-05-05 10:00'],
    },
    {
        name: 'Dr. Neha Sharma',
        specialty: 'Neurology',
        hospital: 'Bhoond Neuro Centre',
        location: 'Mumbai',
        experience: 22,
        fees: 2000,
        rating: 4.6,
        reviews: 520,
        photo: 'https://cdn-icons-png.flaticon.com/512/2922/2922520.png',
        nextAvailable: ['2026-05-06 09:00', '2026-05-06 13:30'],
    },
    {
        name: 'Dr. Rakesh Kumar',
        specialty: 'Orthopedics',
        hospital: 'Bhoond Orthopedic',
        location: 'Bangalore',
        experience: 28,
        fees: 1800,
        rating: 4.5,
        reviews: 410,
        photo: 'https://cdn-icons-png.flaticon.com/512/2922/2922525.png',
        nextAvailable: ['2026-05-04 09:30', '2026-05-04 15:00'],
    },
    {
        name: 'Dr. Meera Joshi',
        specialty: 'Endocrinology',
        hospital: 'Bhoond Diabetes & Hormone Clinic',
        location: 'Chennai',
        experience: 15,
        fees: 1500,
        rating: 4.8,
        reviews: 670,
        photo: 'https://cdn-icons-png.flaticon.com/512/2922/2922561.png',
        nextAvailable: ['2026-05-05 11:00', '2026-05-07 14:00'],
    },
    {
        name: 'Dr. Suresh Nair',
        specialty: 'ENT',
        hospital: 'Bhoond ENT & Head-Neck Centre',
        location: 'Delhi',
        experience: 20,
        fees: 1100,
        rating: 4.6,
        reviews: 390,
        photo: 'https://cdn-icons-png.flaticon.com/512/2922/2922530.png',
        nextAvailable: ['2026-05-03 10:00', '2026-05-03 16:00'],
    },
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);
    console.log(`✓ Seeded ${doctors.length} doctors into MongoDB`);
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
