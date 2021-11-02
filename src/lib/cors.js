const Joi = require('@hapi/joi')

module.exports = {
  name: 'app-cors',
  register: async (server, options) => {
    const schema = Joi.object({
      origins: Joi.array().default(['*']),
      allowCredentials: Joi.string().valid('true', 'false').default('true'),
      exposeHeaders: Joi.array().default(['content-type', 'content-length']).description('Array of exposed headers'),
      maxAge: Joi.number().default(600),
      methods: Joi.array().default(['GET, OPTIONS, POST, PUT, PATCH, DELETE']),
      headers: Joi.array().default(['Accept', 'Content-Type', 'Authorization']),
      checkOrigin: Joi.func()
    })

    options = await schema.validateAsync(options)

    server.ext({
      type: 'onPreResponse',
      method: (request, reply) => {
        if (!request.headers.origin) {
          return reply.continue
        }

        const response = request.response.isBoom ? request.response.output : request.response

        // Use request's origin if it is present in whitelist
        if (options.checkOrigin !== undefined) {
          if (options.checkOrigin(request.headers.origin)) {
            response.headers['access-control-allow-origin'] = request.headers.origin
          }
        } else {
          if (options.origins.indexOf(request.headers.origin) !== -1 || (options.origins.length === 1 && options.origins[0] === '*')) {
            response.headers['access-control-allow-origin'] = request.headers.origin
          }
        }

        response.headers['access-control-allow-credentials'] = options.allowCredentials

        if (request.method !== 'options') {
          return reply.continue
        }

        response.statusCode = 200

        response.headers['access-control-expose-headers'] = options.exposeHeaders.join(', ')
        response.headers['access-control-max-age'] = options.maxAge
        response.headers['access-control-allow-methods'] = options.methods.join(', ')
        response.headers['access-control-allow-headers'] = options.headers.join(', ')

        return reply.continue
      }
    })
  }
}
