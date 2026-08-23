/**
 * Card model for SyncBoard.
 * A card belongs to a list (and transitively to a board).
 * Uses fractional indexing for O(1) reorder writes.
 *
 * Design note on ordering: We use fractional positioning (via the
 * 'fractional-indexing' package) instead of array-index rewriting.
 * This means moving a card is a single-document update, not a
 * cascading rewrite of every card in the list — critical for
 * concurrent multi-user drag-and-drop.
 */
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description must be at most 2000 characters'],
    },
    assignees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    /** Fractional index key for ordering within a list */
    order: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Compound index for efficient ordered card retrieval within a list.
 * The _id tiebreaker ensures deterministic ordering when two cards
 * have the same order key (e.g. from concurrent inserts).
 */
cardSchema.index({ boardId: 1, listId: 1, order: 1, _id: 1 });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
