const checkPermission = (resource, requiredActions = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'No role assigned to user' });
    }

    // Super Admin bypass
    if (req.user.role.name === 'SUPER_ADMIN') {
      return next();
    }

    const permissions = req.user.role.permissions || [];
    const resourcePerm = permissions.find(p => p.resource === resource);

    if (!resourcePerm) {
      return res.status(403).json({ error: 'FORBIDDEN', message: `No permissions for resource: ${resource}` });
    }

    const hasAllActions = requiredActions.every(action => resourcePerm.actions.includes(action));

    if (!hasAllActions) {
      return res.status(403).json({ error: 'FORBIDDEN', message: `Missing required actions on ${resource}` });
    }

    next();
  };
};

module.exports = { checkPermission };
