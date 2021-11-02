const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const mongooseSlug = require('@/lib/mongoose-slug')
const mongooseDelete = require('mongoose-delete')
const { schema, options } = require('./schema')

const StoreSchema = new Schema(schema, options)

/**
 * Index
 */
StoreSchema.index({ location: '2dsphere' })

/**
 * Plugins
 */
StoreSchema.plugin(mongooseSlug)
StoreSchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
})

/**
 * Virtual type
 */
StoreSchema.virtual('dishes', {
  ref: 'Dish', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'store' // is equal to `foreignField`
})

module.exports = mongoose.model('Store', StoreSchema)
