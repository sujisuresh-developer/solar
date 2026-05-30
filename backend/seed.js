require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Lead = require('./models/Lead');

const sampleLeads = [
  {
    fullName: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh@example.com',
    location: 'Kochi',
    propertyType: 'Residential',
    systemSize: 5,
    source: 'Website',
    status: 'New Lead',
  },
  {
    fullName: 'Priya Menon',
    phone: '8765432109',
    email: 'priya@example.com',
    location: 'Thrissur',
    propertyType: 'Commercial',
    systemSize: 20,
    source: 'Referral',
    status: 'Site Visit Scheduled',
  },
  {
    fullName: 'Anil Sharma',
    phone: '7654321098',
    email: 'anil.sharma@example.com',
    location: 'Bangalore',
    propertyType: 'Industrial',
    systemSize: 75,
    source: 'Social Media',
    status: 'Proposal Sent',
  },
  {
    fullName: 'Deepa Nair',
    phone: '9123456780',
    email: 'deepa.nair@example.com',
    location: 'Kozhikode',
    propertyType: 'Residential',
    systemSize: 8,
    source: 'Walk-in',
    status: 'Won',
  },
  {
    fullName: 'Mohammed Rafiq',
    phone: '8234567890',
    email: 'rafiq@example.com',
    location: 'Thrissur',
    propertyType: 'Commercial',
    systemSize: 30,
    source: 'Website',
    status: 'Contacted',
  },
  {
    fullName: 'Lakshmi Pillai',
    phone: '9345678901',
    email: 'lakshmi.pillai@example.com',
    location: 'Trivandrum',
    propertyType: 'Residential',
    systemSize: 4,
    source: 'Referral',
    status: 'Lost',
  },
  {
    fullName: 'Suresh Babu',
    phone: '7890123456',
    email: 'suresh.babu@example.com',
    location: 'Kochi',
    propertyType: 'Industrial',
    systemSize: 50,
    source: 'Social Media',
    status: 'New Lead',
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing leads');
    await Lead.insertMany(sampleLeads);
    console.log(`✅ Seeded ${sampleLeads.length} sample leads successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
