const Validate = require('./validate')

module.exports = [
  {
    method: 'GET',
    path: '/test/{view}',
    handler: (request, h) => {
      return h
        .view(`web/test/${request.params.view}`)
        .takeover()
    },
    options: {
      auth: { mode: 'try' },
      validate: Validate.test
    }
  }
]
