const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole) && userRole !== 'ADMIN') {
      return next(new ForbiddenError(`Access forbidden: requires one of roles [${allowedRoles.join(', ')}]`));
    }

    next();
  };
}

module.exports = roleMiddleware;

