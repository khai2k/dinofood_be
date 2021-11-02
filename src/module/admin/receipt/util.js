const helpers = require('@/utils/helpers')
const { sendMultiChannelNotify } = require('@/module/api/notify/util')
const User = require('@/model/User')
const BalanceHistory = require('@/model/BalanceHistory')

const { calculateReceiptInfo } = require('./calculator')

/**
 * Get create form requirements | Use in ADMIN CMS only
 * @return {Promise<Object>}
 */
const getCreateRequirement = async (request, h) => ({
  users: await User
    .find({ 'keywords.0': { $exists: true } })
    .select('-password -scope -balance')
    .lean()
})

/**
 * Split price/email from bill info | Use in ADMIN CMS only
 * @param {String} billInfo
 * @return {Object}
 */
const mappingEmailPrice = billInfo => {
  return String(billInfo)
    .replace(/,/gmi, '')
    .replace(/,/gmi, '')
    .replace(/đ$/gmi, '')
    .replace(/(^[a-zA-Z])/gm, '@$1')
    .split(/^@/m)
    .filter(e => !!e)
    .reduce((results, e) => {
      const email = `${e.split(/\n/).shift().trim()}@dinovative.com`
      const match = e.match(/\d+$/gm)
      results[email] = results[email] || 0

      if (match) {
        const price = match.reduce((money, v) => money + Number(v), 0)
        results[email] += price
      }

      return results
    }, {})
}

/**
 * Split bill/member
 * @param {Receipt} receipt
 * @return {Promise<Receipt>}
 */
const splitReceipt = async receipt => {
  const members = mappingEmailPrice(receipt.info)
  const mapIdMembers = await User.mappingIdByEmail({
    email: {
      $in: Object.keys(members)
    }
  })

  if (Object.keys(members).length !== Object.keys(mapIdMembers).length) {
    throw new Error('Has member not exists.')
  }

  const receiptInformation = calculateReceiptInfo({
    discount: receipt.discount,
    shippingFee: receipt.shippingFee,
    members: Object.entries(members).map(
      ([email, price]) => ({
        member: mapIdMembers[email],
        email,
        price
      })
    )
  })

  return Object.assign(receipt, receiptInformation)
}

/**
 * Update user's balance
 * - receipt amount
 * Return new balance
 * @param {User} user
 * @param {Receipt} receipt
 * @param {Number} amount
 * @param {String} infoURL
 * @return {Promise<Number>}
 */
const payToReceipt = async ({ user, receipt, amount, infoURL } = {}) => {
  const userInfo = await User.findOneAndUpdate({ _id: user._id }, { $inc: { balance: -amount } })
  const newBalance = userInfo.balance - amount
  const balanceHistory = await BalanceHistory.create({
    user: userInfo._id,
    oldBalance: userInfo.balance,
    newBalance,
    type: 'outcome',
    amount: amount,
    description: `Pay to receipt - ${receipt.title}`,
    reference: {
      model: 'Receipt',
      value: receipt._id
    }
  })

  const emailMessage = [
    balanceHistory.description,
    `Your balance change: -${helpers.vndCurrency(amount)}`,
    `Current balance: ${helpers.vndCurrency(newBalance)}`,
    `More information: ${infoURL}`
  ].join('\n')

  await sendMultiChannelNotify({
    to: userInfo,
    emailMessage
  })

  return newBalance
}

module.exports = {
  getCreateRequirement,
  payToReceipt,
  splitReceipt
}
