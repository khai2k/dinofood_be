const constants = require('@/constants')
const { sendAdminNotify } = require('@/module/api/notify/util')
const User = require('@/model/User')
const PaymentRequest = require('@/model/PaymentRequest')

/**
 * Show the form for creating a new resource.
 * @return {View}
 */
const create = async (request, h) => {
  return h
    .view('web/payment-request/create', {
      paymentMethods: constants.PAYMENT.METHODS
    })
    .takeover()
}

/**
 * Store a newly created resource in storage.
 * @return {Response}
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
      .view('web/payment-request/create', {
        messages: ['Create payment request successfully!']
      })
      .takeover()
  } catch (error) {
    return h
      .view('web/payment-request/create', {
        errors: [error.message]
      })
      .takeover()
  }
}

module.exports = {
  create,
  store
}
