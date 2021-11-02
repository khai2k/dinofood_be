const { CronJob } = require('cron')
const dbBackup = require('@/utils/db-backup')
const { sendAdminNotify } = require('@/module/api/notify/util')

const task = () => {
  return dbBackup()
    .then(url => {
      sendAdminNotify([
        ':ami_ok: Database backup successfully',
        `:floppy_disk: Location: (<${url}|Open>)`
      ].join('\n'))
    })
    .catch(error => {
      sendAdminNotify([
        ':ami_ok: Database backup error',
        `:interrobang: Message: ${error.message}`,
        `:interrobang: Stack: ${error.stack}`
      ].join('\n'))
    })
}

module.exports = () => {
  // https://www.npmjs.com/package/node-cron#cron-syntax
  const cronTime = '0 0 18 * * *' // 1AM GMT+7
  const cronJob = new CronJob(cronTime, task)
  cronJob.start()
  return cronJob
}
module.exports.env = ['production']
