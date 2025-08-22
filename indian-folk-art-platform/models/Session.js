const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    artist: {
        type: mongoose.Schema.ObjectId,
        ref: 'Artist',
        required: true
    },
    sessionType: {
        type: String,
        enum: ['lesson', 'workshop', 'consultation', 'performance'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    format: {
        type: String,
        enum: ['online', 'in-person', 'hybrid'],
        required: true
    },
    location: {
        address: String,
        city: String,
        state: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    meetingLink: String, // for online sessions
    pricing: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentId: String,
    notes: {
        userNotes: String,
        artistNotes: String,
        adminNotes: String
    },
    materials: [String], // materials needed for the session
    prerequisites: [String],
    maxParticipants: {
        type: Number,
        default: 1
    },
    currentParticipants: {
        type: Number,
        default: 1
    },
    rating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String,
        ratedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

sessionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
sessionSchema.index({ artist: 1, scheduledDate: 1 });
sessionSchema.index({ user: 1, status: 1 });
sessionSchema.index({ scheduledDate: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);