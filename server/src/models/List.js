/**
 * List (column) model for SyncBoard.
 * A list belongs to a board. Uses fractional indexing for ordering.
 */
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    /** Fractional index key for ordering — lexicographic string comparison */
    order: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/** Compound index for ordered list retrieval */
listSchema.index({ boardId: 1, order: 1 });

const List = mongoose.model('List', listSchema);

module.exports = List;
