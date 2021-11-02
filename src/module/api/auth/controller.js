const JWT = require('jsonwebtoken')
const Boom = require('@hapi/boom')
const moment = require('moment')
const crypto = require('crypto')
const Mailer = require('@/lib/mailer')
const { _COOKIE_TOKEN_KEY } = require('@/lib/cookie')

const User = require('@/model/User')
const Token = require('@/model/Token')

/**
 * Get authorized profile
 * @return {Response<User>}
 */
const profile = async (request, h) => {
  try {
    return h
      .response(request.auth.credentials)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * POST | User register and cache token
 * @returns {Promise<Object>}
 */
const register = async (request, h) => {
  try {
    const { email, password, passwordConfirm } = request.payload
    if (password !== passwordConfirm) {
      return Boom.badRequest('Password and confirm password not match.')
    }

    const duplicated = await User.countDocuments({ email })
    if (duplicated) {
      return Boom.badRequest('Email already exists.')
    }

    const hashPassword = User.hashPassword(password)
    await User.create({
      email,
      username: await User.generateUsername(email.split('@').shift()),
      password: hashPassword
    })

    return h
      .response({ message: 'Register successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * POST | User login and cache token
 * @returns {Promise<Object>}
 */
const login = async (request, h) => {
  try {
    const config = global.CONFIG
    const { email, password, remember } = request.payload

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

    h.state(_COOKIE_TOKEN_KEY, jwtToken)

    delete user.password

    return h
      .response({
        user,
        jwtToken,
        success: true,
        statusCode: 200,
        accessToken: {
          token: jwtToken
        }
      })
      .header('authorization', `Bearer ${jwtToken}`)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Get | User logout, clear token | cache | expire token
 * @returns {Promise<Boolean>}
 */
const logout = async (request, h) => {
  try {
    if (request.auth && request.auth.artifacts && request.auth.artifacts._id) {
      await Token.updateOne({ _id: request.auth.artifacts._id }, { $set: { exp: new Date() } })
    }

    h.unstate(_COOKIE_TOKEN_KEY)

    return h
      .response({ message: 'Logout successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Verify email, send reset password token
 * @return {Response}
 */
const forgetPassword = async (request, h) => {
  try {
    const { email } = request.payload
    const user = await User
      .findOne({ email })
      .select('_id email')
      .lean()

    if (!user) {
      throw new Error('We can\'t find a user with that e-mail address.')
    }

    const resetToken = crypto
      .randomBytes(16)
      .toString('hex')
      .trim()

    await Token.create({
      user: user._id,
      email: user.email,
      jwtToken: resetToken,
      type: 'reset',
      exp: moment().add(10, 'minutes') // exp after 10 mins
    })

    await new Mailer().send({
      to: user.email,
      subject: 'Reset password',
      text: `Your reset token: ${resetToken}`
    })

    return h
      .response({ message: `An email has been sent to ${email} with reset token.` })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Verify token, reset user password
 * @return {Response}
 */
const resetPassword = async (request, h) => {
  try {
    const { password, passwordConfirm } = request.payload
    if (password !== passwordConfirm) {
      throw new Error('Passwords must match the confirmation.')
    }

    const token = await Token
      .findOne({
        jwtToken: request.payload.token,
        user: { $exists: true },
        exp: {
          $exists: true,
          $gte: new Date()
        }
      })
      .populate('user')

    if (!token) {
      throw new Error('This password reset token is invalid.')
    }

    const user = token.user
    user.password = User.hashPassword(password)

    // expire token
    token.exp = new Date()

    await Promise.all([
      user.save(),
      token.save()
    ])

    return h
      .response({ message: 'Your password has been reset!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  profile,
  register,
  login,
  logout,
  forgetPassword,
  resetPassword
}
