const { run, all } = require('../config/db');

// Submit contact or gifting inquiry
const submitInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const result = await run(
      `INSERT INTO inquiries (name, email, phone, subject, message, type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone || '', subject || 'Customer Inquiry', message.trim(), type || 'contact']
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to Madhuraj! Our team will contact you within 24 hours.',
      inquiryId: result.id
    });
  } catch (err) {
    console.error('Error submitting inquiry:', err);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry.' });
  }
};

// Get inquiries (Admin)
const getInquiries = async (req, res) => {
  try {
    const inquiries = await all('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json({ success: true, inquiries });
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries.' });
  }
};

module.exports = {
  submitInquiry,
  getInquiries
};
