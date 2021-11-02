const Joi = require('@hapi/joi')
const helpers = require('@/utils/helpers')
const fields = [
  'type',
  'paymentMethod',
  'status',
  'createdAt',
  'amount'
]

module.exports = {
  index: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).description('page'),
      sortBy: Joi.string().valid(...helpers.generateSortFields(fields)).default('-createdAt').description('sortBy'),
      limit: Joi.number().integer().min(1).max(100).default(10).description('limit per page'),
      offset: Joi.number().integer().min(0).max(100).default(0).description('offset')
    }).unknown(true),
    options: {
      allowUnknown: false
    }
  },

  update: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('_id')
    }),
    payload: Joi.object({
      status: Joi.string().valid('approved', 'rejected').required().description('status')
    }),
    options: {
      allowUnknown: false
    }
  },

  destroy: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('_id')
    }),
    options: {
      allowUnknown: false
    }
  }
}
