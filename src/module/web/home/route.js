const Validate = require('./validate')
const Controller = require('./controller')

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.view('web/home/welcome')
    },
    options: {
      auth: { mode: 'try' }
    }
  },
  {
    method: 'GET',
    path: '/check-balance',
    handler: Controller.checkBalance,
    options: {
      auth: { mode: 'try' },
      validate: Validate.checkBalance
    }
  }
]
