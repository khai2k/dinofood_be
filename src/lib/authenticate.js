const JWT = require('jsonwebtoken')
const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const { _COOKIE_TOKEN_KEY } = require('@/lib/cookie')

/**
 * options validate schema
 */
const schema = Joi.object({
  tokenType: Joi.string().required(),
  validate: Joi.func().required(),
  password: Joi.string().required(),
  unauthorized: Joi.func()
})

/**
 * authenticate implementation callback
 * @returns {Object}
 */
const implementation = (server, options) => {
  // validate options
  Joi.assert(options, schema)

  return {
    authenticate: async (request, h) => {
      try {
        // get token from header
        let authorization = request.raw.req.headers.authorization
        if (!authorization) {
          if (!request.state[_COOKIE_TOKEN_KEY]) {
            return options.unauthorized('unauthorized', options.tokenType)
          }

          authorization = `${options.tokenType} ${request.state[_COOKIE_TOKEN_KEY]}`
        }

        if (!authorization) {
          return options.unauthorized('unauthorized', options.tokenType)
        }

        const [tokenType, token] = authorization.split(/\s+/)

        if (!token || tokenType !== options.tokenType) {
          return options.unauthorized('unauthorized', options.tokenType)
        }

        // verify token via JWT
        const session = JWT.verify(token, options.password)

        // get credentials
        const { valid, credentials, artifacts = {} } = await options.validate(token, session, h)

        if (!valid) {
          return options.unauthorized('Bad token', options.tokenType)
        }

        if (!credentials || typeof credentials !== 'object') {
          throw h.unauthenticated(
            Boom.badImplementation('Bad token string received for Bearer auth validation'),
            { credentials: {} }
          )
        }

        // authenticated
        credentials.hasRole = (...roles) => {
          if (!Array.isArray(credentials.scope) || credentials.scope.length === 0 || roles.length === 0) {
            return false
          }

          for (const role of roles) {
            if (Array.isArray(role)) {
              const hasAllRoles = role.filter(role => !credentials.scope.includes(role)).length === 0
              if (hasAllRoles) {
                return true
              }
            } else {
              if (credentials.scope.includes(role)) {
                return true
              }
            }
          }

          return false
        }

        return h.authenticated({ credentials, artifacts })
      } catch (error) {
        return options.unauthorized('Bad token', options.tokenType)
      }
    }
  }
}

module.exports.register = (server, options) => {
  const config = global.CONFIG

  server.auth.scheme('Bearer', implementation)

  /**
   * Default authentication
   */
  server.auth.strategy('jwt', 'Bearer', {
    tokenType: 'Bearer',
    password: config.get('jwt.secret'), // jwt-secret
    unauthorized: Boom.unauthorized,
    validate: async (jwtToken, session, h) => {
      const Token = require('@/model/Token')
      const token = await Token
        .findOne({
          $and: [
            { jwtToken },
            {
              $or: [
                { exp: { $exists: false } },
                { exp: { $gte: new Date() } }
              ]
            }
          ]
        })
        .populate('user')
        .lean()
      if (!token || !token.user) {
        return { valid: false }
      }

      delete token.user.password
      token.user.uid = token.user._id = String(token.user._id)
      token.user._tid = token._id

      return {
        valid: true,
        credentials: token.user,
        artifacts: {
          _id: token._id,
          jwtToken: token.jwtToken
        }
      }
    }
  })

  server.auth.default('jwt')
}

module.exports.name = 'app-authenticate'
