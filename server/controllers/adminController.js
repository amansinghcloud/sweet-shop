const { get, all } = require('../config/db');

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const revenueRow = await get("SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'Cancelled'");
    const totalOrdersRow = await get('SELECT COUNT(*) as count FROM orders');
    const pendingOrdersRow = await get("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('Delivered', 'Cancelled')");
    const totalProductsRow = await get('SELECT COUNT(*) as count FROM products');
    const lowStockRow = await get('SELECT COUNT(*) as count FROM products WHERE stock <= 20');
    
    const recentOrders = await all('SELECT id, tracking_code, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5');

    res.json({
      success: true,
      stats: {
        totalRevenue: Math.round(revenueRow.revenue),
        totalOrders: totalOrdersRow.count,
        pendingOrders: pendingOrdersRow.count,
        totalProducts: totalProductsRow.count,
        lowStockItems: lowStockRow.count
      },
      recentOrders
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
};

module.exports = {
  getStats
};
