const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name:          { type: String, required: true, trim: true },
    specialty:     { type: String, required: true },
    hospital:      { type: String, required: true },
    location:      { type: String, required: true },
    experience:    { type: Number, required: true },
    fees:          { type: Number, required: true },
    rating:        { type: Number, default: 4.5 },
    reviews:       { type: Number, default: 0 },
    photo:         { type: String, default: '' },
    nextAvailable: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
