const mongoose = require('mongoose');

const certificateSchema = mongoose.Schema({
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
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
    issueDate: {
        type: Date,
        default: Date.now
    },
    templateName: {
        type: String,
        default: 'professional'
    },
    certificateUrl: {
        type: String
    }
}, {
    timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
