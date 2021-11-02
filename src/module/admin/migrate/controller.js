const Boom = require('@hapi/boom')
const { getLastMigration, migrate } = require('./util')

const show = async (request, h) => {
  try {
    const lastMigration = await getLastMigration()
    return h
      .response(lastMigration)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

const update = async (request, h) => {
  try {
    // asynchronous
    migrate(request.payload.version)

    return h
      .response({ message: `Migrating version: ${request.payload.version}` })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  show,
  update
}
