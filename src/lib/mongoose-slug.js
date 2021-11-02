const slugify = require('slugify')

async function generateSlug (name, num = 0) {
  const slugStr = String(num ? name + ' ' + num : name)
  const slug = slugify(slugStr).toLowerCase()
  let count = await this.countDocuments({ slug: new RegExp(slug) })

  // debug performance
  if (process._isDev) {
    console.log('Generate slug count: ', count)
  }

  if (!count) {
    return slug
  }
  return this.generateSlug(name, num || ++count)
}

/**
 * @param {Schema} schema
 */
module.exports = function (schema, options) {
  schema.statics.generateSlug = generateSlug
}

module.exports.generateSlug = generateSlug
