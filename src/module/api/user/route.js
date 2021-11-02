const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  // {
  //   method: 'POST',
  //   path: '/users/update-keyword',
  //   handler: Controller.updateKeyword,
  //   options: {
  //     auth: {
  //       mode: 'required',
  //       scope: 'admin'
  //     },
  //     validate: Validate.updateKeyword,
  //     description: 'Update user match keywords',
  //     tags: ['api'],
  //     plugins: {
  //       'hapi-swagger': {
  //         payloadType: 'form',
  //         responses: {
  //           400: { description: 'Bad Request' }
  //         }
  //       }
  //     }
  //   }
  // },
  {
    method: 'POST',
    path: '/users/update-password',
    handler: Controller.updatePassword,
    options: {
      auth: {
        mode: 'required'
      },
      validate: Validate.updatePassword,
      description: 'Update current profile password',
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
