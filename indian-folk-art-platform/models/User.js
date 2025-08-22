const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'artist', 'admin'],
        default: 'user'
    },
    phone: {
        type: String,
        required: false,
        match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    },
    location: {
        state: String,
        city: String,
        region: String
    },
    preferences: {
        artforms: [{
            type: String,
            enum: ['warli', 'pithora', 'madhubani', 'tanjore', 'kalamkari', 'gond', 'other']
        }],
        interests: [{
            type: String,
            enum: ['music', 'dance', 'painting', 'sculpture', 'crafts', 'textiles']
        }]
    },
    profileImage: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);