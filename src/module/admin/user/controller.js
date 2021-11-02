const Boom = require('@hapi/boom')
const helpers = require('@/utils/helpers')
const { sendMultiChannelNotify } = require('@/module/api/notify/util')

const User = require('@/model/User')
const BalanceHistory = require('@/model/BalanceHistory')

const Util = require('./util')

/**
 * Display a listing of the resource.
 * @return {View}
 */
const index = async (request, h) => {
  const {
    page = 1,
    phone = '',
    name = '',
    sortBy = '-createdAt',
    limit = 10,
    offset = 0,
    ...queryParams
  } = request.query

  if (name) {
    queryParams.name = helpers.makeCleanRegex(name, 'i')
  }

  if (phone) {
    queryParams.phone = helpers.makeCleanRegex(phone, 'i')
  }

  const pagination = await User.paginate(queryParams, {
    page,
    limit,
    offset,
    sort: sortBy,
    lean: true
  })

  return h
    .view('admin/user/index', pagination)
    .takeover()
}

/**
 * Show the form for creating a new resource.
 * @return {View}
 */
const create = async (request, h) => {
  return h
    .view('admin/user/create')
    .takeover()
}

/**
 * Store a newly created resource in storage.
 * @return {Response}
 */
const store = async (request, h) => {
  return h
    .response('admin/user/store')
    .takeover()
}

/**
 * Show the form for editing the specified resource.
 * @return {View}
 */
const edit = async (request, h) => {
  try {
    const requirements = await Util.getEditRequirement(request, h)
    return h
      .view('admin/user/edit', requirements)
      .takeover()
  } catch (error) {
    if (Number(error.message)) {
      return h
        .view(`errors/${error.message}`)
        .takeover()
    }

    throw error
  }
}

/**
 * Update the specified resource in storage.
 * @return {View}
 */
const update = async (request, h) => {
  try {
    const { user } = await Util.getEditRequirement(request, h)
    const { payload } = request

    user.name = payload.name
    user.isActive = payload.isActive

    if (user.balance !== payload.balance) {
      await BalanceHistory.create({
        user: user._id,
        oldBalance: user.balance,
        newBalance: payload.balance,
        type: user.balance < payload.balance
          ? 'income'
          : 'outcome',
        amount: Math.abs(user.balance - payload.balance),
        description: 'Change by admin',
        author: request.auth.credentials.uid
      })
    }

    user.balance = payload.balance

    await user.save()

    return h
      .view('admin/user/edit', {
        user,
        messages: ['Update user information successfully.']
      })
      .takeover()
  } catch (error) {
    if (Number(error.message)) {
      return h
        .view(`errors/${error.message}`)
        .takeover()
    }

    throw error
  }
}

/**
 * Remove the specified resource from storage.
 * @return {Response}
 */
const destroy = async (request, h) => {
  return h
    .response('admin/user/destroy')
    .takeover()
}

/**
 * Send require payment notification to User
 * @return {Response}
 */
const sendRequirePaymentNotification = async (request, h) => {
  try {
    const config = global.CONFIG

    const users = await User
      .find({
        email: { $exists: true },
        balance: { $lt: 0 }
      })
      .select('_id email balance')
      .lean()

    for (const user of users) {
      const infoURL = `https://${config.get('dns')}/balance`
      const requestURL = `https://${config.get('dns')}/payment-requests/create?email=${user.email}&amount=${Math.abs(user.balance)}&type=income`
      const message = [
        'Require payment request',
        `Your balance: ${helpers.vndCurrency(user.balance)} :ami_cry:`,
        `More information: <${infoURL}|Here> :information_source:`,
        `Submit your payment request: <${requestURL}|Here> :ami_bully:`
      ].join('\n')
      const emailMessage = [
        'Require payment request',
        `Your balance: ${helpers.vndCurrency(user.balance)}`,
        `More information: ${infoURL}`,
        `Submit your payment request: ${requestURL}`
      ].join('\n')

      await sendMultiChannelNotify({
        to: user,
        message,
        emailMessage
      })
    }

    return h
      .response({ message: 'Send require payment notification successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  index,
  create,
  store,
  edit,
  update,
  destroy,
  sendRequirePaymentNotification
}
