const { Schema } = require('mongoose')

const schema = {
  slug: {
    type: String,
    trim: true,
    unique: true,
    required: 'Slug not allow empty!'
  },
  name: {
    type: String,
    trim: true,
    required: 'Name not allow empty!'
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  status: {
    type: String,
    enum: ['archived', 'active', 'inactive'],
    default: 'active'
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}

const options = {
  collection: 'categories',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
