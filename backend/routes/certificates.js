const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Registration = require('../models/Registration');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Generate a certificate
// @route   POST /api/certificates
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { registrationId, templateName, certificateUrl } = req.body;

    try {
        const registration = await Registration.findById(registrationId).populate('user').populate('event');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        const certificate = await Certificate.create({
            user: registration.user._id,
            event: registration.event._id,
            certificateId: 'CERT-' + Date.now(), // Simple ID generation
            templateName,
            certificateUrl
        });

        // Update registration status
        registration.certificateIssued = true;
        await registration.save();

        res.status(201).json(certificate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const certificates = await Certificate.find({}).populate('user', 'name').populate('event', 'title date');
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get my certificates
// @route   GET /api/certificates/mycertificates
// @access  Private
router.get('/mycertificates', protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({ user: req.user._id }).populate('event', 'title date location');
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('user', 'name')
            .populate('event', 'title date location');

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // Allow if user is the owner or an admin
        if (certificate.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this certificate' });
        }

        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
