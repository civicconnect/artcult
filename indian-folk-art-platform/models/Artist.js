const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    bio: {
        type: String,
        required: [true, 'Please provide a bio'],
        maxlength: 1000
    },
    specializations: [{
        artform: {
            type: String,
            enum: ['warli', 'pithora', 'madhubani', 'tanjore', 'kalamkari', 'gond', 'other'],
            required: true
        },
        category: {
            type: String,
            enum: ['music', 'dance', 'painting', 'sculpture', 'crafts', 'textiles'],
            required: true
        },
        experience: {
            type: Number,
            required: true,
            min: 0
        },
        description: String
    }],
    portfolio: [{
        title: String,
        description: String,
        images: [String],
        category: String,
        artform: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    location: {
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        region: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    pricing: {
        sessionRate: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        packages: [{
            name: String,
            description: String,
            duration: Number, // in minutes
            price: Number,
            features: [String]
        }]
    },
    availability: {
        schedule: [{
            day: {
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            slots: [{
                startTime: String,
                endTime: String,
                isAvailable: {
                    type: Boolean,
                    default: true
                }
            }]
        }],
        timezone: {
            type: String,
            default: 'Asia/Kolkata'
        }
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    achievements: [{
        title: String,
        description: String,
        year: Number,
        certificate: String // URL to certificate image
    }],
    socialLinks: {
        instagram: String,
        facebook: String,
        youtube: String,
        website: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for location-based searches
artistSchema.index({ 'location.state': 1, 'location.city': 1 });
artistSchema.index({ 'specializations.artform': 1 });
artistSchema.index({ 'specializations.category': 1 });

module.exports = mongoose.model('Artist', artistSchema);