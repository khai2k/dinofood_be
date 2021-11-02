const _COOKIE_TOKEN_KEY = 'jwt-token'
const _COOKIE_REDIRECT_KEY = 'redirectTo'

module.exports = {
  _COOKIE_TOKEN_KEY,
  _COOKIE_REDIRECT_KEY,

  name: 'app-cookie',
  register: async server => {
    server.state(_COOKIE_TOKEN_KEY, {
      ttl: 365 * 24 * 60 * 60 * 1000, // expires a year from now in milliseconds
      encoding: 'none', // we already used JWT to encode
      isSecure: process.env.NODE_ENV === 'production', // warm & fuzzy feelings
      isHttpOnly: true, // prevent client alteration
      clearInvalid: false, // remove invalid cookies
      strictHeader: true, // don't allow violations of RFC 6265
      path: '/' // set the cookie for all routes
    })
    server.state(_COOKIE_REDIRECT_KEY, {
      ttl: 5 * 60 * 1000, // expires 5 minutes from now in milliseconds
      encoding: 'none', // we already used JWT to encode
      isSecure: process.env.NODE_ENV === 'production', // warm & fuzzy feelings
      isHttpOnly: true, // prevent client alteration
      clearInvalid: false, // remove invalid cookies
      strictHeader: true, // don't allow violations of RFC 6265
      path: '/' // set the cookie for all routes
    })
  }
}
