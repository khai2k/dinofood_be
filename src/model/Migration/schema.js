const { Schema } = require('mongoose')
const statuses = {
  IN_PROCESSING: 'in-processing',
  SUCCESS: 'success',
  FAILED: 'failed'
}

const schema = {
  version: {
    type: String,
    trim: true,
    required: 'Version not allow empty!'
  },
  status: {
    type: String,
    enum: Object.values(statuses),
    default: statuses.IN_PROCESSING
  },
  result: {
    type: Schema.Types.Mixed
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}

const options = {
  collection: 'migrations',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  statuses,
  schema,
  options
}
