const { Schema } = require('mongoose')

const schema = {
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: 'User is required.'
  },
  type: {
    type: String,
    enum: ['income', 'outcome'],
    required: 'Type is required.'
  },
  oldBalance: {
    type: Number,
    required: 'Old balance is required.'
  },
  newBalance: {
    type: Number,
    required: 'New balance is required.'
  },
  amount: {
    type: Number,
    min: 0,
    required: 'Amount is required.'
  },
  reference: {
    model: {
      type: String,
      enum: [
        'Receipt',
        'Transfer',
        'PaymentRequest'
      ]
    },
    value: {
      type: Schema.Types.ObjectId,
      refPath: 'reference.model'
    }
  },
  description: {
    type: String,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}

const options = {
  collection: 'balance-histories',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
