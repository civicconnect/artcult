const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products with filtering and search
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            artform,
            minPrice,
            maxPrice,
            search,
            featured,
            page = 1,
            limit = 12,
            sort = 'createdAt'
        } = req.query;

        // Build query object
        let query = { status: 'active' };

        if (category) {
            query.category = category;
        }

        if (artform) {
            query.artform = artform;
        }

        if (minPrice || maxPrice) {
            query['price.amount'] = {};
            if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
            if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
        }

        if (featured === 'true') {
            query.featured = true;
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Sort options
        const sortOptions = {
            createdAt: { createdAt: -1 },
            price: { 'price.amount': 1 },
            priceDesc: { 'price.amount': -1 },
            rating: { 'ratings.average': -1 },
            views: { views: -1 }
        };

        const products = await Product.find(query)
            .populate({
                path: 'seller',
                populate: {
                    path: 'user',
                    select: 'name profileImage location'
                }
            })
            .sort(sortOptions[sort] || { createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'seller',
                populate: {
                    path: 'user',
                    select: 'name email profileImage phone location'
                }
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Increment view count
        product.views += 1;
        await product.save();

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Artist only)
router.post('/', protect, authorize('artist', 'admin'), async (req, res) => {
    try {
        // Find artist profile
        const Artist = require('../models/Artist');
        const artist = await Artist.findOne({ user: req.user.id });
        
        if (!artist) {
            return res.status(400).json({
                success: false,
                message: 'Artist profile required to create products'
            });
        }

        const product = await Product.create({
            seller: artist._id,
            ...req.body
        });

        const populatedProduct = await Product.findById(product._id)
            .populate({
                path: 'seller',
                populate: {
                    path: 'user',
                    select: 'name profileImage'
                }
            });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: populatedProduct
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership or admin
        if (product.seller.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate({
            path: 'seller',
            populate: {
                path: 'user',
                select: 'name profileImage'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership or admin
        if (product.seller.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured/list', async (req, res) => {
    try {
        const products = await Product.find({ featured: true, status: 'active' })
            .populate({
                path: 'seller',
                populate: {
                    path: 'user',
                    select: 'name profileImage location'
                }
            })
            .sort({ createdAt: -1 })
            .limit(8);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const products = await Product.find({ 
            category, 
            status: 'active' 
        })
        .populate({
            path: 'seller',
            populate: {
                path: 'user',
                select: 'name profileImage location'
            }
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await Product.countDocuments({ category, status: 'active' });

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: products
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;