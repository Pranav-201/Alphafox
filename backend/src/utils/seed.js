require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset');

const run = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Portfolio.deleteMany({}), Asset.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  });

  const pranav = await User.create({
    name: 'Pranav',
    email: 'pranav@example.com',
    password: 'password123',
    role: 'user',
  });

  const portfolio = await Portfolio.create({
    name: 'Long Term Portfolio',
    description: 'HODL portfolio',
    owner: pranav._id,
  });

  await Asset.create([
    {
      coinName: 'Bitcoin',
      symbol: 'BTC',
      quantity: 0.5,
      buyPrice: 9000000,
      currentPrice: 10000000,
      portfolioId: portfolio._id,
      owner: pranav._id,
    },
    {
      coinName: 'Ethereum',
      symbol: 'ETH',
      quantity: 5,
      buyPrice: 150000,
      currentPrice: 180000,
      portfolioId: portfolio._id,
      owner: pranav._id,
    },
  ]);

  console.log('Seed complete.');
  console.log('Admin login: admin@example.com / admin123');
  console.log('User login: pranav@example.com / password123');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
