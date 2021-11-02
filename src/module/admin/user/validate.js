const Joi = require('@hapi/joi')
const Util = require('./util')
const helpers = require('@/utils/helpers')
const failAction = require('@/utils/failAction')
const fields = [
  'createdAt',
  'updatedAt',
  'email',
  'name',
  'username',
  'balance',
  'phone',
  'isActive'
]

module.exports = {
  index: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).description('page'),
      email: Joi.string().allow('').description('email'),
      phone: Joi.string().allow('').description('phone'),
      name: Joi.string().allow('').description('name'),
      sortBy: Joi.string().valid(...helpers.generateSortFields(fields)).default('-createdAt').description('sortBy'),
      limit: Joi.number().integer().min(1).max(100).default(10).description('limit per page'),
      offset: Joi.number().integer().min(0).max(100).default(0).description('offset')
    }).unknown(true),
    options: {
      allowUnknown: false
    }
  },

  edit: {
    params: Joi.object({
      _id: Joi.string().required().description('user _id')
    }),
    options: {
      allowUnknown: false
    }
  },

  update: {
    params: Joi.object({
      _id: Joi.string().required().description('user _id')
    }),
    payload: Joi.object({
      name: Joi.string().required().description('name'),
      isActive: Joi.boolean().default(false).description('active status'),
      balance: Joi.number().integer().description('user balance')
    }).unknown(true),
    options: {
      allowUnknown: false
    },
    failAction: failAction('admin/user/edit', Util.getEditRequirement)
  }
}
