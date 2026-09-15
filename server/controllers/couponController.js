const { get } = require('../config/db');

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const coupon = await get(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1',
      [code.trim()]
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const cartTotal = Number(subtotal) || 0;
    if (cartTotal < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart total of ₹${coupon.min_order_amount}.`
      });
    }

    let discountAmount = Math.round((cartTotal * coupon.discount_percent) / 100);
    if (coupon.max_discount && discountAmount > coupon.max_discount) {
      discountAmount = coupon.max_discount;
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully! You saved ₹${discountAmount}.`,
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      discount: discountAmount
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ success: false, message: 'Server error during coupon validation.' });
  }
};

module.exports = {
  validateCoupon
};
