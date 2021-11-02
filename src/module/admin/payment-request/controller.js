const Boom = require('@hapi/boom')
const PaymentRequest = require('@/model/PaymentRequest')

const Util = require('./util')

/**
 * Display a listing of the resource.
 * @return {View}
 */
const index = async (request, h) => {
  const {
    page = 1,
    sortBy = '-createdAt',
    limit = 10,
    offset = 0,
    ...queryParams
  } = request.query

  const pagination = await PaymentRequest.paginate(queryParams, {
    page,
    limit,
    offset,
    sort: sortBy,
    lean: true,
    populate: {
      path: 'user',
      select: 'name email'
    }
  })

  return h
    .view('admin/payment-request/index', pagination)
    .takeover()
}

/**
 * Update the specified resource in storage.
 * Condition: status === 'pending'
 * @return {Response}
 */
const update = async (request, h) => {
  try {
    const paymentRequest = await PaymentRequest.findOne({
      _id: request.params._id,
      status: 'pending'
    })
    if (!paymentRequest) {
      return Boom.notFound('Request not found.')
    }

    paymentRequest.status = request.payload.status
    if (request.payload.status === 'approved') {
      // update user balance
      switch (paymentRequest.type) {
        case 'income':
          await Util.topUpBalance(paymentRequest)
          break
        case 'outcome':
          await Util.withDrawBalance(paymentRequest)
          break
      }
    } else {
      await Util.sendRejectNotify(paymentRequest)
    }

    await paymentRequest.save()

    const action = request.payload.status === 'approved'
      ? 'Approve'
      : 'Reject'

    return h
      .response({ message: `${action} request successfully!` })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Remove the specified resource from storage.
 * Condition: status in [ 'rejected', 'cancelled' ]
 * @return {Response}
 */
const destroy = async (request, h) => {
  try {
    const { deletedCount } = await PaymentRequest.deleteOne({
      _id: request.params._id,
      status: { $in: ['rejected', 'cancelled'] }
    })
    if (!deletedCount) {
      return Boom.notFound('Request not found.')
    }

    return h
      .response({ message: 'Delete request successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  index,
  update,
  destroy
}
