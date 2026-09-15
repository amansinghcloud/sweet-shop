const express = require('express');
const router = express.Router();

const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const inquiryController = require('../controllers/inquiryController');
const adminController = require('../controllers/adminController');

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticateToken, authController.getProfile);

// --- Product Routes ---
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', authenticateToken, requireAdmin, productController.createProduct);
router.put('/products/:id', authenticateToken, requireAdmin, productController.updateProduct);
router.delete('/products/:id', authenticateToken, requireAdmin, productController.deleteProduct);
router.post('/products/:id/reviews', productController.addReview);

// --- Order Routes ---
router.post('/orders', optionalAuth, orderController.createOrder);
router.get('/orders/track/:code', orderController.trackOrder);
router.get('/orders/admin', authenticateToken, requireAdmin, orderController.getAllOrders);
router.put('/orders/admin/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

// --- Coupon Routes ---
router.post('/coupons/validate', couponController.validateCoupon);

// --- Inquiry / Contact Routes ---
router.post('/contact', inquiryController.submitInquiry);
router.get('/contact/admin', authenticateToken, requireAdmin, inquiryController.getInquiries);

// --- Admin Analytics Routes ---
router.get('/admin/stats', authenticateToken, requireAdmin, adminController.getStats);

module.exports = router;
