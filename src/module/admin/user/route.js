const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/users',
    handler: Controller.index,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.index,
      description: 'Get list users',
      plugins: {
        menu: [{
          name: 'users',
          title: 'User',
          icon: 'fa fa-bars',
          isTreeView: true,
          after: 'manager'
        }, {
          name: 'users.list',
          title: 'List',
          icon: 'fa fa-users',
          parent: 'users'
        }]
      }
    }
  },
  {
    method: 'GET',
    path: '/users/create',
    handler: Controller.create,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Get create user form',
      plugins: {
        menu: {
          name: 'users.create',
          title: 'Create',
          icon: 'fa fa-user-plus',
          parent: 'users',
          after: 'users.list'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/create',
    handler: Controller.store,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Create new user'
    }
  },
  {
    method: 'GET',
    path: '/users/{_id}/edit',
    handler: Controller.edit,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.edit,
      description: 'Get edit user form',
      plugins: {
        menu: {
          name: 'users.edit',
          parent: 'users',
          visible: false
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/users/{_id}/edit',
    handler: Controller.update,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.update,
      description: 'Update user information'
    }
  },
  {
    method: 'DELETE',
    path: '/users/{_id}',
    handler: Controller.destroy,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Delete user information'
    }
  }, {
    method: 'POST',
    path: '/users/require-payment',
    handler: Controller.sendRequirePaymentNotification,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Send require payment notification',
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
