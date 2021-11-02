const Joi = require('@hapi/joi')

module.exports = {
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
      email: Joi.string().email().required().description('email'),
      amount: Joi.number().integer().min(1).required().description('amount'),
      description: Joi.string().required().description('description')
    })
  },

  verify: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Transfer payment ObjectId')
    }),
    payload: Joi.object({
      OTP: Joi.string().length(6).required().description('Transfer OTP')
    })
  }
}
