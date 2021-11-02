const Joi = require('@hapi/joi')
// const failAction = require('@/utils/failAction')

module.exports = {
  checkBalance: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).description('page'),
      limit: Joi.number().integer().min(1).max(100).default(10).description('limit per page'),
      offset: Joi.number().integer().min(0).max(100).default(0).description('offset'),
      email: Joi.string().email().description('email')
    }).unknown(true),
    options: {
      allowUnknown: false
    }
  }
}
