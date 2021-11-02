const Validate = require('./validate')
const Controller = require('./controller')
const AuthMiddleware = require('@/module/api/auth/middleware')

module.exports = [
  {
    method: 'GET',
    path: '/auth/profile',
    handler: Controller.profile,
    options: {
      auth: { mode: 'required' },
      description: 'Get current user profile',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          responses: {
            400: { description: 'Bad Request' }
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/register',
    handler: Controller.register,
    options: {
      auth: { mode: 'try' },
      pre: [AuthMiddleware.unAuthorized],
      validate: Validate.register,
      description: 'Register new user profile',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          responses: {
            400: { description: 'Bad Request' }
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: Controller.login,
    options: {
      auth: { mode: 'try' },
      pre: [AuthMiddleware.unAuthorized],
      validate: Validate.login,
      description: 'User login',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          responses: {
            400: { description: 'Bad Request' }
          }
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/auth/logout',
    handler: Controller.logout,
    options: {
      auth: { mode: 'try' },
      // auth: { mode: 'required' },
      description: 'User logout',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          responses: {
            400: { description: 'Bad Request' }
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/forget-password',
    handler: Controller.forgetPassword,
    options: {
      auth: { mode: 'try' },
      pre: [AuthMiddleware.unAuthorized],
      validate: Validate.forgetPassword,
      description: 'Send reset password token',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          responses: {
            400: { description: 'Bad Request' }
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/reset-password',
    handler: Controller.resetPassword,
    options: {
      auth: { mode: 'try' },
      pre: [AuthMiddleware.unAuthorized],
      validate: Validate.resetPassword,
      description: 'Reset user password',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          responses: {
            400: { description: 'Bad Request' }
          }
        }
      }
    }
  }
]
