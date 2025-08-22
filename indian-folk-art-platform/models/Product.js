const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'Artist',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a product title'],
        maxlength: 100
    },
    description: {
        type: String,
        required: [true, 'Please provide a product description'],
        maxlength: 2000
    },
    category: {
        type: String,
        enum: ['painting', 'sculpture', 'textiles', 'crafts', 'jewelry', 'pottery', 'other'],
        required: true
    },
    artform: {
        type: String,
        enum: ['warli', 'pithora', 'madhubani', 'tanjore', 'kalamkari', 'gond', 'other'],
        required: true
    },
    images: [{
        url: String,
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    price: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        originalPrice: Number // for discount display
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        weight: Number,
        unit: {
            type: String,
            enum: ['cm', 'inch', 'mm'],
            default: 'cm'
        }
    },
    materials: [String],
    techniques: [String],
    customization: {
        available: {
            type: Boolean,
            default: false
        },
        options: [String],
        additionalCost: Number
    },
    inventory: {
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        isUnlimited: {
            type: Boolean,
            default: false
        }
    },
    shipping: {
        domestic: {
            available: {
                type: Boolean,
                default: true
            },
            cost: Number,
            estimatedDays: Number
        },
        international: {
            available: {
                type: Boolean,
                default: false
            },
            cost: Number,
            estimatedDays: Number
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'sold_out', 'discontinued'],
        default: 'active'
    },
    tags: [String],
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
    views: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
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

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for search optimization
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, artform: 1 });
productSchema.index({ 'price.amount': 1 });
productSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);