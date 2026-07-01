const router = require('express').Router();
const controller = require('../controllers/portfolioController');
const validate = require('../middlewares/validate');
const { createPortfolioSchema, updatePortfolioSchema } = require('../validations/portfolioValidation');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.post('/', validate(createPortfolioSchema), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.put('/:id', validate(updatePortfolioSchema), controller.update);
router.delete('/:id', controller.remove);

router.get('/:id/summary', controller.summary);
router.get('/:id/top-asset', controller.topAsset);
router.get('/:id/distribution', controller.distribution);

module.exports = router;
