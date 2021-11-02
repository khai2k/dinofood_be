const Boom = require('@hapi/boom')
const helpers = require('@/utils/helpers')
const User = require('@/model/User')

/**
 * Update user match keywords
 * @return {Response}
 */
const updateKeyword = async (request, h) => {
  const { payload } = request
  const user = await User.findOne({ email: payload.email })

  if (!user) {
    return Boom.notFound('User not found.')
  }

  user.keywords = Array.from(new Set([
    ...helpers.ensureArray(user.keywords),
    ...payload.keywords
  ]))

  await user.save()

  return h
    .response(user.keywords)
    .takeover()
}

/**
 * Update user match keywords
 * @return {Response}
 */
const updatePassword = async (request, h) => {
  const { currentPassword, password, passwordConfirm } = request.payload
  if (password !== passwordConfirm) {
    return Boom.badRequest('Password and confirm password not match.')
  }

  const user = await User.findOne({ _id: request.auth.credentials.uid })

  if (!user) {
    return Boom.notFound('User not found.')
  }

  if (!user.isActive) {
    throw new Error('User in-activated.')
  }

  const valid = user.validPassword(currentPassword)
  if (!valid) {
    throw new Error('Current password invalid.')
  }

  user.password = User.hashPassword(password)

  await user.save()

  return h
    .response({ message: 'Change password successfully!' })
    .takeover()
}

module.exports = {
  updateKeyword,
  updatePassword
}
