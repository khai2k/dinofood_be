const Joi = require('@hapi/joi')
const { _COOKIE_TOKEN_KEY } = require('@/lib/cookie')
const failAction = require('@/utils/failAction')

module.exports = {
  register: {
    payload: Joi.object({
      email: Joi.string().email().required().description('email'),
      password: Joi.string().min(6).required().description('password'),
      confirmPassword: Joi.string().min(6).required().description('password')
    }),
    options: {
      abortEarly: false,
      allowUnknown: false
    },
    failAction: failAction('web/auth/register')
  },

  login: {
    payload: Joi.object({
      email: Joi.string().email().required().description('email'),
      password: Joi.string().min(6).required().description('password'),
      remember: Joi.boolean().default(false).description('remember')
    }),
    options: {
      abortEarly: false,
      allowUnknown: false
    },
    failAction: failAction('web/auth/login')
  },

  logout: {
    state: Joi.object({
      [_COOKIE_TOKEN_KEY]: Joi.string().required().description('token')
    }),
    options: {
      allowUnknown: false
    }
  }
}
