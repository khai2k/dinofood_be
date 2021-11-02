const moment = require('moment')
const { Schema } = require('mongoose')

const schema = {
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    trim: true
  },
  jwtToken: {
    type: String,
    trim: true,
    required: 'jwt-token not allow empty!'
  },
  fcmToken: { // notification device token
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['authenticate', 'reset'],
    default: 'authenticate'
  },
  exp: {
    type: Date,
    default () {
      return moment().add(7, 'days')
    }
  },
  deletedAt: {
    type: Date
  }
}

const options = {
  collection: 'tokens',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
