const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

function toUserPayload(userDoc) {
  return {
    id: userDoc._id.toString(),
    username: userDoc.username,
    email: userDoc.email,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    role: userDoc.role,
    department: userDoc.department,
    studentId: userDoc.studentId,
    facultyId: userDoc.facultyId,
    course: userDoc.course,
    branch: userDoc.branch,
  };
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

async function loginWithEnvAdmin(email, password) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return null;
  const isMatch = email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && password === process.env.ADMIN_PASSWORD;
  if (!isMatch) return null;
  const adminPayload = {
    id: 'admin-env',
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL,
    firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
    lastName: process.env.ADMIN_LAST_NAME || 'User',
    role: 'admin',
  };
  const token = signToken(adminPayload);
  return { token, user: adminPayload };
}

async function loginWithDatabaseUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  const ok = await user.comparePassword(password);
  if (!ok) return null;
  const payload = toUserPayload(user);
  const token = signToken(payload);
  return { token, user: payload };
}

class AuthService {
  static async login(credentials) {
    const { email, password } = credentials || {};
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const envResult = await loginWithEnvAdmin(email, password);
    if (envResult) return envResult;

    const dbResult = await loginWithDatabaseUser(email, password);
    if (dbResult) return dbResult;

    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  static async me(userFromContext) {
    return userFromContext;
  }
}

module.exports = { AuthService };



