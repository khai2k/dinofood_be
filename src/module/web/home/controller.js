const User = require('@/model/User')
const BalanceHistory = require('@/model/BalanceHistory')

/**
 * Check balance by email
 * @return {Response}
 */
const checkBalance = async (request, h) => {
  try {
    const {
      page = 1,
      limit = 10,
      offset = 0
    } = request.query

    let email = ''
    if (request.query.email) {
      email = request.query.email
    } else if (request.auth && request.auth.credentials && request.auth.credentials.email) {
      email = request.auth.credentials.email
    }

    if (!email) {
      return h.view('web/home/check-balance', {
        balance: 0,
        histories: []
      })
    }

    const user = await User.findOne({ email }).lean()
    if (!user) {
      throw new Error('User not found.')
    }

    const pagination = await BalanceHistory.paginate({ user: user._id }, {
      page,
      limit,
      offset,
      sort: '-createdAt',
      lean: true,
      populate: 'reference.value'
    })

    return h.view('web/home/check-balance', {
      balance: user.balance,
      ...pagination,
      histories: pagination.docs
    })
  } catch (error) {
    return h.view('web/home/check-balance', {
      balance: 0,
      histories: [],
      errors: [error.message]
    })
  }
}

module.exports = {
  checkBalance
}
