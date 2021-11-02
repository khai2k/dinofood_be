const mongoose = require('mongoose')
const { schema, options } = require('./schema')
const { Schema } = mongoose

const DishTypeSchema = new Schema(schema, options)

/**
 * Virtual type
 */
DishTypeSchema.virtual('dishes', {
  ref: 'Dish', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'type' // is equal to `foreignField`
})

module.exports = mongoose.model('DishType', DishTypeSchema)
