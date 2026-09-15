const bcrypt = require('bcryptjs');
const { run, get, initDB } = require('./db');

const seedData = async () => {
  await initDB();

  // 1. Seed Admin & Demo Users
  const adminHash = await bcrypt.hash('Admin@123', 10);
  await run(
    `INSERT OR IGNORE INTO users (name, email, password_hash, role, phone, address) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['Madhuraj Admin', 'admin@madhuraj.in', adminHash, 'admin', '+91 9876543210', 'Head Office, New Delhi']
  );

  const demoHash = await bcrypt.hash('Demo@123', 10);
  await run(
    `INSERT OR IGNORE INTO users (name, email, password_hash, role, phone, address) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['Rohit Sharma', 'demo@example.com', demoHash, 'customer', '+91 9811223344', 'Flat 402, Royal Palms, New Delhi']
  );

  // 2. Seed Coupons
  const coupons = [
    { code: 'MITHAI15', discount_percent: 15, min_order_amount: 500, max_discount: 300 },
    { code: 'WELCOME10', discount_percent: 10, min_order_amount: 300, max_discount: 200 },
    { code: 'FESTIVE20', discount_percent: 20, min_order_amount: 1200, max_discount: 600 }
  ];

  for (const c of coupons) {
    await run(
      `INSERT OR IGNORE INTO coupons (code, discount_percent, min_order_amount, max_discount, is_active) 
       VALUES (?, ?, ?, ?, 1)`,
      [c.code, c.discount_percent, c.min_order_amount, c.max_discount]
    );
  }

  // 3. Seed Products
  const existingProduct = await get('SELECT id FROM products LIMIT 1');
  if (!existingProduct) {
    const products = [
      {
        name: 'Classic Kaju Katli',
        category: 'kaju',
        price: 999,
        weight_options: JSON.stringify(['250g', '500g', '1kg']),
        description: 'The timeless classic cashew barfi made with premium Goan cashews, melt-in-your-mouth perfection.',
        ingredients: 'Premium Cashew Nuts, Sugar, Edible Silver Leaf (Vark), Cardamom',
        shelf_life: '20 Days',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 1,
        stock: 85,
        rating: 4.9,
        reviews_count: 48
      },
      {
        name: 'Motichoor Laddoo (Pure Ghee)',
        category: 'laddoo',
        price: 750,
        weight_options: JSON.stringify(['500g', '1kg']),
        description: 'Golden micro-pearl boondi laddoos fried in 100% pure desi ghee with fragrant green cardamom.',
        ingredients: 'Gram Flour (Besan), Pure Desi Ghee, Sugar, Saffron, Pistachios, Cardamom',
        shelf_life: '15 Days',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 1,
        stock: 60,
        rating: 4.8,
        reviews_count: 36
      },
      {
        name: 'Rose Sandesh Delicacy',
        category: 'bengali',
        price: 850,
        weight_options: JSON.stringify(['250g', '500g', '1kg']),
        description: 'Light and ethereal Bengali sweet handcrafted from freshly made cow milk paneer (chhena) and Damascus rose extract.',
        ingredients: 'Fresh Cow Milk Chhena, Raw Cane Sugar, Natural Rose Essence, Pistachios',
        shelf_life: '5 Days (Keep Refrigerated)',
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 1,
        stock: 40,
        rating: 4.7,
        reviews_count: 22
      },
      {
        name: 'Royal Pista Barfi',
        category: 'barfi',
        price: 1100,
        weight_options: JSON.stringify(['250g', '500g', '1kg']),
        description: 'Rich condensed milk mawa fudge generously loaded with toasted Iranian pistachios and pure saffron threads.',
        ingredients: 'Fresh Khoya (Mawa), Pistachios, Sugar, Saffron, Cardamom',
        shelf_life: '12 Days',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 1,
        stock: 55,
        rating: 4.9,
        reviews_count: 29
      },
      {
        name: 'Grand Royal Festive Hamper',
        category: 'gifting',
        price: 2499,
        weight_options: JSON.stringify(['1.2kg Box', '2kg Luxury Box']),
        description: 'A regal collection featuring Kaju Katli, Motichoor Laddoo, Pista Barfi, roasted jumbo cashews, and Kashmiri almonds in an embossed velvet box.',
        ingredients: 'Assorted Mithai, Roasted Almonds, Jumbo Cashews, Kishmish, Walnut Kernels',
        shelf_life: '25 Days',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 1,
        stock: 25,
        rating: 5.0,
        reviews_count: 41
      },
      {
        name: 'Saffron Almond Peda',
        category: 'barfi',
        price: 890,
        weight_options: JSON.stringify(['250g', '500g', '1kg']),
        description: 'Velvety Mathura-style pedas prepared by caramelizing farm-fresh milk solids, almond paste, and Kashmiri saffron.',
        ingredients: 'Full Cream Milk Khoya, Almond Meal, Saffron, Nutmeg, Cardamom',
        shelf_life: '15 Days',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 0,
        stock: 45,
        rating: 4.6,
        reviews_count: 18
      },
      {
        name: 'Imperial Dry Fruit Box',
        category: 'dryfruit',
        price: 1399,
        weight_options: JSON.stringify(['500g', '1kg']),
        description: 'Hand-sorted selection of premium W-240 cashew nuts, California almonds, Afghan raisins, and Iranian pistachios.',
        ingredients: 'Cashew Nuts, Almonds, Pistachios, Golden Green Raisins',
        shelf_life: '90 Days',
        image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 0,
        stock: 70,
        rating: 4.8,
        reviews_count: 24
      },
      {
        name: 'Shahi Besan Laddoo',
        category: 'laddoo',
        price: 650,
        weight_options: JSON.stringify(['500g', '1kg']),
        description: 'Coarsely ground organic chickpea flour slow-roasted on wood fire with cow ghee and crushed cashews.',
        ingredients: 'Chana Besan, Cow Desi Ghee, Boora Sugar, Cashews, Cardamom',
        shelf_life: '30 Days',
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 0,
        stock: 50,
        rating: 4.7,
        reviews_count: 31
      },
      {
        name: 'Kesar Rasgulla (Can of 8)',
        category: 'bengali',
        price: 550,
        weight_options: JSON.stringify(['1kg Can (8 pcs)']),
        description: 'Spongy, succulent cottage cheese dumplings simmered in fragrant saffron-cardamom sugar syrup.',
        ingredients: 'Pure Milk Chhena, Saffron Syrup, Cardamom',
        shelf_life: '90 Days (Sealed Can)',
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 0,
        stock: 65,
        rating: 4.8,
        reviews_count: 19
      },
      {
        name: 'Kaju Pista Roll',
        category: 'kaju',
        price: 1150,
        weight_options: JSON.stringify(['250g', '500g', '1kg']),
        description: 'Silky cashew fudge wrapped around an emerald pistachio and saffron heart, dusted with edible silver.',
        ingredients: 'Cashew Paste, Pistachio Kernels, Sugar, Saffron, Silver Leaf',
        shelf_life: '18 Days',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        is_bestseller: 1,
        stock: 35,
        rating: 4.9,
        reviews_count: 27
      }
    ];

    for (const p of products) {
      const res = await run(
        `INSERT INTO products (name, category, price, weight_options, description, ingredients, shelf_life, image, is_bestseller, stock, rating, reviews_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.category, p.price, p.weight_options, p.description, p.ingredients, p.shelf_life, p.image, p.is_bestseller, p.stock, p.rating, p.reviews_count]
      );

      // Seed a couple of reviews for each product
      await run(
        `INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)`,
        [res.id, 'Ananya Iyer', 5, 'Absolutely authentic taste! Melted right in my mouth, reminiscent of old Delhi.']
      );
      await run(
        `INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)`,
        [res.id, 'Vikram Malhotra', 5, 'Packed with pure ghee aroma. Delivered fresh and securely packaged!']
      );
    }
    console.log(`Seeded ${products.length} Indian sweets with reviews.`);
  }

  // 4. Seed Sample Orders for Live Tracking
  const existingOrder = await get('SELECT id FROM orders LIMIT 1');
  if (!existingOrder) {
    const demoUser = await get('SELECT id FROM users WHERE email = ?', ['demo@example.com']);
    
    // Order 1: Out for Delivery
    await run(
      `INSERT INTO orders (tracking_code, user_id, customer_name, customer_email, customer_phone, delivery_address, city, postal_code, items_json, subtotal, discount, total, status, payment_method, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'MS-1001',
        demoUser ? demoUser.id : 2,
        'Rohit Sharma',
        'demo@example.com',
        '+91 9811223344',
        'Flat 402, Royal Palms, Connaught Place',
        'New Delhi',
        '110001',
        JSON.stringify([
          { id: 1, name: 'Classic Kaju Katli', price: 999, weight: '500g', quantity: 1 },
          { id: 2, name: 'Motichoor Laddoo (Pure Ghee)', price: 750, weight: '500g', quantity: 1 }
        ]),
        1749,
        262.35,
        1486.65,
        'Out for Delivery',
        'UPI / Online',
        'Paid',
        'Please deliver between 4 PM and 6 PM'
      ]
    );

    // Order 2: Preparing Fresh
    await run(
      `INSERT INTO orders (tracking_code, user_id, customer_name, customer_email, customer_phone, delivery_address, city, postal_code, items_json, subtotal, discount, total, status, payment_method, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'MS-1002',
        demoUser ? demoUser.id : 2,
        'Pooja Verma',
        'pooja@example.com',
        '+91 9877665544',
        'Villa 12, Green Glen Layout, Outer Ring Road',
        'Bengaluru',
        '560103',
        JSON.stringify([
          { id: 5, name: 'Grand Royal Festive Hamper', price: 2499, weight: '1.2kg Box', quantity: 2 }
        ]),
        4998,
        500,
        4498,
        'Preparing',
        'Credit Card',
        'Paid',
        'Festive corporate gift packaging required'
      ]
    );

    console.log('Seeded sample orders: MS-1001 (Out for Delivery), MS-1002 (Preparing)');
  }

  console.log('--- Database Seeding Complete ---');
};

if (require.main === module) {
  seedData().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = seedData;
