const Joi = require('@hapi/joi')

module.exports = {
  test: {
    params: Joi.object({
      view: Joi.string().valid('firebase').required().description('view name')
    })
  }
}
