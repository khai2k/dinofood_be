const Boom = require('@hapi/boom')

const unAuthorized = (request, h) => {
  if (request.auth && request.auth.credentials) {
    return Boom.methodNotAllowed('You already logged in!')
  }

  return true
}

module.exports = {
  unAuthorized
}
