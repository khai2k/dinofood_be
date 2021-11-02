/**
* Module dependencies.
*/
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const { schema, options } = require('./schema')

/**
* Schemas
*/
const PaymentRequestSchema = new Schema(schema, options)

/**
 * Plugins
 */

/**
 * statics methods
 */

module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema)
