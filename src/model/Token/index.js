/**
* Module dependencies.
*/
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const { schema, options } = require('./schema')
const mongooseDelete = require('mongoose-delete')

/**
* Schemas
*/
const TokenSchema = new Schema(schema, options)

/**
 * Plugins
 */
TokenSchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
})

/**
 * statics methods
 */
TokenSchema.statics.expires = async function (query) {
  return this.updateMany(query, { exp: new Date() }).exec()
}

module.exports = mongoose.model('Token', TokenSchema)
