const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { protect } = require('../middlewares/auth.middleware');
const { checkPermission } = require('../middlewares/rbac.middleware');

// All client routes require authentication and SUPER_ADMIN bypasses permissions
router.use(protect);

router.post('/', checkPermission('Clients', ['C']), clientController.createClient);
router.get('/', checkPermission('Clients', ['R']), clientController.getAllClients);
router.get('/:id', checkPermission('Clients', ['R']), clientController.getClientById);
router.put('/:id', checkPermission('Clients', ['U']), clientController.updateClient);
router.delete('/:id', checkPermission('Clients', ['D']), clientController.deleteClient);

module.exports = router;
