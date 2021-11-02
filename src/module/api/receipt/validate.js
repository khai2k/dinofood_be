const Joi = require('@hapi/joi')

const generalPayloadSchema = Joi.object({
  title: Joi.string().required().description('receipt title'),
  shippingFee: Joi.number().integer().min(0).required().description('shipping fee'),
  discount: Joi.number().integer().min(0).required().description('discount'),
  members: Joi
    .array()
    .single()
    .required()
    // unique by email
    .unique((a, b) => a.email === b.email)
    .items(
      Joi.object({
        email: Joi.string().email().required().description('member\'s email'),
        price: Joi.number().integer().min(1).description('price of member')
      })
    )
    .description(`Array members unique by email - example: ${JSON.stringify([{
      price: 10000,
      email: 'danh.le@dinovative.com'
    }])}`)
})

module.exports = {
  index: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).description('page'),
      limit: Joi.number().integer().min(1).max(100).default(10).description('limit per page'),
      offset: Joi.number().integer().min(0).max(100).default(0).description('offset'),
      keyword: Joi.string().allow('').description('search title'),
      status: Joi.string().allow('', 'confirmed', 'unconfirmed', 'paid', 'unpaid').description('filter status'),
      fromDate: Joi.date().iso().description('Filter from date | ISOString'),
      toDate: Joi.date().iso().description('Filter to date | ISOString'),
      isOwner: Joi.boolean().default(false).description('your own receipt only'),
      sort: Joi
        .string()
        .valid('updatedAt', '-updatedAt', 'createdAt', '-createdAt', 'title', '-title')
        .default('-createdAt')
        .description('sort field')
    }).unknown(true),
    options: {
      allowUnknown: false
    }
  },

  store: {
    payload: generalPayloadSchema
  },

  show: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id')
    })
  },

  update: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id')
    }),
    payload: generalPayloadSchema
  },

  destroy: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id')
    })
  },

  confirm: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id')
    })
  },

  paid: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id')
    })
  },

  paidOnMember: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id'),
      member: Joi.string().length(24).required().description('one member _id in receipt\'s members')
    })
  },

  pay: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id')
    })
  },

  verifyPay: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id')
    }),
    payload: Joi.object({
      transfer: Joi.string().length(24).required().description('Transfer payment _id'),
      OTP: Joi.string().length(6).required().description('Transfer OTP')
    })
  },

  blame: {
    params: Joi.object({
      _id: Joi.string().length(24).required().description('Receipt _id')
    }),
    payload: Joi.object({
      template: Joi.string().description('blame template')
    })
  }
}
