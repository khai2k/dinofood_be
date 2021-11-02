const mongoose = require('mongoose')
const mongoosePaginate = require('./mongoose-paginate')

module.exports.register = async function (server, options) {
  mongoose.set('useCreateIndex', true)
  mongoose.set('useUnifiedTopology', true)

  // 'useFindAndModify': true by default.
  // Set to false to make findOneAndUpdate() and findOneAndRemove() use native findOneAndUpdate() rather than findAndModify().
  mongoose.set('useFindAndModify', false)

  mongoose.plugin(mongoosePaginate)

  mongoose.connection.on('connecting', () => {
    console.info('Connecting to MongoDB...')
  })

  mongoose.connection.on('connected', () => {
    console.info('MongoDB connected.')
  })

  mongoose.connection.on('reconnected', () => {
    console.info('MongoDB reconnected!')
  })

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB connection error: ${error}`)
    mongoose.disconnect()
  })

  mongoose.connection.on('disconnected', () => {
    console.error(`MongoDB disconnected! Reconnecting in ${5000 / 1000}s...`)
    setTimeout(connect, 5000)
  })

  function connect () {
    mongoose.connect(global.CONFIG.get('db.uri'), {
      useNewUrlParser: true
    })
  }

  connect()
}

module.exports.name = 'app-mongo'
