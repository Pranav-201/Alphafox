const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/portfolios', require('./portfolioRoutes'));
router.use('/assets', require('./assetRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/prices', require('./priceRoutes'));

module.exports = router;
