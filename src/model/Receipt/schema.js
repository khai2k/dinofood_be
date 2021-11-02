const { Schema } = require('mongoose')

const schema = {
  title: {
    type: String,
    trim: true,
    required: 'Receipt title is required.'
  },
  shippingFee: {
    type: Number,
    min: 0,
    require: 'Receipt shipping fee is required.'
  },
  discount: {
    type: Number,
    min: 0,
    require: 'Receipt discount is required.'
  },
  subTotal: {
    type: Number,
    min: 0,
    require: 'Receipt sub total is required.'
  },
  amount: {
    type: Number,
    min: 0,
    require: 'Receipt amount is required.'
  },
  info: {
    type: String
    // required: 'Receipt information is required.'
  },
  members: [{
    member: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    paid: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      min: 0,
      required: 'Member price is required.'
    },
    fee: {
      type: Number,
      min: 0,
      default: 0
    },
    discount: {
      type: Number,
      min: 0,
      default: 0
    },
    amount: {
      type: Number,
      min: 0,
      required: 'Member amount is required.'
    }
  }],
  orderDate: {
    type: Date,
    default: Date.now
  },
  blamedAt: {
    type: Date,
    default: Date.now
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  paid: {
    type: Boolean,
    default: false
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}

const options = {
  collection: 'receipts',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
