const router = require('express').Router();
const controller = require('../controllers/priceController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, controller.getPrices);

module.exports = router;
