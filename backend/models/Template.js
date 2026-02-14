const mongoose = require('mongoose');

const templateSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String }, // Base64 or URL
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

const Template = mongoose.model('Template', templateSchema);
module.exports = Template;
