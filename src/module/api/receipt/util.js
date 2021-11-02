const helpers = require('@/utils/helpers')
const { sendMultiChannelNotify } = require('@/module/api/notify/util')

/**
 * Send confirmed receipt notify to receipt's members
 * @param {Receipt} receipt
 */
const sendConfirmNotifyToMembers = receipt => {
  const config = global.CONFIG
  const receiptsURL = `https://${config.get('dns')}/receipts`

  const promises = []
  for (const { member, amount } of receipt.members) {
    const emailMessage = [
      `You have a new receipt need payment: "${receipt.title}"`,
      `Amount: ${helpers.vndCurrency(amount)}`,
      `More information: ${receiptsURL}`
    ].join('\n')

    promises.push(
      sendMultiChannelNotify({
        to: member,
        subject: 'New receipt',
        emailMessage
      })
    )
  }

  return Promise.all(promises)
}

/**
 * Send paid receipt notify to receipt's member
 * @param {Receipt} receipt
 * @param {User} user
 */
const sendPaidNotifyToMember = (receipt, user) => {
  const config = global.CONFIG
  const receiptsURL = `https://${config.get('dns')}/receipts`
  const emailMessage = [
    `Paid to receipt successfully: "${receipt.title}"`,
    `More information: ${receiptsURL}`
  ].join('\n')

  return sendMultiChannelNotify({
    to: user,
    subject: 'Paid to receipt successfully',
    emailMessage
  })
}

/**
 * Send transfer success message via Email
 * @param {Transfer} transfer
 * @param {User} sender
 * @param {User} receiver
 * @returns {Promise<any[]>}
 */
const sendPayToReceiptNotify = ({ receipt, transfer, sender, receiver } = {}) => {
  const senderCurrentBalance = sender.balance - transfer.amount
  const receiverCurrentBalance = receiver.balance + transfer.amount

  // send OTP via email
  const senderMessage = [
    `Transfer successfully to ${receiver.email}.`,
    `Reference receipt: ${receipt.title}.`,
    `Your balance change: -${helpers.vndCurrency(transfer.amount)}`,
    `Current balance: ${helpers.vndCurrency(senderCurrentBalance)}.`
  ].join('\n')
  const receiverMessage = [
    `You have received from ${sender.email}.`,
    `Reference receipt: ${receipt.title}.`,
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

module.exports = {
  sendConfirmNotifyToMembers,
  sendPaidNotifyToMember,
  sendPayToReceiptNotify
}
