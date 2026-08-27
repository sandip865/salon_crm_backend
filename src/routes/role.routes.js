const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect);
router.use(restrictTo('SUPER_ADMIN')); // Only Super Admin manages roles in this iteration

router.route('/')
  .post(roleController.createRole)
  .get(roleController.getRoles);

router.route('/:id')
  .put(roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;
