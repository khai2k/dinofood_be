const glob = require('glob')
const path = require('path')

module.exports = glob
  .sync(path.join(__dirname, '/[!index]*.js'), {})
  .reduce(
    (constants, item) => {
      const modName = path.basename(item).split('.').shift()
      return {
        ...constants,
        [modName]: require(path.resolve(item)),
        [modName.toUpperCase()]: require(path.resolve(item))
      }
    }, {}
  )
