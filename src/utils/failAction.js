/**
 * @return view with error messages
 */
module.exports = (view, requirements) => async (request, h, error) => {
  const context = {}
  context.route = request.route
  context.timestamp = new Date().getTime()
  context.query = request.query || {}
  context.params = request.params || {}
  context.payload = request.payload || {}
  context.errors = error.details.map(({ message }) => message)
  context.old = function (key, defaultVal = '') {
    return context.payload[key] ||
      context.query[key] ||
      context.params[key] ||
      defaultVal
  }

  if (typeof requirements === 'function') {
    const requiredContext = await requirements(request, h)
    const keys = Object.keys(requiredContext)
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]
      context[key] = requiredContext[key]
    }
  }

  return h
    .view(view, context)
    .takeover()
}
