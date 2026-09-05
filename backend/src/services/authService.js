const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { UnauthorizedError, ConflictError, ValidationError } = require('../utils/errors');
const { validateRegisterPayload, validateLoginPayload } = require('../validators/schemas');

class AuthService {
  async register(data) {
    validateRegisterPayload(data);

    const existing = await User.findOne({
      where: { username: data.username.toLowerCase().trim() }
    });

    if (existing) {
      throw new ConflictError(`Username '${data.username}' is already registered.`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    let role = (data.role || 'CITIZEN').toUpperCase();
    // Public self-registration cannot grant ADMIN or VALIDATOR
    if (['ADMIN', 'VALIDATOR'].includes(role) && !data.isAdminCreated) {
      role = 'CITIZEN';
    }

    const user = await User.create({
      username: data.username.toLowerCase().trim(),
      passwordHash,
      role,
      name: data.name || data.username,
      email: data.email || `${data.username.toLowerCase().trim()}@pdschain.local`,
      entityId: data.entityId || null
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        entityId: user.entityId
      },
      token
    };
  }

  async login(username, password) {
    validateLoginPayload({ username, password });

    const user = await User.scope('withPassword').findOne({
      where: { username: username.toLowerCase().trim() }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials. Check username and password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials. Check username and password.');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        entityId: user.entityId
      },
      token
    };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }
}

module.exports = new AuthService();

