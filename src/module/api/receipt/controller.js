const qs = require('qs')
const moment = require('moment')
const momentTimezone = require('moment-timezone')

const Boom = require('@hapi/boom')
const { randStr, vndCurrency, fullTextSearchRegex, ensureObject } = require('@/utils/helpers')
const { calculateReceiptInfo } = require('@/module/admin/receipt/calculator')
const { sendMultiChannelNotify } = require('@/module/api/notify/util')
const { validatePreVerifyTransfer } = require('@/module/api/transfer/util')

const User = require('@/model/User')
const Receipt = require('@/model/Receipt')
const Transfer = require('@/model/Transfer')
const BalanceHistory = require('@/model/BalanceHistory')

const ReceiptUtil = require('./util')

const config = global.CONFIG
const expireInMin = config.get('OTP.expireInMin')

/**
 * Paginate Receipt
 * @returns {Response<Pagination<Receipt>>}
 */
const index = async (request, h) => {
  try {
    const {
      page = 1,
      limit = 10,
      offset = 0,
      sort = '-createdAt',
      keyword,
      fromDate,
      toDate,
      isOwner,
      status,
      ...queryParams
    } = request.query

    queryParams.$or = [
      { author: request.auth.credentials.uid }
    ]
    if (!isOwner) {
      queryParams.$or.push({
        confirmed: true,
        'members.member': request.auth.credentials.uid
      })
    }

    if (keyword) {
      queryParams.title = fullTextSearchRegex(keyword)
    }

    if (fromDate) {
      queryParams.createdAt = {
        $gte: fromDate
      }
    }

    if (toDate) {
      queryParams.createdAt = {
        ...ensureObject(queryParams.createdAt),
        $lte: toDate
      }
    }

    if (status) {
      if (['unconfirmed', 'unpaid'].includes(status)) {
        const fieldName = status === 'unconfirmed' ? 'confirmed' : 'paid'
        queryParams[fieldName] = { $ne: true }
      } else {
        queryParams[status] = true
      }
    }

    const pagination = await Receipt.paginate(queryParams, {
      sort,
      page,
      limit,
      offset,
      lean: true
      // populate: {
      //   path: 'members.member',
      //   select: '_id email username'
      // }
    })

    return h
      .response(pagination)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Create a Receipt
 * @return {Response<Receipt>}
 */
const store = async (request, h) => {
  try {
    const { payload } = request

    const mapIdMembers = await User.mappingIdByEmail({
      email: {
        $in: payload.members.map(
          ({ email }) => email
        )
      }
    })

    if (payload.members.length !== Object.keys(mapIdMembers).length) {
      throw new Error('Has member not exists.')
    }

    const receiptInformation = calculateReceiptInfo({
      discount: payload.discount,
      shippingFee: payload.shippingFee,
      members: payload.members.map(
        ({ email, price }) => ({
          member: mapIdMembers[email],
          email,
          price
        })
      )
    })

    const { _id } = await Receipt.create({
      ...payload,
      ...receiptInformation,
      author: request.auth.credentials.uid
    })

    return h
      .response({
        _id,
        message: 'Create receipt successfully!'
      })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Get Receipt information
 * @return {Response<Receipt>}
 */
const show = async (request, h) => {
  try {
    const receipt = await Receipt
      .findOne({
        _id: request.params._id,
        $or: [
          { author: request.auth.credentials.uid },
          {
            confirmed: true,
            'members.member': request.auth.credentials.uid
          }
        ]
      })
      .populate({
        path: 'members.member',
        select: '_id email username'
      })
      .lean()

    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    return h
      .response(receipt)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Update a un-confirm Receipt information
 * @return {Response<Receipt>}
 */
const update = async (request, h) => {
  try {
    const { payload } = request

    const receipt = await Receipt.findOne({
      _id: request.params._id,
      confirmed: { $ne: true },
      paid: { $ne: true },
      author: request.auth.credentials.uid
    })

    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    const mapIdMembers = await User.mappingIdByEmail({
      email: {
        $in: payload.members.map(
          ({ email }) => email
        )
      }
    })

    if (payload.members.length !== Object.keys(mapIdMembers).length) {
      throw new Error('Has member not exists.')
    }

    const receiptInformation = calculateReceiptInfo({
      discount: payload.discount,
      shippingFee: payload.shippingFee,
      members: payload.members.map(
        ({ email, price }) => ({
          member: mapIdMembers[email],
          email,
          price
        })
      )
    })

    receipt.title = payload.title
    for (const field of Object.keys(receiptInformation)) {
      receipt[field] = receiptInformation[field]
    }

    await receipt.save()

    return h
      .response({ message: 'Update receipt successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Delete a un-confirm Receipt
 * @return {Response<{ message: string }>}
 */
const destroy = async (request, h) => {
  try {
    const { deletedCount } = await Receipt.deleteOne({
      _id: request.params._id,
      confirmed: { $ne: true },
      paid: { $ne: true },
      author: request.auth.credentials.uid
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
 * Confirm Receipt
 * @return {Response<{ message: string }>}
 */
const confirm = async (request, h) => {
  try {
    const receipt = await Receipt
      .findOne({
        _id: request.params._id,
        confirmed: { $ne: true },
        paid: { $ne: true },
        author: request.auth.credentials.uid
      })
      .populate({
        path: 'members.member',
        select: '_id email'
      })

    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    receipt.paid = true
    receipt.blamedAt = new Date()
    receipt.confirmed = true
    for (const member of receipt.members) {
      const memId = String(member.member && member.member._id)
      member.paid = String(receipt.author) === memId
      receipt.paid = receipt.paid && member.paid
    }
    await receipt.save()

    // asynchronous
    ReceiptUtil.sendConfirmNotifyToMembers(receipt)

    return h
      .response({ message: 'Confirm receipt successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Update paid for all unpaid receipt's members
 * @return {Response<{ message: string }>}
 */
const paid = async (request, h) => {
  try {
    const receipt = await Receipt
      .findOne({
        _id: request.params._id,
        confirmed: { $eq: true },
        paid: { $ne: true },
        author: request.auth.credentials.uid
      })
      .populate({
        path: 'members.member',
        select: '_id email username'
      })

    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    for (const memberItem of receipt.members) {
      if (memberItem.paid) {
        continue
      }

      memberItem.paid = true

      // asynchronous
      ReceiptUtil.sendPaidNotifyToMember(receipt, memberItem.member)
    }

    receipt.paid = true
    await receipt.save()

    return h
      .response({ message: 'Update receipt successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Update paid for unpaid receipt's member
 * @return {Response<{ message: string }>}
 */
const paidOnMember = async (request, h) => {
  try {
    const receipt = await Receipt
      .findOne({
        _id: request.params._id,
        confirmed: { $eq: true },
        paid: { $ne: true },
        author: request.auth.credentials.uid,
        members: {
          $elemMatch: {
            paid: { $ne: true },
            member: request.params.member
          }
        }
      })
      .populate({
        path: 'members.member',
        select: '_id email username'
      })

    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    receipt.paid = true
    for (const memberItem of receipt.members) {
      const memberItemId = String((memberItem.member && memberItem.member._id) || memberItem.member)
      const isUpdateMember = request.params.member === memberItemId
      const isPaidMemberItem = memberItem.paid || isUpdateMember
      receipt.paid = receipt.paid && isPaidMemberItem

      if (memberItem.paid || !isUpdateMember) {
        continue
      }

      memberItem.paid = true

      // asynchronous
      ReceiptUtil.sendPaidNotifyToMember(receipt, memberItem.member)
    }

    await receipt.save()

    return h
      .response({ message: 'Update receipt successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Create transfer ref to unpaid receipt
 * @return {Response<{ message: string }>}
 */
const pay = async (request, h) => {
  try {
    const receipt = await Receipt
      .findOne({
        _id: request.params._id,
        confirmed: { $eq: true },
        paid: { $ne: true },
        members: {
          $elemMatch: {
            paid: { $ne: true },
            member: request.auth.credentials.uid
          }
        }
      })
      .populate({
        path: 'author',
        select: '_id email username',
        match: { isActive: true }
      })

    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    const receiver = receipt.author
    const memberItem = receipt.members.find(
      ({ member }) => request.auth.credentials.uid === String((member && member._id) || member)
    )
    const sender = await User
      .findOne({
        _id: request.auth.credentials.uid,
        isActive: true,
        balance: { $gte: memberItem.amount }
      })
      .select('_id email balance')

    if (!sender || !receiver) {
      throw new Error(sender ? 'Receiver invalid.' : 'Your balance insufficient.')
    }

    const OTP = randStr(6, true, true)
    const transfer = await Transfer.create({
      user: sender._id,
      receiver: receiver._id,
      OTP,
      amount: memberItem.amount,
      description: `Pay to receipt - ${receipt.title}`,
      reference: {
        model: 'Receipt',
        value: receipt._id
      }
    })

    // send OTP via email
    const message = [
      'You have submitted a transfer request',
      `Transfer to: ${receiver.email}`,
      `Transfer amount: ${vndCurrency(memberItem.amount)}`,
      `Transfer description: ${transfer.description}`,
      `Your transfer payment OTP is: ${OTP}`,
      `OTP valid for ${expireInMin} minutes.`
    ].join('\n')

    await sendMultiChannelNotify({
      to: sender,
      subject: 'Transfer payment OTP',
      message
    })

    return h
      .response({
        _id: transfer._id,
        message: 'Check inbox to get OTP.',
        OTP: process._notProd(OTP)
      })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Verify transfer ref to unpaid receipt
 * @return {Response<{ message: string }>}
 */
const verifyPay = async (request, h) => {
  try {
    const { _id } = request.params
    const { OTP } = request.payload
    const transfer = await Transfer
      .findOne({
        _id: request.payload.transfer,
        user: request.auth.credentials.uid,
        'reference.model': 'Receipt'
      })
      .populate([
        {
          path: 'user',
          select: '_id email balance',
          match: { isActive: true }
        },
        {
          path: 'receiver',
          select: '_id email balance',
          match: { isActive: true }
        },
        {
          path: 'reference.value',
          match: {
            _id,
            confirmed: { $eq: true },
            paid: { $ne: true },
            members: {
              $elemMatch: {
                paid: { $ne: true },
                member: request.auth.credentials.uid
              }
            }
          }
        }
      ])

    const receipt = transfer && transfer.reference && transfer.reference.value
    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    const { user, receiver } = await validatePreVerifyTransfer(transfer, OTP)

    transfer.status = 'verified'
    await transfer.save()

    // SECTION: transfer
    const senderCurrentBalance = user.balance - transfer.amount
    const receiverCurrentBalance = receiver.balance + transfer.amount
    await BalanceHistory.insertMany([
      {
        user: user._id,
        oldBalance: user.balance,
        newBalance: senderCurrentBalance,
        type: 'outcome',
        amount: transfer.amount,
        description: `Transfer to: ${receiver.email}`,
        reference: {
          model: 'Transfer',
          value: transfer._id
        }
      },
      {
        user: receiver._id,
        oldBalance: receiver.balance,
        newBalance: receiverCurrentBalance,
        type: 'income',
        amount: transfer.amount,
        description: `Receive from: ${user.email}`,
        reference: {
          model: 'Transfer',
          value: transfer._id
        }
      }
    ])

    await Promise.all([
      User.updateOne({ _id: user._id }, { $inc: { balance: -transfer.amount } }),
      User.updateOne({ _id: receiver._id }, { $inc: { balance: transfer.amount } })
    ])

    // SECTION: update receipt
    receipt.paid = true
    for (const memberItem of receipt.members) {
      const memberItemId = String((memberItem.member && memberItem.member._id) || memberItem.member)
      const isUpdateMember = request.auth.credentials.uid === memberItemId
      const isPaidMemberItem = memberItem.paid || isUpdateMember
      receipt.paid = receipt.paid && isPaidMemberItem

      if (!memberItem.paid && isUpdateMember) {
        memberItem.paid = true

        // asynchronous
        ReceiptUtil.sendPayToReceiptNotify({
          receipt,
          transfer,
          sender: user,
          receiver
        })
      }
    }

    await receipt.save()

    return h
      .response({ message: 'Paid to receipt successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Blame all receipt members
 */
const blame = async (request, h) => {
  try {
    const receipt = await Receipt
      .findOne({
        _id: request.params._id,
        author: request.auth.credentials.uid,
        confirmed: { $eq: true },
        paid: { $ne: true }
      })
      .populate({
        path: 'members.member',
        select: '_id email username name'
      })
      .lean()

    if (!receipt) {
      return Boom.notFound('Receipt not found.')
    }

    if (receipt.blamedAt) {
      const threeHoursInTime = 1000 * 60 * 60 * 3
      const now = new Date()
      const latency = now.getTime() - receipt.blamedAt.getTime()
      if (latency < threeHoursInTime) {
        const nextTime = now.getTime() + threeHoursInTime - latency
        const nextTimeText = momentTimezone(nextTime).tz('Asia/Saigon').format('hh:mm A MMM DD, YYYY')
        throw new Error(`Next blame time for this receipt from: ${nextTimeText}`)
      }
    }

    const receiptsURL = `https://${config.get('dns')}/receipts`
    const urlQueryParams = {
      keyword: receipt.title,
      fromDate: moment(receipt.createdAt).subtract(1, 'd').format('YYYY-MM-DD'),
      toDate: moment(receipt.createdAt).add(1, 'd').format('YYYY-MM-DD'),
      status: 'unpaid'
    }
    const infoURL = `${receiptsURL}?${qs.stringify(urlQueryParams)}`

    const template = request.payload.template || 'Còn nợ bill "{receipt-title}" {money} nè {user-name} eyy.'
    for (const { paid, amount, member } of receipt.members) {
      if (paid) {
        continue
      }

      const message = template
        .replace(/(\{receipt-title\})/, receipt.title)
        .replace(/(\{user-name\})/, member.name || member.username)
        .replace(/(\{money\})/, vndCurrency(amount))

      await sendMultiChannelNotify({
        to: member,
        subject: `From ${config.get('dns')} with love`,
        emailMessage: [
          message,
          `More information: ${infoURL}`
        ].join('\n')
      })
    }

    receipt.blamedAt = new Date()
    await Receipt.updateOne(
      { _id: request.params._id },
      { $set: { blamedAt: new Date() } }
    )

    return h
      .response({ message: 'Send blame successfully!' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
  confirm,
  paid,
  paidOnMember,
  pay,
  verifyPay,
  blame
}
