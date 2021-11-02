const { Schema } = require('mongoose')
const constants = require('@/constants')

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
  paymentMethod: {
    type: String,
    enum: constants.PAYMENT.METHODS,
    default: constants.PAYMENT.METHODS[0]
  },
  amount: {
    type: Number,
    min: 0,
    required: 'Amount is required.'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String
  }
}

const options = {
  collection: 'payment-requests',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
