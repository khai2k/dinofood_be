const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/migrate',
    handler: Controller.show,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Get migrate status',
      tags: ['api', 'admin'],
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
    path: '/migrate',
    handler: Controller.update,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Run migrate data from CMS',
      tags: ['api', 'admin'],
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
