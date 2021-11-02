const Joi = require('@hapi/joi')

module.exports = {
  updateKeyword: {
    payload: Joi.object({
      email: Joi.string().email().required().description('email'),
      keywords: Joi.array().items(Joi.string().trim()).min(1).required().description('keywords')
    })
  },

  updatePassword: {
    payload: Joi.object({
      currentPassword: Joi.string().min(6).required().description('currentPassword'),
      password: Joi.string().min(6).required().description('new password'),
      passwordConfirm: Joi.string().min(6).required().description('confirm new password')
    })
  }
}
