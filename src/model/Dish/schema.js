const { Schema } = require('mongoose')

const schema = {
  idInc: {
    type: Number,
    sparse: true,
    unique: true
  },
  name: {
    type: String,
    trim: true,
    required: [true, 'Dish name is required.']
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  photos: [{
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    value: {
      type: String
    }
  }],
  options: [{
    name: {
      type: String,
      trim: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    items: [{
      name: {
        type: String,
        trim: true
      },
      price: {
        type: Number,
        min: 0,
        default: 0
      },
      isDefault: {
        type: Boolean,
        default: false
      }
    }]
  }],
  type: {
    type: Schema.Types.ObjectId,
    ref: 'DishType'
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}

const options = {
  collection: 'dishes',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
