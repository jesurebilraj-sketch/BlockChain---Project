const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { UnauthorizedError } = require('../utils/errors');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing. Please log in.');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User account associated with token no longer exists.');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      entityId: user.entityId
    };

    next();
  } catch (err) {
    next(err);
  }
}

// Optional Auth (doesn't fail if no token, but populates req.user if valid)
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          entityId: user.entityId
        };
      }
    }
  } catch (e) {
    // Ignore invalid token in optional mode
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};

