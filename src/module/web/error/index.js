const routes = require('./route')

exports.register = (server, options) => {
  /* Register router */
  server.route(routes)
}

exports.name = 'web-error'
