const Joi = require('@hapi/joi')
const Util = require('./util')
const failAction = require('@/utils/failAction')

module.exports = {
  index: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).description('page'),
      sortBy: Joi.string().valid('createdAt', '-createdAt', 'email', '-email').default('-createdAt').description('sortBy'),
      limit: Joi.number().integer().min(1).max(100).default(10).description('limit per page'),
      offset: Joi.number().integer().min(0).max(100).default(0).description('offset')
    }).unknown(true),
    options: {
      allowUnknown: false
    }
  },

  store: {
    payload: Joi.object({
      title: Joi.string().required().description('receipt title'),
      'shipping-fee': Joi.number().integer().min(0).required().description('shipping fee'),
      discount: Joi.number().integer().min(0).required().description('discount'),
      info: Joi.string().required().description('receipt information')
    }).unknown(true),
    options: {
      allowUnknown: false
    },
    failAction: failAction('admin/receipt/create', Util.getCreateRequirement)
  },

  paid: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('user _id')
    }),
    options: {
      allowUnknown: false
    }
  },

  destroy: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('user _id')
    }),
    options: {
      allowUnknown: false
    }
  }
}
