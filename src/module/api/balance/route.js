const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/check-balance',
    handler: Controller.checkBalance,
    options: {
      auth: { mode: 'required' },
      validate: Validate.checkBalance,
      description: 'Get balance history',
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
    path: '/balance/ranking',
    handler: Controller.getRanking,
    options: {
      auth: { mode: 'try' },
      validate: Validate.getRanking,
      description: 'Get balance ranking',
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
