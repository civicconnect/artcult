const express = require('express');
const Session = require('../models/Session');
const Artist = require('../models/Artist');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all sessions for current user
// @route   GET /api/sessions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, upcoming, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        if (req.user.role === 'artist') {
            // Get artist profile
            const artist = await Artist.findOne({ user: req.user.id });
            if (artist) {
                query.artist = artist._id;
            }
        } else {
            query.user = req.user.id;
        }

        if (status) {
            query.status = status;
        }

        if (upcoming === 'true') {
            query.scheduledDate = { $gte: new Date() };
        }

        const sessions = await Session.find(query)
            .populate('user', 'name email profileImage')
            .populate({
                path: 'artist',
                populate: {
                    path: 'user',
                    select: 'name email profileImage'
                }
            })
            .sort({ scheduledDate: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Session.countDocuments(query);

        res.status(200).json({
            success: true,
            count: sessions.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: sessions
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('user', 'name email profileImage phone')
            .populate({
                path: 'artist',
                populate: {
                    path: 'user',
                    select: 'name email profileImage phone'
                }
            });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Check authorization
        const artist = await Artist.findOne({ user: req.user.id });
        const isOwner = session.user._id.toString() === req.user.id;
        const isArtist = artist && session.artist._id.toString() === artist._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isArtist && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this session'
            });
        }

        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Book a session
// @route   POST /api/sessions
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            artistId,
            sessionType,
            title,
            description,
            scheduledDate,
            duration,
            format,
            location,
            pricing
        } = req.body;

        // Verify artist exists
        const artist = await Artist.findById(artistId);
        if (!artist) {
            return res.status(404).json({
                success: false,
                message: 'Artist not found'
            });
        }

        // Check if the scheduled time is available
        const existingSession = await Session.findOne({
            artist: artistId,
            scheduledDate: {
                $gte: new Date(scheduledDate),
                $lt: new Date(new Date(scheduledDate).getTime() + duration * 60000)
            },
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: 'Artist is not available at the requested time'
            });
        }

        const session = await Session.create({
            user: req.user.id,
            artist: artistId,
            sessionType,
            title,
            description,
            scheduledDate,
            duration,
            format,
            location,
            pricing
        });

        const populatedSession = await Session.findById(session._id)
            .populate('user', 'name email profileImage')
            .populate({
                path: 'artist',
                populate: {
                    path: 'user',
                    select: 'name email profileImage'
                }
            });

        res.status(201).json({
            success: true,
            message: 'Session booked successfully',
            data: populatedSession
        });
    } catch (error) {
        console.error('Book session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update session status
// @route   PUT /api/sessions/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Check authorization
        const artist = await Artist.findOne({ user: req.user.id });
        const isOwner = session.user.toString() === req.user.id;
        const isArtist = artist && session.artist.toString() === artist._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isArtist && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this session'
            });
        }

        session.status = status;
        await session.save();

        const updatedSession = await Session.findById(session._id)
            .populate('user', 'name email profileImage')
            .populate({
                path: 'artist',
                populate: {
                    path: 'user',
                    select: 'name email profileImage'
                }
            });

        res.status(200).json({
            success: true,
            message: 'Session status updated successfully',
            data: updatedSession
        });
    } catch (error) {
        console.error('Update session status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Rate a session
// @route   PUT /api/sessions/:id/rate
// @access  Private
router.put('/:id/rate', protect, async (req, res) => {
    try {
        const { score, review } = req.body;

        if (score < 1 || score > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Only the user who booked can rate
        if (session.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to rate this session'
            });
        }

        // Session must be completed to rate
        if (session.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Session must be completed before rating'
            });
        }

        session.rating = {
            score,
            review,
            ratedAt: new Date()
        };
        await session.save();

        // Update artist's average rating
        const artist = await Artist.findById(session.artist);
        const sessions = await Session.find({
            artist: session.artist,
            'rating.score': { $exists: true }
        });

        const totalRatings = sessions.length;
        const averageRating = sessions.reduce((sum, s) => sum + s.rating.score, 0) / totalRatings;

        artist.ratings.average = Math.round(averageRating * 10) / 10;
        artist.ratings.count = totalRatings;
        await artist.save();

        res.status(200).json({
            success: true,
            message: 'Session rated successfully',
            data: session
        });
    } catch (error) {
        console.error('Rate session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;