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
    required: [true, 'DishType name is required.']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}

const options = {
  collection: 'dish-types',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
