const path = require('path')

module.exports.register = async function (server, options) {
  server.route({
    method: 'GET',
    path: '/static/{file*}',
    handler: {
      directory: {
        path: path.join(global.PUBLIC_DIR, 'static')
      }
    },
    options: {
      auth: false
    }
  })

  server.route({
    method: 'GET',
    path: '/components/{file*}',
    handler: {
      directory: {
        path: path.join(global.PUBLIC_DIR, 'components')
      }
    },
    options: {
      auth: false
    }
  })

  server.route({
    method: 'GET',
    path: '/admin/{file*}',
    handler: {
      directory: {
        path: path.join(global.PUBLIC_DIR, 'components/admin-lte')
      }
    },
    options: {
      auth: {
        strategies: ['jwt'],
        mode: 'required',
        scope: ['admin']
      }
    }
  })
}

module.exports.name = 'app-static'
module.exports.dependencies = ['inert', 'app-authenticate']
