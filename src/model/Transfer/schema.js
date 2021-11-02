const { Schema } = require('mongoose')

const schema = {
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: 'User is required.'
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: 'Receiver is required.'
  },
  amount: {
    type: Number,
    min: 0,
    required: 'Amount is required.'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'expired'],
    default: 'pending'
  },
  description: {
    type: String
  },
  OTP: {
    type: String,
    require: 'Transfer OTP is  required.'
  },
  reference: {
    model: {
      type: String,
      enum: [
        'Receipt'
      ]
    },
    value: {
      type: Schema.Types.ObjectId,
      refPath: 'reference.model'
    }
  }
}

const options = {
  collection: 'transfers',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
