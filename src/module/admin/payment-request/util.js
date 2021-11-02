const helpers = require('@/utils/helpers')
const { sendMultiChannelNotify } = require('@/module/api/notify/util')
const User = require('@/model/User')
const BalanceHistory = require('@/model/BalanceHistory')

/**
 * Add money to user's balance
 * Create balance history
 * Return new balance value
 * @param {PaymentRequest} paymentRequest
 * @return {Promise<Number>}
 */
const topUpBalance = async (paymentRequest) => {
  const user = await User.findOneAndUpdate(
    { _id: paymentRequest.user },
    { $inc: { balance: paymentRequest.amount } }
  )
  if (!user) {
    throw new Error('User not found.')
  }

  const newBalance = user.balance + paymentRequest.amount
  const { description } = await BalanceHistory.create({
    user: user._id,
    oldBalance: user.balance,
    newBalance,
    type: 'income',
    amount: paymentRequest.amount,
    description: `Top up via ${helpers.pascalCase(paymentRequest.paymentMethod)}`,
    reference: {
      model: 'PaymentRequest',
      value: paymentRequest._id
    }
  })

  // asynchronous
  const message = [
    `${description} successfully`,
    `Your balance change: +${helpers.vndCurrency(paymentRequest.amount)}`,
    `Current balance: ${helpers.vndCurrency(newBalance)}`
  ].join('\n')
  await sendMultiChannelNotify({
    to: user,
    message
  })

  return newBalance
}

/**
 * Withdraw money from user's balance
 * Create balance history
 * Return new balance value
 * @param {PaymentRequest} paymentRequest
 * @return {Promise<Number>}
 */
const withDrawBalance = async (paymentRequest) => {
  const user = await User.findOneAndUpdate(
    { _id: paymentRequest.user },
    { $inc: { balance: -paymentRequest.amount } }
  )
  if (!user) {
    throw new Error('User not found.')
  }

  const newBalance = user.balance - paymentRequest.amount
  const { description } = await BalanceHistory.create({
    user: user._id,
    oldBalance: user.balance,
    newBalance,
    type: 'outcome',
    amount: paymentRequest.amount,
    description: `Withdraw to ${helpers.pascalCase(paymentRequest.paymentMethod)}`,
    reference: {
      model: 'PaymentRequest',
      value: paymentRequest._id
    }
  })

  user.balance = newBalance
  await user.save()

  // asynchronous
  const message = [
    `${description} successfully`,
    `Your balance change: -${helpers.vndCurrency(paymentRequest.amount)}`,
    `Current balance: ${helpers.vndCurrency(newBalance)}`
  ].join('\n')
  await sendMultiChannelNotify({
    to: user,
    message
  })

  return newBalance
}

/**
 * Send reject payment request message
 * @param {PaymentRequest} paymentRequest
 * @return {Promise<Void>}
 */
const sendRejectNotify = async (paymentRequest) => {
  const user = await User
    .findOne({ _id: paymentRequest.user })
    .select('_id email')
    .lean()
  if (!user) {
    throw new Error('User not found.')
  }

  // asynchronous
  const type = paymentRequest.type === 'income'
    ? 'top up'
    : 'withdraw'
  const via = helpers.pascalCase(paymentRequest.paymentMethod)
  const message = `Your ${type} request via ${via} had been rejected.`
  await sendMultiChannelNotify({
    to: user,
    message
  })
}

module.exports = {
  topUpBalance,
  withDrawBalance,
  sendRejectNotify
}
