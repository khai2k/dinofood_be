const fs = require('fs')
const path = require('path')

/**
 * Auto load all tasks in ./tasks directory
 */
module.exports = () => fs
  .readdirSync(__dirname)
  .filter(dir => dir.match(/.js$/) && dir !== 'index.js')
  .forEach(taskName => {
    console.log(`Load task: ${taskName}`)
    // exec cron-task on main instance only
    const task = require(path.join(__dirname, taskName))
    const env = task.env || ['development', 'staging', 'production'] // default run on all env

    // exec task on main instance and allow env only
    if (env.includes(process.env.NODE_ENV)) {
      task()
    }
  })
