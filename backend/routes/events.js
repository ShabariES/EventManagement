const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const events = await Event.aggregate([
            {
                $lookup: {
                    from: 'registrations',
                    localField: '_id',
                    foreignField: 'event',
                    as: 'registrations'
                }
            },
            {
                $addFields: {
                    // Filter only confirmed registrations
                    confirmedRegistrations: {
                        $filter: {
                            input: '$registrations',
                            as: 'reg',
                            cond: { $eq: ['$$reg.status', 'confirmed'] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    registrationCount: { $size: '$confirmedRegistrations' }
                }
            },
            {
                $project: {
                    registrations: 0,
                    confirmedRegistrations: 0,
                    __v: 0
                }
            }
        ]);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a event
// @route   POST /api/events
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const event = new Event(req.body);
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a event
// @route   PUT /api/events/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            Object.assign(event, req.body);
            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a event
// @route   DELETE /api/events/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            await event.deleteOne();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
