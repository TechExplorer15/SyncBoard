/**
 * Board model for SyncBoard.
 * A board belongs to a workspace and contains lists.
 */
const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
  },
  { timestamps: true }
);

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
