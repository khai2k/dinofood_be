const bcrypt = require('bcrypt')
const slugify = require('slugify')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const { schema, options } = require('./schema')
const mongooseDelete = require('mongoose-delete')
const UserSchema = new Schema(schema, options)

/**
 * plugins
 */
UserSchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
})

/**
 * statics | methods
 */
UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}
UserSchema.statics.compare = (pwdStr, password) => bcrypt.compareSync(pwdStr, password)
UserSchema.statics.hashPassword = password => bcrypt.hashSync(password, 10)
UserSchema.statics.generateHash = password => bcrypt.hashSync(password, 10)
UserSchema.statics.generateUsername = async function generateUsername (name, num = 0) {
  const slugStr = String(num ? name + ' ' + num : name)
  const username = slugify(slugStr).toLowerCase()
  const count = await this.countDocuments({ username })

  // debug performance
  if (process._isDev) {
    console.log('Generate username count: ', count)
  }

  if (!count) {
    return username
  }

  return this.generateUsername(name, num || count + 1)
}

/**
 * Get map mentions data with users email →_id
 * @param {string[]} list users email
 * @return {Promise<Object>}
 */
UserSchema.statics.mappingIdByEmail = async function mappingIdByEmail (queryParams) {
  const users = await this
    .find(queryParams)
    .select('_id email')
    .lean()

  return users.reduce(
    (result, user) => Object.assign(result, {
      [user.email]: String(user._id)
    }), {}
  )
}

/**
 * virtual type
 */

module.exports = mongoose.model('User', UserSchema)
