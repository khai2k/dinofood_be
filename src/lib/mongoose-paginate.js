/**
 * @custom git-repo: https://github.com/edwardhotchkiss/mongoose-paginate
 * @package mongoose-paginate
 * @param {Object} [query={}]
 * @param {Object} [options={}]
 * @param {Object|String} [options.select]
 * @param {Object|String} [options.sort]
 * @param {Array|Object|String} [options.populate]
 * @param {Boolean} [options.lean=false]
 * @param {Boolean} [options.leanWithId=true]
 * @param {Number} [options.offset=0] - Use offset or page to set skip position
 * @param {Number} [options.page=1]
 * @param {Number} [options.limit=10]
 * @param {Function} [callback]
 * @returns {Promise}
 */
async function paginate (query, options, callback) {
  try {
    query = query || {}
    options = Object.assign({}, paginate.options, options)
    const sort = options.sort
    const lean = options.lean || false
    const limit = options.limit || 10
    const offset = options.offset || 0
    const select = options.select
    const populate = options.populate || ''
    const page = options.page || 1
    const skip = (page - 1) * limit + offset

    const [docs, count] = await Promise.all([
      this
        .find(query)
        .populate(populate)
        .select(select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(lean),
      this.countDocuments(query)
    ])

    const result = {
      docs: docs || [],
      total: count || 0,
      pages: Math.ceil(count / limit) || 1,
      page,
      limit,
      offset
    }

    if (typeof callback === 'function') {
      callback(null, result)
    }

    return result
  } catch (error) {
    if (typeof callback === 'function') {
      callback(error)
    }

    throw error
  }
}

/**
 * @param {Schema} schema
 */
module.exports = function (schema) {
  schema.statics.paginate = paginate
}

module.exports.paginate = paginate
