const Migration = require('@/model/Migration')

const getLastMigration = async (query) => {
  const [lastMigration] = await Migration
    .find(query)
    .sort({ updatedAt: -1 })
    .limit(1)
  return lastMigration
}

const checkMigrationVersion = async version => {
  const migration = await getLastMigration({ version })
  if (!migration) {
    return {
      canRunMigrate: true,
      migration
    }
  }
  switch (migration.status) {
    case Migration.__STATUS.FAILED:
      return {
        canRunMigrate: true,
        migration
      }
    case Migration.__STATUS.SUCCESS:
    case Migration.__STATUS.IN_PROCESSING:
      return {
        canRunMigrate: false,
        migration
      }
  }
}

const versionsRunner = async (version) => {
  const { canRunMigrate, migration } = await checkMigrationVersion(version)
  if (!canRunMigrate) {
    return false
  }

  if (migration) {
    await Migration.updateOne({ version }, {
      $set: {
        status: Migration.__STATUS.IN_PROCESSING
      }
    })
  } else {
    await Migration.create({ version })
  }

  // execute migrate
  const versionExec = require(`./${version}`)

  const result = await versionExec()
    .then(data => ({
      ...data,
      status: Migration.__STATUS.SUCCESS
    }))
    .catch(error => ({
      stack: error.stack,
      message: error.message,
      status: Migration.__STATUS.FAILED
    }))

  await Migration.updateOne({ version }, {
    $set: {
      status: result.status,
      result
    }
  })
}

versionsRunner.getLastMigration = getLastMigration
module.exports = versionsRunner
