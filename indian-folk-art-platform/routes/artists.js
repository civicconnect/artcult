const express = require('express');
const Artist = require('../models/Artist');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all artists with filtering and search
// @route   GET /api/artists
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            artform,
            category,
            state,
            city,
            minRating,
            maxPrice,
            search,
            page = 1,
            limit = 12,
            sort = 'joinedAt'
        } = req.query;

        // Build query object
        let query = { isActive: true };

        if (artform) {
            query['specializations.artform'] = artform;
        }

        if (category) {
            query['specializations.category'] = category;
        }

        if (state) {
            query['location.state'] = new RegExp(state, 'i');
        }

        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }

        if (minRating) {
            query['ratings.average'] = { $gte: parseFloat(minRating) };
        }

        if (maxPrice) {
            query['pricing.sessionRate'] = { $lte: parseFloat(maxPrice) };
        }

        if (search) {
            query.$or = [
                { bio: new RegExp(search, 'i') },
                { 'specializations.description': new RegExp(search, 'i') }
            ];
        }

        // Sort options
        const sortOptions = {
            joinedAt: { joinedAt: -1 },
            rating: { 'ratings.average': -1 },
            price: { 'pricing.sessionRate': 1 },
            name: { 'user.name': 1 }
        };

        const artists = await Artist.find(query)
            .populate('user', 'name email profileImage location')
            .sort(sortOptions[sort] || { joinedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Artist.countDocuments(query);

        res.status(200).json({
            success: true,
            count: artists.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: artists
        });
    } catch (error) {
        console.error('Get artists error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get artist by ID
// @route   GET /api/artists/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id)
            .populate('user', 'name email profileImage phone location createdAt');

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: 'Artist not found'
            });
        }

        res.status(200).json({
            success: true,
            data: artist
        });
    } catch (error) {
        console.error('Get artist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create artist profile
// @route   POST /api/artists
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        // Check if user already has an artist profile
        const existingArtist = await Artist.findOne({ user: req.user.id });
        if (existingArtist) {
            return res.status(400).json({
                success: false,
                message: 'Artist profile already exists'
            });
        }

        // Update user role to artist if not already
        await User.findByIdAndUpdate(req.user.id, { role: 'artist' });

        const artist = await Artist.create({
            user: req.user.id,
            ...req.body
        });

        const populatedArtist = await Artist.findById(artist._id)
            .populate('user', 'name email profileImage');

        res.status(201).json({
            success: true,
            message: 'Artist profile created successfully',
            data: populatedArtist
        });
    } catch (error) {
        console.error('Create artist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update artist profile
// @route   PUT /api/artists/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: 'Artist not found'
            });
        }

        // Check ownership or admin
        if (artist.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }

        const updatedArtist = await Artist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'name email profileImage');

        res.status(200).json({
            success: true,
            message: 'Artist profile updated successfully',
            data: updatedArtist
        });
    } catch (error) {
        console.error('Update artist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Add portfolio item
// @route   POST /api/artists/:id/portfolio
// @access  Private
router.post('/:id/portfolio', protect, async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: 'Artist not found'
            });
        }

        if (artist.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this portfolio'
            });
        }

        artist.portfolio.push(req.body);
        await artist.save();

        res.status(201).json({
            success: true,
            message: 'Portfolio item added successfully',
            data: artist.portfolio[artist.portfolio.length - 1]
        });
    } catch (error) {
        console.error('Add portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get artists by location
// @route   GET /api/artists/location/:state/:city?
// @access  Public
router.get('/location/:state/:city?', async (req, res) => {
    try {
        const { state, city } = req.params;
        
        let query = {
            'location.state': new RegExp(state, 'i'),
            isActive: true
        };

        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }

        const artists = await Artist.find(query)
            .populate('user', 'name email profileImage')
            .sort({ 'ratings.average': -1 });

        res.status(200).json({
            success: true,
            count: artists.length,
            data: artists
        });
    } catch (error) {
        console.error('Get artists by location error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Search artists by artform and category
// @route   GET /api/artists/search/:artform/:category
// @access  Public
router.get('/search/:artform/:category', async (req, res) => {
    try {
        const { artform, category } = req.params;
        
        const artists = await Artist.find({
            'specializations.artform': artform,
            'specializations.category': category,
            isActive: true
        })
        .populate('user', 'name email profileImage location')
        .sort({ 'ratings.average': -1 });

        res.status(200).json({
            success: true,
            count: artists.length,
            data: artists
        });
    } catch (error) {
        console.error('Search artists error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;