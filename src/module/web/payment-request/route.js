const Controller = require('./controller')
const Validate = require('./validate')

module.exports = [
  {
    method: 'GET',
    path: '/payment-requests',
    handler: Controller.create,
    options: {
      auth: { mode: 'try' },
      description: 'Get payment request form'
    }
  }, {
    method: 'POST',
    path: '/payment-requests',
    handler: Controller.store,
    options: {
      auth: { mode: 'try' },
      validate: Validate.store,
      description: 'Submit payment request form'
    }
  }
]
