const moment = require('moment')
const Boom = require('@hapi/boom')

// const User = require('@/model/User')
const Receipt = require('@/model/Receipt')

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

  const pagination = await Receipt.paginate(queryParams, {
    page,
    limit,
    offset,
    sort: sortBy,
    lean: true,
    populate: {
      path: 'members.member',
      select: '_id email username'
    }
  })

  return h
    .view('admin/receipt/index', pagination)
    .takeover()
}

/**
 * Show the form for creating a new resource.
 * @return {View}
 */
const create = async (request, h) => {
  const requirements = await Util.getCreateRequirement(request, h)
  const monthAgo = moment().subtract(30, 'days').valueOf()
  return h
    .view('admin/receipt/create', {
      ...requirements,
      activateMembers: requirements.users.filter(
        user => new Date(user.updatedAt).getTime() >= monthAgo
      )
    })
    .takeover()
}

/**
 * Store a newly created resource in storage.
 * @return {Redirect}
 */
const store = async (request, h) => {
  try {
    const { payload } = request
    const receipt = new Receipt({
      ...payload,
      shippingFee: payload['shipping-fee'],
      author: request.auth.credentials.uid
    })

    await Util.splitReceipt(receipt)

    await receipt.save()

    return h
      .redirect(request.url.origin + '/admin/receipts')
      .code(301)
      .takeover()
  } catch (error) {
    const requirements = await Util.getCreateRequirement(request, h)
    return h
      .view('admin/receipt/create', {
        ...requirements,
        errors: [error.message]
      })
      .takeover()
  }
}

/**
 * Show the form for editing the specified resource.
 * @return {View}
 */
const edit = (request, h) => {
  return h
    .view('admin/receipt/edit')
    .takeover()
}

/**
 * Update the specified resource in storage.
 * @return {View}
 */
const update = (request, h) => {
  return h
    .response('admin/receipt/update')
    .takeover()
}

/**
 * Remove the specified resource from storage.
 * Condition: !confirmed
 * @return {Response}
 */
const destroy = async (request, h) => {
  try {
    const { deletedCount } = await Receipt.deleteOne({
      _id: request.params._id,
      confirmed: { $ne: true }
    })

    if (!deletedCount) {
      return Boom.notFound('Receipt not found.')
    }

    return h
      .response({ message: 'Delete receipt successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Confirm and pay receipt.
 * @return {Response}
 */
const paid = async (request, h) => {
  try {
    const config = global.CONFIG
    const receipt = await Receipt
      .findOne({
        _id: request.params._id,
        paid: { $ne: true }
      })
      .populate('members.member')
    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    receipt.confirmed = true
    receipt.paid = true

    for (const member of receipt.members) {
      if (member.paid) {
        continue
      }

      member.paid = true
      if (!member.amount) {
        continue
      }

      const user = member.member
      const infoURL = `https://${config.get('dns')}/balance`

      await Util.payToReceipt({
        user,
        receipt,
        amount: member.amount,
        infoURL
      })
    }

    await receipt.save()

    return h
      .response({ message: 'Paid receipt successfully!' })
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
  paid
}
