const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const { schema, options } = require('./schema')

const ReceiptSchema = new Schema(schema, options)

module.exports = mongoose.model('Receipt', ReceiptSchema)
