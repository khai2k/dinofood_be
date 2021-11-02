/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const mongooseSlug = require('@/lib/mongoose-slug')
const mongooseDelete = require('mongoose-delete')
const { schema, options, statuses } = require('./schema')

/**
 * Schemas
 */
const MigrationSchema = new Schema(schema, options)

/**
 * Plugins
 */
MigrationSchema.plugin(mongooseSlug)
MigrationSchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true
})

MigrationSchema.statics.__STATUS = {}
for (const [_key, _value] of Object.entries(statuses)) {
  MigrationSchema.statics.__STATUS[_key] = _value
}

/**
 * Virtual type
 */

module.exports = mongoose.model('Migration', MigrationSchema)
