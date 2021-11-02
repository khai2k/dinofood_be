const routes = require('./route')

exports.name = 'admin-dashboard'
exports.register = (server, options) => {
  /* Register router */
  server.route(routes)
}
