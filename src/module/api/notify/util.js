const Mailer = require('@/lib/mailer')
const User = require('@/model/User')

const sendMultiChannelNotify = ({ to, message, slackMessage, emailMessage, subject }) => {
  const slack = global.SLACK

  const sendNotifyPromises = []

  // send slack notify
  if (to.slack) {
    sendNotifyPromises.push(
      slack.sendMessage(
        to.slack,
        slackMessage || message
      )
    )
  }

  // send email notify
  if (to.email) {
    sendNotifyPromises.push(
      new Mailer().send({
        to: to.email,
        subject: subject || 'Notify',
        text: emailMessage || message
      })
    )
  }

  return Promise.all(sendNotifyPromises)
}

/**
 * Send notify via API
 * @param {String} message
 * @return {Promise}
 */
const sendAdminNotify = async message => {
  const users = await User
    .find({ scope: 'admin' })
    .select('_id email')
    .lean()

  for (const user of users) {
    await sendMultiChannelNotify({
      to: user,
      subject: 'Notify to ADMIN',
      message
    })
  }
}

module.exports = {
  sendMultiChannelNotify,
  sendAdminNotify
}
