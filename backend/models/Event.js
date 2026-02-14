const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    capacity: { type: Number, required: true },
    organizer: { type: String, default: 'QuantrixConduct' },
    status: { type: String, enum: ['active', 'inactive', 'canceled'], default: 'active' },
    image: { type: String },
    amount: { type: Number, default: 0 },
    winner: { type: String, default: 'Pending' },
    certificateTemplate: { type: String } // Optional: Template name to use for auto-generation
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
