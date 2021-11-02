const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/receipts',
    handler: Controller.index,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.index,
      description: 'Get list receipts',
      plugins: {
        menu: [{
          name: 'receipts',
          title: 'Receipt',
          icon: 'fa fa-bars',
          isTreeView: true,
          after: 'users'
        }, {
          name: 'receipts.list',
          title: 'List',
          icon: 'fa fa-file-text-o',
          parent: 'receipts'
        }]
      }
    }
  },
  {
    method: 'GET',
    path: '/receipts/create',
    handler: Controller.create,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Get receipt create form',
      plugins: {
        menu: {
          name: 'receipts.create',
          title: 'Create',
          icon: 'fa fa-plus-square-o',
          parent: 'receipts',
          after: 'receipts.list'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/receipts/{_id}/edit',
    handler: Controller.edit,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Get receipt edit form',
      plugins: {
        menu: {
          name: 'receipts.edit',
          parent: 'receipts',
          visible: false
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/receipts/create',
    handler: Controller.store,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.store,
      description: 'Store receipt information'
    }
  },
  {
    method: 'POST',
    path: '/receipts/{_id}/edit',
    handler: Controller.update,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Update receipt information'
    }
  },
  {
    method: 'PUT',
    path: '/receipts/{_id}/paid',
    handler: Controller.paid,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.paid,
      description: 'Pay receipt information',
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
    path: '/receipts/{_id}/delete',
    handler: Controller.destroy,
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      validate: Validate.destroy,
      description: 'Delete receipt information',
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
