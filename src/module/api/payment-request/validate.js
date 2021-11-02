const Joi = require('@hapi/joi')
const constants = require('@/constants')

module.exports = {
  getRanking: {
    query: Joi.object({
      type: Joi.string().valid('income', 'outcome').required().description('request type'),
      from: Joi.date().iso().description('createdAt from'),
      to: Joi.date().iso().description('createdAt to'),
      limit: Joi.number().default(3).description('limit ranking')
    })
  },

  index: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).description('page'),
      limit: Joi.number().integer().min(1).max(100).default(10).description('limit per page'),
      offset: Joi.number().integer().min(0).max(100).default(0).description('offset'),
      fromDate: Joi.date().iso().description('Filter from date | ISOString'),
      toDate: Joi.date().iso().description('Filter to date | ISOString')
    })
  },

  store: {
    payload: Joi.object({
      email: Joi.string().email().required().description('user email'),
      type: Joi.string().valid('income', 'outcome').required().description('request type'),
      amount: Joi.number().integer().min(1).required().description('payment amount'),
      paymentMethod: Joi.string().valid(...constants.PAYMENT.METHODS).required().description('payment method'),
      description: Joi.string().allow('').description('request description')
    })
  },

  update: {
    params: Joi.object({
      _id: Joi.string().length(24).required()
    }),
    payload: Joi.object({
      type: Joi.string().valid('income', 'outcome').description('request type'),
      amount: Joi.number().integer().min(1).description('payment amount'),
      paymentMethod: Joi.string().valid(...constants.PAYMENT.METHODS).description('payment method'),
      description: Joi.string().allow('').description('request description')
    })
  },

  show: {
    params: Joi.object({
      _id: Joi.string().length(24).required()
    })
  },

  cancel: {
    params: Joi.object({
      _id: Joi.string().length(24).required()
    })
  }
}
