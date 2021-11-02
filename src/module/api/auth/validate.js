const Joi = require('@hapi/joi')

module.exports = {
  register: {
    payload: Joi.object({
      email: Joi.string().email().required().default('danh.danh20051995@gmail.com').description('email'),
      password: Joi.string().min(6).required().description('password'),
      passwordConfirm: Joi.string().min(6).required().description('password')
    }),
    options: {
      allowUnknown: false
    }
  },

  login: {
    payload: Joi.object({
      email: Joi.string().email().required().description('email'),
      password: Joi.string().min(6).required().description('password'),
      remember: Joi.boolean().default(false).description('remember')
    }),
    options: {
      allowUnknown: false
    }
  },

  forgetPassword: {
    payload: Joi.object({
      email: Joi.string().email().required().description('email')
    })
  },

  resetPassword: {
    payload: Joi.object({
      token: Joi.string().required().description('token from email'),
      password: Joi.string().min(6).required().description('new password'),
      passwordConfirm: Joi.string().min(6).required().description('confirm new password')
    })
  }
}
