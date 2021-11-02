const schema = {
  fullname: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: 'Email is required.'
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d+$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  balance: {
    type: Number,
    default: 0
  },
  password: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  scope: {
    type: [{
      type: String,
      enum: ['user', 'admin', 'super-admin']
    }],
    default: ['user']
  },
  keyCode: {
    type: {
      key: {
        type: String,
        unique: true
      },
      exp: Date
    },
    default: {}
  },
  keywords: {
    type: [{
      type: String,
      trim: true
    }],
    default: []
  }
}

const options = {
  collection: 'users',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

module.exports = {
  schema,
  options
}
