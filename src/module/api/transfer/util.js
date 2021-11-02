const helpers = require('@/utils/helpers')
const { sendMultiChannelNotify } = require('@/module/api/notify/util')

const config = global.CONFIG
const expireInMin = config.get('OTP.expireInMin')

/**
 * Send transfer success message via Email
 * @param {Transfer} transfer
 * @param {User} sender
 * @param {User} receiver
 * @returns {Promise<any[]>}
 */
const sendTransferSuccessMessage = ({ transfer, sender, receiver } = {}) => {
  const senderCurrentBalance = sender.balance - transfer.amount
  const receiverCurrentBalance = receiver.balance + transfer.amount

  // send OTP via email
  const senderMessage = [
    `Transfer successfully to ${receiver.email}.`,
    `Your balance change: -${helpers.vndCurrency(transfer.amount)}`,
    `Current balance: ${helpers.vndCurrency(senderCurrentBalance)}.`
  ].join('\n')
  const receiverMessage = [
    `You have received from ${sender.email}.`,
    `Your balance change: +${helpers.vndCurrency(transfer.amount)}`,
    `Current balance: ${helpers.vndCurrency(receiverCurrentBalance)}.`
  ].join('\n')

  const sendNotifyPromises = [
    sendMultiChannelNotify({
      to: sender,
      subject: 'Transfer successfully',
      message: senderMessage
    }),
    sendMultiChannelNotify({
      to: receiver,
      subject: 'Transfer successfully',
      message: receiverMessage
    })
  ]

  return Promise.all(sendNotifyPromises)
}

/**
 * Validate transfer condition before verify
 * @param {Transfer} transfer
 * @param {string} OTP
 */
const validatePreVerifyTransfer = async (transfer, OTP) => {
  if (!transfer || !transfer.user || !transfer.receiver) {
    throw new Error('Request invalid.')
  }

  if (transfer.status !== 'pending') {
    throw new Error(`Request ${transfer.status}.`)
  }

  if (transfer.OTP !== OTP) {
    transfer.status = 'failed'
    await transfer.save()
    throw new Error('OTP invalid, please create try again.')
  }

  const diffInSecs = Math.abs(
    helpers.diffDate(
      transfer.createdAt,
      new Date(),
      's'
    )
  )
  if (diffInSecs > expireInMin * 60) {
    transfer.status = 'expired'
    await transfer.save()
    throw new Error('Request expired.')
  }

  const { user } = transfer
  if (user.balance < transfer.amount) {
    throw new Error('Your balance insufficient.')
  }

  return transfer
}

module.exports = {
  validatePreVerifyTransfer,
  sendTransferSuccessMessage
}
