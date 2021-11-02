const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/payment-requests/ranking',
    handler: Controller.getRanking,
    options: {
      auth: { mode: 'try' },
      validate: Validate.getRanking,
      description: 'Get ranking of the payment requests',
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
    method: 'GET',
    path: '/payment-requests',
    handler: Controller.index,
    options: {
      auth: { mode: 'required' },
      validate: Validate.index,
      description: 'Get payment request history',
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
    path: '/payment-requests',
    handler: Controller.store,
    options: {
      auth: { mode: 'try' },
      validate: Validate.store,
      description: 'Submit payment request form',
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
    method: 'GET',
    path: '/payment-requests/{_id}',
    handler: Controller.show,
    options: {
      auth: { mode: 'required' },
      validate: Validate.show,
      description: 'Get payment request',
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
    method: 'PUT',
    path: '/payment-requests/{_id}',
    handler: Controller.update,
    options: {
      auth: { mode: 'required' },
      validate: Validate.update,
      description: 'Update pending payment request',
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
    path: '/payment-requests/{_id}',
    handler: Controller.cancel,
    options: {
      auth: { mode: 'required' },
      validate: Validate.cancel,
      description: 'Cancel pending payment request',
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
