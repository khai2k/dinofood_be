const moment = require('moment')
const JWT = require('jsonwebtoken')
const Boom = require('@hapi/boom')
const { _COOKIE_TOKEN_KEY, _COOKIE_REDIRECT_KEY } = require('@/lib/cookie')

const User = require('@/model/User')
const Token = require('@/model/Token')

/**
 * @return view register
 */
const getRegister = (request, h) => {
  return h.view('web/auth/register')
}

/**
 * POST | User register and cache token
 * @returns {Promise<Object>}
 */
const postRegister = async (request, h) => {
  const config = global.CONFIG
  const { email, password, confirmPassword } = request.payload
  if (password !== confirmPassword) {
    return h.view('web/auth/register', {
      errors: ['Password and confirm password not match.']
    })
  }

  const duplicated = await User.countDocuments({ email })
  if (duplicated) {
    return h.view('web/auth/register', {
      errors: ['Email already exists.']
    })
  }

  try {
    const user = await User.create({
      email,
      username: await User.generateUsername(email.split('@').shift()),
      password: User.hashPassword(password)
    })

    // authenticate
    const token = new Token({ user: user._id })
    const jwtOption = config.get('jwt')
    const jwtToken = JWT.sign({
      _id: token._id,
      uid: user._id
    }, jwtOption.secret, {
      // expiresIn: jwtOption.ttl // sec || forever until call logout
    })

    token.jwtToken = jwtToken
    await token.save()

    h.state(_COOKIE_TOKEN_KEY, jwtToken)

    return h
      .redirect(request.url.origin)
      .code(301)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * @return view login
 */
const getLogin = (request, h) => {
  return h.view('web/auth/login')
}

/**
 * POST | User login and cache token
 * @returns {Promise<Object>}
 */
const postLogin = async (request, h) => {
  const config = global.CONFIG
  const { email, password, remember } = request.payload

  try {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('Invalid credentials.')
    }

    const valid = user.validPassword(password)
    if (!valid) {
      throw new Error('Invalid credentials.')
    }

    if (!user.isActive) {
      throw new Error('User in-activated.')
    }

    // authenticate
    const token = new Token({ user: user._id })
    const jwtOption = config.get('jwt')
    const jwtToken = JWT.sign({
      _id: token._id,
      uid: user._id
    }, jwtOption.secret, {
      // expiresIn: jwtOption.ttl // sec || forever until call logout
    })

    token.jwtToken = jwtToken
    if (remember) {
      token.exp = moment().add(request.server.states.cookies[_COOKIE_TOKEN_KEY].ttl, 'milliseconds')
    }

    await token.save()

    const redirectTo = request.state[_COOKIE_REDIRECT_KEY] || request.url.origin
    h.state(_COOKIE_TOKEN_KEY, jwtToken)
    h.unstate(_COOKIE_REDIRECT_KEY)

    return h
      .redirect(redirectTo)
      .code(301)
      .takeover()
  } catch (error) {
    return h.view('web/auth/login', {
      errors: [error.message]
    })
  }
}

/**
 * Clean session
 * @return redirect to home
 */
const logout = async (request, h) => {
  try {
    if (request.auth && request.auth.artifacts && request.auth.artifacts._id) {
      await Token.updateOne({ _id: request.auth.artifacts._id }, { $set: { exp: new Date() } })
    }

    h.unstate(_COOKIE_TOKEN_KEY)

    return h
      .redirect(request.url.origin)
      .code(301)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout
}
