const AuthMiddleware = require('@/module/api/auth/middleware')
const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/register',
    handler: Controller.getRegister,
    options: {
      auth: { mode: 'try' },
      pre: [AuthMiddleware.unAuthorized]
    }
  },
  {
    method: 'POST',
    path: '/register',
    handler: Controller.postRegister,
    options: {
      auth: { mode: 'try' },
      validate: Validate.register,
      pre: [AuthMiddleware.unAuthorized]
    }
  },
  {
    method: 'GET',
    path: '/login',
    handler: Controller.getLogin,
    options: {
      auth: { mode: 'try' },
      pre: [AuthMiddleware.unAuthorized]
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: Controller.postLogin,
    options: {
      auth: { mode: 'try' },
      validate: Validate.login,
      pre: [AuthMiddleware.unAuthorized]
    }
  },
  {
    method: 'GET',
    path: '/logout',
    handler: Controller.logout,
    options: {
      auth: { mode: 'required' },
      validate: Validate.logout
    }
  }
]
