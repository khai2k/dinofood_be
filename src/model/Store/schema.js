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
    required: [true, 'Store name is required.']
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
    required: 'Slug not allow empty!'
  },
  provider: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Store url is required.']
  },
  address: {
    type: String,
    trim: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: String
  }],
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
  rating: {
    avg: {
      type: Number
    },
    count: {
      type: Number,
      default: 0
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      required: true
    }
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}

const options = {
  collection: 'stores',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
