const Boom = require('@hapi/boom')
const helpers = require('@/utils/helpers')
const { sendAdminNotify } = require('@/module/api/notify/util')
const User = require('@/model/User')
const PaymentRequest = require('@/model/PaymentRequest')

/**
 * Get payment request histories
 * @return {Response}
 */
const index = async (request, h) => {
  try {
    const {
      page = 1,
      limit = 10,
      offset = 0,
      fromDate,
      toDate
    } = request.query

    const queryParams = {
      user: request.auth.credentials.uid
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

    const pagination = await PaymentRequest.paginate(queryParams, {
      page,
      limit,
      offset,
      sort: '-createdAt',
      lean: true
    })

    return h
      .response(pagination)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Store a newly created resource in storage.
 * @return {Redirect}
 */
const store = async (request, h) => {
  try {
    const user = await User
      .findOne({ email: request.payload.email })
      .select('_id email')
      .lean()
    if (!user) {
      throw new Error(`User not found by email: ${request.payload.email}`)
    }

    const paymentRequest = await PaymentRequest.create({
      ...request.payload,
      user: user._id
    })

    const message = paymentRequest.type === 'income'
      ? `Yêu cầu nạp tiền mới từ ${user.email}`
      : `Yêu cầu rút tiền mới từ ${user.email}`

    /* Promise | asynchronous */
    sendAdminNotify(message)

    return h
      .response({ message: 'Create payment request successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * update payment request
 * @return {Response}
 */
const update = async (request, h) => {
  try {
    const paymentRequest = await PaymentRequest.findOne({
      _id: request.params._id,
      user: request.auth.credentials.uid,
      status: 'pending'
    })
    if (!paymentRequest) {
      throw new Error('Request not found.')
    }

    for (const field of Object.keys(request.payload)) {
      paymentRequest[field] = request.payload[field]
    }

    await paymentRequest.save()

    const message = paymentRequest.type === 'income'
      ? `Update - Yêu cầu nạp tiền từ ${request.auth.credentials.email}`
      : `Update - Yêu cầu rút tiền từ ${request.auth.credentials.email}`

    /* Promise | asynchronous */
    sendAdminNotify(message)

    return h
      .response({ message: 'Update payment request successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Get payment request
 * @return {Response}
 */
const show = async (request, h) => {
  try {
    const paymentRequest = await PaymentRequest
      .findOne({ _id: request.params._id })
      .populate({ path: 'user', select: 'email' })

    if (!paymentRequest) {
      throw new Error('Request not found.')
    }

    return h
      .response(paymentRequest)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * cancel payment request
 * @return {Response}
 */
const cancel = async (request, h) => {
  try {
    const paymentRequest = await PaymentRequest.findOne({
      _id: request.params._id,
      user: request.auth.credentials.uid,
      status: 'pending'
    })
    if (!paymentRequest) {
      throw new Error('Request not found.')
    }

    paymentRequest.status = 'cancelled'
    await paymentRequest.save()

    const message = paymentRequest.type === 'income'
      ? `Hủy yêu cầu nạp tiền từ ${request.auth.credentials.email}`
      : `Hủy yêu cầu rút tiền từ ${request.auth.credentials.email}`

    /* Promise | asynchronous */
    sendAdminNotify(message)

    return h
      .response({ message: 'Cancel payment request successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

const getRanking = async (request, h) => {
  try {
    const { type, from, to, limit } = request.query

    const conditions = {
      type,
      status: 'approved'
    }

    if (from) {
      conditions.createdAt = { $gte: new Date(from) }
    }

    if (to) {
      Object.assign(
        helpers.ensureObject(conditions.createdAt),
        { $lte: new Date(to) }
      )
    }

    const ranking = await PaymentRequest.aggregate([
      { $match: conditions },
      {
        $group: {
          _id: '$user',
          totalIncome: {
            $sum: '$amount'
          }
        }
      },
      { $sort: { totalIncome: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: '$user',
          totalIncome: '$totalIncome'
        }
      }
    ])
    ranking.forEach(elm => delete elm.user.password)

    return h
      .response(ranking)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  index,
  store,
  update,
  show,
  cancel,
  getRanking
}
