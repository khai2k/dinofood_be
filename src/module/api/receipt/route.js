const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/receipts',
    handler: Controller.index,
    options: {
      auth: { mode: 'required' },
      validate: Validate.index,
      description: 'Paginate receipts.',
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
    path: '/receipts',
    handler: Controller.store,
    options: {
      auth: { mode: 'required' },
      validate: Validate.store,
      description: 'Create new receipt.',
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
    path: '/receipts/{_id}',
    handler: Controller.show,
    options: {
      auth: { mode: 'required' },
      validate: Validate.show,
      description: 'Get receipt information.',
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
    path: '/receipts/{_id}',
    handler: Controller.update,
    options: {
      auth: { mode: 'required' },
      validate: Validate.update,
      description: 'Update un-confirm receipt information.',
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
    path: '/receipts/{_id}',
    handler: Controller.destroy,
    options: {
      auth: { mode: 'required' },
      validate: Validate.destroy,
      description: 'Delete un-confirm receipt information.',
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
    method: 'PATCH',
    path: '/receipts/{_id}/confirm',
    handler: Controller.confirm,
    options: {
      auth: { mode: 'required' },
      validate: Validate.confirm,
      description: 'Confirm receipt information. Send receipt notify to members. Cannot edit after confirmed.',
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
    method: 'PATCH',
    path: '/receipts/{_id}/paid',
    handler: Controller.paid,
    options: {
      auth: { mode: 'required' },
      validate: Validate.paid,
      description: 'Force update paid to "true" for all members in receipt.',
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
    method: 'PATCH',
    path: '/receipts/{_id}/members/{member}/paid',
    handler: Controller.paidOnMember,
    options: {
      auth: { mode: 'required' },
      validate: Validate.paidOnMember,
      description: 'Force update paid to "true" for a member in receipt.',
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
    method: 'PATCH',
    path: '/receipts/{_id}/pay',
    handler: Controller.pay,
    options: {
      auth: { mode: 'required' },
      validate: Validate.pay,
      description: 'Member pay to receipt.',
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
    path: '/receipts/{_id}/pay',
    handler: Controller.verifyPay,
    options: {
      auth: { mode: 'required' },
      validate: Validate.verifyPay,
      description: 'Verify pay to receipt.',
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
    path: '/receipts/{_id}/blame',
    handler: Controller.blame,
    options: {
      auth: { mode: 'required' },
      validate: Validate.blame,
      description: 'Blame all receipt members.',
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
