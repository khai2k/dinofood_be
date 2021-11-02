const Boom = require('@hapi/boom')
const helpers = require('@/utils/helpers')
const { _COOKIE_REDIRECT_KEY } = require('@/lib/cookie')

module.exports = {
  name: 'app-errors',
  register: async server => {
    // server.ext('onRequest', (request, h) => {
    //   console.log(request)
    //   return h.continue
    // })

    /**
     * Check request is Ajax
     * @return {Boolean}
     */
    const isAjax = request => {
      if (helpers.ensureArray(request.route.settings.tags).includes('api')) {
        return true
      }
      return !!request.path.match(/^\/api/i)
    }

    // 400 bad request error handler
    const handleBadRequest = (request, h) => {
      if (isAjax(request)) {
        return h.continue
      }

      return h.view('errors/400')
    }

    // 401 unauthenticated|unauthorized error handler
    const handleUnauthorized = (request, h) => {
      if (isAjax(request)) {
        return h.continue
      }

      h.state(_COOKIE_REDIRECT_KEY, request.path)

      return h
        .redirect('http://' + request.headers.host + '/login')
        .takeover()

      // return h.view('errors/401')
    }

    // 403 forbidden error handler
    const handleForbidden = (request, h) => {
      if (isAjax(request)) {
        return h.continue
      }

      return h.view('errors/403')
    }

    // 404 internal error handler
    const handleNotFound = (request, h) => {
      if (isAjax(request)) {
        return h.continue
      }

      // return h
      //   .redirect('http://' + request.headers.host + '/404')
      //   .takeover()

      return h.view('errors/404')
    }

    // 405 Method Not Allowed
    const handleNotAllow = (request, h) => {
      if (isAjax(request)) {
        return h.continue
      }

      // return h
      //   .redirect('http://' + request.headers.host + '/405')
      //   .takeover()

      return h.view('errors/405')
    }

    // 500 internal error handler
    const handleInternal = (request, h) => {
      return Boom.internal(request.response.output.payload.message)
    }

    server.ext('onPreResponse', (request, h) => {
      // Transform only server errors
      if (request.response.isBoom && request.response.isServer) {
        // handler 500 server error
        // add more notify || mail notify here
        return handleInternal(request, h)
      }

      if (request.response.isBoom) {
        switch (request.response.output.statusCode) {
          case 400:
            return handleBadRequest(request, h)
          case 401:
            return handleUnauthorized(request, h)
          case 403:
            return handleForbidden(request, h)
          case 404:
            return handleNotFound(request, h)
          case 405:
            return handleNotAllow(request, h)
          case 500:
            return handleInternal(request, h)
        }
      }

      if (request.route.fingerprint === '/#') {
        return handleNotFound(request, h)
      }

      return h.continue
    })
  }
}
