const { run, get, all } = require('../config/db');

// Helper to generate unique order tracking code like MS-839210
const generateTrackingCode = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `MS-${randomNum}`;
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      city,
      postal_code,
      items,
      coupon_code,
      payment_method,
      notes
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and delivery address are required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // Calculate subtotal and verify stock
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await get('SELECT id, name, price, stock, image FROM products WHERE id = ?', [item.id]);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product "${item.name || item.id}" not found.` });
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const weight = item.weight || '500g';
      
      // Weight multiplier (base price is for 500g, 250g is 0.55x, 1kg is 1.95x)
      let priceMultiplier = 1;
      if (weight.includes('250g')) priceMultiplier = 0.55;
      else if (weight.includes('1kg')) priceMultiplier = 1.95;
      else if (weight.includes('2kg')) priceMultiplier = 1.9;

      const itemPrice = Math.round(product.price * priceMultiplier);
      const lineTotal = itemPrice * qty;
      subtotal += lineTotal;

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: itemPrice,
        weight: weight,
        quantity: qty,
        image: product.image,
        lineTotal
      });

      // Decrement stock if available
      if (product.stock >= qty) {
        await run('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, product.id]);
      }
    }

    // Process Coupon if provided
    let discount = 0;
    if (coupon_code) {
      const coupon = await get('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1', [coupon_code.trim()]);
      if (coupon && subtotal >= coupon.min_order_amount) {
        discount = Math.round((subtotal * coupon.discount_percent) / 100);
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      }
    }

    const total = Math.max(0, subtotal - discount);
    const tracking_code = generateTrackingCode();
    const userId = req.user ? req.user.id : null;

    const result = await run(
      `INSERT INTO orders (
         tracking_code, user_id, customer_name, customer_email, customer_phone,
         delivery_address, city, postal_code, items_json, subtotal, discount,
         total, status, payment_method, payment_status, notes
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Received', ?, 'Pending', ?)`,
      [
        tracking_code,
        userId,
        customer_name.trim(),
        customer_email.trim(),
        customer_phone.trim(),
        delivery_address.trim(),
        city ? city.trim() : 'Delhi NCR',
        postal_code ? postal_code.trim() : '',
        JSON.stringify(validatedItems),
        subtotal,
        discount,
        total,
        payment_method || 'Cash on Delivery',
        notes || ''
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Your sweets are being prepared fresh with pure ghee.',
      orderId: result.id,
      tracking_code,
      total,
      subtotal,
      discount,
      status: 'Received',
      items: validatedItems
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
};

// Track order by tracking code (e.g., MS-1001)
const trackOrder = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Tracking code is required.' });
    }

    const order = await get(
      'SELECT * FROM orders WHERE UPPER(tracking_code) = UPPER(?)',
      [code.trim()]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with Tracking ID "${code.toUpperCase()}". Please verify your order confirmation.`
      });
    }

    const stages = [
      { key: 'Received', label: 'Order Received', desc: 'Order confirmed and ingredients allocated' },
      { key: 'Preparing', label: 'Preparing Fresh', desc: 'Handcrafted in our traditional kitchen with pure ghee' },
      { key: 'Quality Check', label: 'Quality Check', desc: 'Aroma, hygiene & moisture sealed packaging' },
      { key: 'Dispatched', label: 'Dispatched', desc: 'Handed over to express courier partner' },
      { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Delivery executive is reaching your doorstep' },
      { key: 'Delivered', label: 'Delivered', desc: 'Sweet box delivered. Enjoy the authentic flavor!' }
    ];

    const currentStageIndex = stages.findIndex(s => s.key.toLowerCase() === order.status.toLowerCase());
    const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

    res.json({
      success: true,
      order: {
        tracking_code: order.tracking_code,
        customer_name: order.customer_name,
        delivery_address: `${order.delivery_address}, ${order.city || ''} ${order.postal_code || ''}`,
        status: order.status,
        currentStageIndex: activeIndex,
        stages: stages.map((s, index) => ({
          ...s,
          completed: index <= activeIndex,
          isCurrent: index === activeIndex
        })),
        items: JSON.parse(order.items_json || '[]'),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    });
  } catch (err) {
    console.error('Error tracking order:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve tracking info.' });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await all(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    const formatted = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items_json || '[]')
    }));

    res.json({
      success: true,
      count: formatted.length,
      orders: formatted
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const order = await get('SELECT id FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await run(
      `UPDATE orders SET 
         status = COALESCE(?, status), 
         payment_status = COALESCE(?, payment_status),
         updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, payment_status, id]
    );

    res.json({
      success: true,
      message: `Order #${id} status updated to "${status}".`
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

module.exports = {
  createOrder,
  trackOrder,
  getAllOrders,
  updateOrderStatus
};
