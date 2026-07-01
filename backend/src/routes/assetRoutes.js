const router = require('express').Router();
const controller = require('../controllers/assetController');
const validate = require('../middlewares/validate');
const { createAssetSchema, updateAssetSchema } = require('../validations/assetValidation');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.post('/', validate(createAssetSchema), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.put('/:id', validate(updateAssetSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
