const mongoose = require('mongoose')
const { schema, options } = require('./schema')
const { Schema } = mongoose

const DishSchema = new Schema(schema, options)

module.exports = mongoose.model('Dish', DishSchema)
