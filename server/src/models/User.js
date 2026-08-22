/**
 * User model for SyncBoard.
 * Stores credentials and refresh token version for session invalidation.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require('../config/env');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    /**
     * Bumping this number invalidates ALL existing refresh tokens for this user.
     * Used on logout and password change — a clean, stateless revocation mechanism
     * that doesn't require a token blacklist.
     */
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook: hash password before persisting.
 * Only runs when passwordHash is modified (not on every save).
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS, 10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
  next();
});

/**
 * Compares a candidate password against the stored hash.
 * @param {string} candidatePassword - Plain-text password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Ensure passwordHash is never returned in JSON responses.
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokenVersion;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
