const nodemailer = require('nodemailer')

module.exports = (() => {
  function Mailer (config = {}) {
    const options = global.CONFIG.get('mailer.options')

    this.config = Object.assign(options, config)

    this.enable = global.CONFIG.get('mailer.enable') || false
    this.defaults = global.CONFIG.get('mailer.defaults')
    this.transporter = nodemailer.createTransport(this.config)

    return this
  }

  /**
   * Send email message action
   * Document: https://nodemailer.com/message
   * @param {Object} message
   * @return {Promise}
   */
  Mailer.prototype.send = function send (message = {}) {
    if (!this.enable) {
      return { message: 'Mailer is disabled.' }
    }

    // const listAllowDev = [
    //   'danh.le@dinovative.com',
    //   'danh.danh20051995@gmail.com'
    // ]
    // if (process._isDev && !listAllowDev.includes(message.to)) {
    //   console.log('============================ Send email ============================')
    //   console.log(message)
    //   return { message: 'Receiver not allowed.' }
    // }

    return this.transporter.sendMail({
      ...this.defaults,
      ...message
    })
  }

  return Mailer
})()
