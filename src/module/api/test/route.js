module.exports = [
  {
    method: 'GET',
    path: '/test',
    handler: (request, h) => {
      return Math.random()
    },
    options: {
      auth: {
        mode: 'try' // invalid credentials → pass
        // mode: 'optional' // invalid credentials → 401
      },
      description: 'Test api',
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
