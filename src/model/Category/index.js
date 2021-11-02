/**
* Module dependencies.
*/
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const mongooseSlug = require('@/lib/mongoose-slug')
const mongooseDelete = require('mongoose-delete')
const { schema, options } = require('./schema')

/**
* Schemas
*/
const CategorySchema = new Schema(schema, options)

/**
* Plugins
*/
CategorySchema.plugin(mongooseSlug)
CategorySchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true
})

/**
 * Virtual type
 */
CategorySchema.virtual('childrens', {
  ref: 'Category', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'parent' // is equal to `foreignField`
})
CategorySchema.virtual('countChildrens', {
  ref: 'Category', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'parent', // is equal to `foreignField`
  count: true // And only get the number of docs
})

module.exports = mongoose.model('Category', CategorySchema)
