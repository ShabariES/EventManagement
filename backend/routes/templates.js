const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Private (Authenticated users can see templates)
router.get('/', protect, async (req, res) => {
    try {
        const templates = await Template.find({});
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a template
// @route   POST /api/templates
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, image } = req.body;

        const templateExists = await Template.findOne({ name });

        if (templateExists) {
            res.status(400);
            throw new Error('Template already exists');
        }

        const template = await Template.create({
            name,
            image,
            createdBy: req.user._id
        });

        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (template) {
            await template.deleteOne();
            res.json({ message: 'Template removed' });
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
