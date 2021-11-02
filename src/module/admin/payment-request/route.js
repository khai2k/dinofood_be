const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/payment-requests',
    handler: Controller.index,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.index,
      description: 'Get payment requests',
      plugins: {
        menu: [{
          name: 'payment-requests',
          title: 'Payment request',
          icon: 'fa fa-bars',
          isTreeView: true,
          after: 'receipts'
        }, {
          name: 'payment-requests.list',
          title: 'List',
          icon: 'fa fa-indent',
          parent: 'payment-requests'
        }]
      }
    }
  },
  {
    method: 'PUT',
    path: '/payment-requests/{_id}',
    handler: Controller.update,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.update,
      description: 'Update payment request status',
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
    method: 'DELETE',
    path: '/payment-requests/{_id}',
    handler: Controller.destroy,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.destroy,
      description: 'Delete payment request',
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
