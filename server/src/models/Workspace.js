/**
 * Workspace model for SyncBoard.
 * A workspace groups boards and members with role-based access.
 */
const mongoose = require('mongoose');
const { ROLES } = require('../utils/constants');

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: [ROLES.VIEWER, ROLES.MEMBER, ROLES.ADMIN],
      default: ROLES.MEMBER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
  },
  { timestamps: true }
);

/** Index for fast lookup of user's workspaces */
workspaceSchema.index({ 'members.userId': 1 });

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
