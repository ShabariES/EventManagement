const mongoose = require('mongoose');

const registrationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    certificateIssued: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'na'],
        default: 'na'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    paymentId: {
        type: String
    },
    // Added fields for certification and verification
    name: { type: String },
    college: { type: String },
    department: { type: String },
    rollNo: { type: String },
    phone: { type: String },
    transactionId: { type: String },
    attended: {
        type: Boolean,
        default: false
    },
    adminReport: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
