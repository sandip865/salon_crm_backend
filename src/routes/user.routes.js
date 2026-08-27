const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect);
router.use(restrictTo('SUPER_ADMIN')); // Only Super Admin can manage users in this iteration

router.route('/')
  .post(userController.createUser)
  .get(userController.getUsers);

router.route('/:id')
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
