const Receipt = require('@/model/Receipt')

/**
 * Version 1.0.1 | Receipt
 * add paid/member, add paid flag
 * job:
 * - update for confirmed receipt -> paid = true, paid/member = true
 */
module.exports = () => {
  const queryParams = {
    confirmed: true,
    paid: { $ne: true },
    'members.member': { $exists: true }
  }
  const updateParams = {
    $set: {
      paid: true,
      'members.$.paid': true
    }
  }
  return Receipt.updateMany(queryParams, updateParams)
}
