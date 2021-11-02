const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/transfer',
    handler: Controller.index,
    options: {
      auth: { mode: 'required' },
      validate: Validate.index,
      description: 'Get transfer history.',
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
    path: '/transfer',
    handler: Controller.store,
    options: {
      auth: { mode: 'required' },
      validate: Validate.store,
      description: 'Create transfer payment and send OTP via EMAIL.',
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
    path: '/transfer/{_id}',
    handler: Controller.verify,
    options: {
      auth: { mode: 'required' },
      validate: Validate.verify,
      description: 'Verify OTP and execute transfer.',
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
