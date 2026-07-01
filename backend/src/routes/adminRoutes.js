const router = require('express').Router();
const controller = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/users', controller.listUsers);
router.delete('/users/:id', controller.deleteUser);
router.get('/stats', controller.stats);

module.exports = router;
