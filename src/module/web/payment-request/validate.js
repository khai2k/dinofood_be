const Joi = require('@hapi/joi')
const constants = require('@/constants')
const failAction = require('@/utils/failAction')

module.exports = {
  store: {
    payload: Joi.object({
      email: Joi.string().email().required().description('user email'),
      type: Joi.string().valid('income', 'outcome').required().description('request type'),
      amount: Joi.number().integer().min(0).required().description('payment amount'),
      paymentMethod: Joi.string().valid(...constants.PAYMENT.METHODS).required().description('payment method'),
      description: Joi.string().allow('').description('request description')
    }),
    failAction: failAction('web/payment-request/create', () => ({
      paymentMethods: constants.PAYMENT.METHODS
    }))
  }
}
