const Joi = require('@hapi/joi')
// const failAction = require('@/utils/failAction')

module.exports = {
  checkBalance: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).description('page'),
      limit: Joi.number().integer().min(1).max(100).default(10).description('limit per page'),
      offset: Joi.number().integer().min(0).max(100).default(0).description('offset'),
      fromDate: Joi.date().iso().description('Filter from date | ISOString'),
      toDate: Joi.date().iso().description('Filter to date | ISOString')
    }),
    options: {
      allowUnknown: false
    }
  },

  getRanking: {
    query: Joi.object({
      from: Joi.date().iso().description('createdAt from'),
      to: Joi.date().iso().description('createdAt to'),
      limit: Joi.number().default(3).description('limit ranking')
    })
  }
}
