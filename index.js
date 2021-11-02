const path = require('path')

require('module-alias').addAliases({
  _root: __dirname,
  '@': path.join(__dirname, '/src')
})

// init config first
process.env.NODE_CONFIG_DIR = path.join(__dirname, '/src/config')
global.BASE_PATH = __dirname
global.PUBLIC_DIR = path.join(__dirname, '/public')
global.CONFIG = require('config')
const logger = global.LOGGER = require('./logger')

const init = async () => {
  const config = global.CONFIG

  const Hapi = require('@hapi/hapi')
  const server = global.SERVER = Hapi.server(config.get('connection'))

  await require('./src/bootstrap')(server)

  await server.start()

  console.log('Server running on %s', server.info.uri)
  for (const scheme of global.CONFIG.get('swagger.schemes')) {
    console.log('Documentation: %s://%s/documentation', scheme, global.CONFIG.get('swagger.host'))
  }
}

/**
 * Process handler
 */
process._isDev = process.env.NODE_ENV === 'development'
process._notProd = val => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  return val
}

process.on('uncaughtException', (error, origin) => {
  logger.info(error)
  logger.info(origin)

  console.log(error)
  console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.info(reason)
  logger.info(promise)

  console.log(reason)
  console.log(promise)

  // process.exit(1)
})

init()
