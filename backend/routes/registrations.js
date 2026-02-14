const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private
router.post('/', protect, async (req, res) => {
    const { eventId, name, college, department, rollNo, phone, transactionId } = req.body;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const alreadyRegistered = await Registration.findOne({
            user: req.user._id,
            event: eventId
        });

        if (alreadyRegistered) {
            return res.status(400).json({ message: 'User already registered' });
        }

        // Check capacity
        const registrationCount = await Registration.countDocuments({ event: eventId });
        if (registrationCount >= event.capacity) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Payment Processing
        let paymentStatus = 'na';
        let amountPaid = 0;
        let paymentId = null;

        if (event.amount > 0) {
            if (!transactionId) {
                return res.status(400).json({ message: 'Payment Transaction ID is required for this event' });
            }

            paymentStatus = 'completed';
            amountPaid = event.amount;
            paymentId = transactionId; // Use UPI Transaction ID
        }

        const registration = await Registration.create({
            user: req.user._id,
            event: eventId,
            registrationDate: Date.now(),
            paymentStatus,
            amountPaid,
            paymentId,
            name,
            college,
            department,
            rollNo,
            phone,
            transactionId
        });

        // Auto-generate certificate if event has a template
        if (event.certificateTemplate) {
            const Certificate = require('../models/Certificate');
            await Certificate.create({
                user: req.user._id,
                event: eventId,
                certificateId: 'CERT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                templateName: event.certificateTemplate,
                certificateUrl: `http://localhost:5000/certificates/${registration._id}.pdf` // Placeholder
            });

            registration.certificateIssued = true;
            await registration.save();
        }

        res.status(201).json(registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get user's registrations
// @route   GET /api/registrations/myregistrations
// @access  Private
router.get('/myregistrations', protect, async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user._id }).populate('event');
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all registrations (Admin)
// @route   GET /api/registrations
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const registrations = await Registration.find({}).populate('user', 'name email').populate('event', 'title');
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Private/Admin
router.get('/event/:eventId', protect, admin, async (req, res) => {
    try {
        const registrations = await Registration.find({ event: req.params.eventId }).populate('user', 'name email');
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update attendance status
// @route   PATCH /api/registrations/:id/attendance
// @access  Private/Admin
router.patch('/:id/attendance', protect, admin, async (req, res) => {
    console.log(`Attendance update request received for ID: ${req.params.id}, data:`, req.body);
    try {
        const { attended } = req.body;
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            console.log('Registration not found');
            return res.status(404).json({ message: 'Registration not found' });
        }

        registration.attended = attended;
        await registration.save();

        console.log('Attendance updated successfully');
        res.json(registration);
    } catch (error) {
        console.error('Attendance update CRITICAL error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update admin report/feedback
// @route   PATCH /api/registrations/:id/report
// @access  Private/Admin
router.patch('/:id/report', protect, admin, async (req, res) => {
    try {
        const { report } = req.body;
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        registration.adminReport = report;
        await registration.save();

        res.json(registration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
