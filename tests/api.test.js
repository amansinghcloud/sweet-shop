const request = require('supertest');
const app = require('../server/server');
const { initDB } = require('../server/config/db');
const seedData = require('../server/config/seed');

let customerToken = '';
let adminToken = '';
let createdTrackingCode = '';

beforeAll(async () => {
  await initDB();
  await seedData();
});

describe('Madhuraj Sweet House API Test Suite', () => {

  // 1. Health Check
  test('GET /api/health should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  // 2. Authentication: Login Demo Customer & Admin
  test('POST /api/auth/login with valid demo customer credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@example.com', password: 'Demo@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    customerToken = res.body.token;
  });

  test('POST /api/auth/login with valid admin credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@madhuraj.in', password: 'Admin@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  test('POST /api/auth/login should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@example.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 3. User Profile
  test('GET /api/auth/profile with bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('demo@example.com');
  });

  test('GET /api/auth/profile fails without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  // 4. Products API
  test('GET /api/products returns catalog of sweets', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test('GET /api/products?category=kaju filters specifically for Kaju sweets', async () => {
    const res = await request(app).get('/api/products?category=kaju');
    expect(res.status).toBe(200);
    expect(res.body.data.every(p => p.category === 'kaju')).toBe(true);
  });

  test('GET /api/products?search=Motichoor returns search results', async () => {
    const res = await request(app).get('/api/products?search=Motichoor');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toContain('Motichoor');
  });

  // 5. Coupon Validation
  test('POST /api/coupons/validate verifies valid coupon code MITHAI15', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'MITHAI15', subtotal: 1000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.discount).toBe(150); // 15% of 1000
  });

  test('POST /api/coupons/validate rejects invalid coupon', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'FAKECODE99', subtotal: 1000 });

    expect(res.status).toBe(404);
  });

  // 6. Order Placement & Live Tracking
  test('POST /api/orders successfully places an order and returns tracking code', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customer_name: 'Rohit Sharma',
        customer_email: 'demo@example.com',
        customer_phone: '+91 9811223344',
        delivery_address: '123 Sweet Avenue, Sector 15',
        city: 'Noida',
        postal_code: '201301',
        payment_method: 'UPI',
        coupon_code: 'MITHAI15',
        items: [
          { id: 1, name: 'Classic Kaju Katli', weight: '500g', quantity: 2 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.tracking_code).toBeDefined();
    expect(res.body.tracking_code).toMatch(/^MS-\d+/);
    createdTrackingCode = res.body.tracking_code;
  });

  test('GET /api/orders/track/:code tracks the newly created order', async () => {
    const res = await request(app).get(`/api/orders/track/${createdTrackingCode}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.tracking_code).toBe(createdTrackingCode);
    expect(res.body.order.status).toBe('Received');
    expect(res.body.order.stages.length).toBe(6);
  });

  test('GET /api/orders/track/:code with existing seeded code MS-1001', async () => {
    const res = await request(app).get('/api/orders/track/MS-1001');
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('Out for Delivery');
  });

  // 7. Role-Based Admin Protection
  test('GET /api/admin/stats denies customer token (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  test('GET /api/admin/stats allows admin token and returns analytics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalOrders).toBeGreaterThan(0);
    expect(res.body.stats.totalRevenue).toBeGreaterThan(0);
  });

  // 8. Contact Inquiry
  test('POST /api/contact submits customer inquiry', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Simran Kaur',
        email: 'simran@example.com',
        phone: '+91 9988776655',
        subject: 'Corporate Diwali Hampers',
        message: 'Need 100 custom boxes for our office celebration.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
