const path = require('path')
const glob = require('glob')
const viewEngine = require('@/lib/view-engine')

/**
 * app bootstrap
 * @returns {Promise}
 */
module.exports = server => {
  const config = global.CONFIG
  return server
    .register([
      // one by one carefully
      {
        plugin: require('@/lib/cors'),
        options: {
          origins: [
            '*',
            `https://${config.get('dns')}`,
            `https://api.${config.get('dns')}`,
            `https://ssr.${config.get('dns')}`,
            `https://admin.${config.get('dns')}`
          ]
        }
      },
      { plugin: require('@/lib/cookie') },
      { plugin: require('@hapi/inert') },
      { plugin: require('@hapi/vision') },
      { plugin: require('@/lib/authenticate') },
      { plugin: require('@/lib/static-file') },
      { plugin: require('@/lib/errors') },
      { plugin: require('@/lib/mongo') },
      { plugin: require('@/lib/firebase') },
      {
        plugin: require('hapi18-swagger'),
        options: config.get('swagger')
      }
    ])
    .then(async () => {
      // setup view-engine
      viewEngine(server)

      glob
        .sync(path.join(__dirname, '/model/*/index.js'), {})
        .map(model => require(path.resolve(model)))

      // auto load WEB modules
      const webs = glob
        .sync(path.join(__dirname, '/module/web/*/index.js'), {})
        .map(item => require(path.resolve(item)))

      if (webs.length) {
        await server.register(webs)
      }

      // auto load ADMIN modules
      const admins = glob
        .sync(path.join(__dirname, '/module/admin/*/index.js'), {})
        .map(item => require(path.resolve(item)))

      if (admins.length) {
        await server.register(admins, {
          routes: { prefix: '/admin' }
        })
      }

      // auto load API modules
      const apis = glob
        .sync(path.join(__dirname, '/module/api/*/index.js'), {})
        .map(item => require(path.resolve(item)))

      if (apis.length) {
        await server.register(apis, {
          routes: { prefix: '/api' }
        })
      }

      // API|handle page-not-found
      server.route({
        // method: [ 'GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE' ],
        method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        path: '/api/{any*}',
        options: { auth: false },
        handler: (request, h) => {
          if (request.method.match(/^OPTIONS$/i)) {
            // response empty data with status code 200
            return h
              .response()
              .takeover()
          }

          // debug response
          const response = {
            statusCode: 404,
            error: 'Not Found',
            message: 'Page not found.'
          }

          return h
            .response(response)
            .code(404)
            .takeover()
        }
      })
      // WEB|handle page-not-found
      server.route({
        // method: [ 'GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE' ],
        method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        path: '/{any*}',
        options: { auth: false },
        handler: (request, h) => {
          if (request.method.match(/^OPTIONS$/i)) {
            // response empty data with status code 200
            return h
              .response()
              .takeover()
          }

          // debug response
          const response = {
            statusCode: 404,
            error: 'Not Found',
            message: 'Page not found.'
          }

          const accept = request.headers.accept
          if (accept && accept.match(/json/i)) {
            return h
              .response(response)
              .code(404)
              .takeover()
          }
          return h
            .view('errors/404')
            .code(404)
            .takeover()
        }
      })

      // execute cron job
      require('@/tasks')()
    })
}
