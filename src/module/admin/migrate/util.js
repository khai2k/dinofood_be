const fs = require('fs')
const path = require('path')
const versionsRunner = require('./versions')

const getLastMigration = () => {
  return versionsRunner.getLastMigration()
}

const migrate = (version) => {
  if (!version) {
    throw new Error('Version not allow empty!')
  }

  const executeFunc = path.join(__dirname, 'versions', `${version}.js`)
  if (!fs.existsSync(executeFunc)) {
    throw new Error(`Migration not exists for version ${version}!`)
  }

  return versionsRunner(version)
}

module.exports = {
  migrate,
  getLastMigration
}
