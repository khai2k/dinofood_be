const Boom = require('@hapi/boom')
const helpers = require('@/utils/helpers')
const mongoose = require('mongoose')
const User = require('@/model/User')
const BalanceHistory = require('@/model/BalanceHistory')

/**
 * Check authenticated balance
 * @return {Response}
 */
const checkBalance = async (request, h) => {
  try {
    const {
      page = 1,
      limit = 10,
      offset = 0,
      fromDate,
      toDate
    } = request.query

    const queryParams = {
      user: mongoose.Types.ObjectId(request.auth.credentials.uid)
    }

    if (fromDate) {
      queryParams.createdAt = {
        $gte: fromDate
      }
    }

    if (toDate) {
      queryParams.createdAt = {
        ...helpers.ensureObject(queryParams.createdAt),
        $lte: toDate
      }
    }

    const [pagination, summary] = await Promise.all([
      BalanceHistory.paginate(queryParams, {
        page,
        limit,
        offset,
        sort: '-createdAt',
        lean: true,
        populate: 'reference.value'
      }),
      BalanceHistory.aggregate([
        { $match: queryParams },
        { $group: { _id: '$type', amount: { $sum: '$amount' } } }
      ])
    ])

    return h.response({
      ...pagination,
      balance: request.auth.credentials.balance,
      summary: summary.reduce((result, { _id, amount }) => ({
        ...result,
        [_id]: amount
      }), {})
    })
  } catch (error) {
    return Boom.badRequest(error)
  }
}

const getRanking = async (request, h) => {
  try {
    const { from, to, limit } = request.query

    const conditions = {}
    if (from) {
      conditions.createdAt = { $gte: new Date(from) }
    }

    if (to) {
      Object.assign(
        helpers.ensureObject(conditions.createdAt),
        { $lte: new Date(to) }
      )
    }

    const ranking = await User.find(conditions)
      .select('-password')
      .limit(limit)
      .sort('balance')
      .lean()

    return h
      .response(ranking)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  getRanking,
  checkBalance
}
