const Boom = require('@hapi/boom')
const helpers = require('@/utils/helpers')
const { validatePreVerifyTransfer, sendTransferSuccessMessage } = require('./util')
const { sendMultiChannelNotify } = require('@/module/api/notify/util')

const User = require('@/model/User')
const Transfer = require('@/model/Transfer')
const BalanceHistory = require('@/model/BalanceHistory')

const config = global.CONFIG
const expireInMin = config.get('OTP.expireInMin')

/**
 * Get transfer history
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
      user: request.auth.credentials.uid,
      status: {
        $ne: 'pending'
      }
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

    const pagination = await Transfer.paginate(queryParams, {
      page,
      limit,
      offset,
      select: '-OTP',
      sort: '-createdAt',
      lean: true,
      populate: [
        // {
        //   path: 'user',
        //   select: '_id email name username'
        //   // match: { isActive: true }
        // },
        {
          path: 'receiver',
          select: '_id email name username'
          // match: { isActive: true }
        }
      ]
    })

    return h
      .response(pagination)
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

/**
 * Create transfer payment and send OTP via EMAIL.
 * @return {Redirect}
 */
const store = async (request, h) => {
  try {
    const { email, amount, description } = request.payload
    if (email === request.auth.credentials.email) {
      throw new Error('Cannot transfer to yourself.')
    }
    const [sender, receiver] = await Promise.all([
      User
        .findOne({
          email: request.auth.credentials.email,
          isActive: true,
          balance: { $gte: amount }
        })
        .select('_id email balance'),
      User
        .findOne({
          email,
          isActive: true
        })
        .select('_id email balance')
    ])

    if (!sender || !receiver) {
      throw new Error(sender ? 'Receiver invalid.' : 'Your balance insufficient.')
    }

    const OTP = helpers.randStr(6, true, true)
    const transfer = await Transfer.create({
      user: sender._id,
      receiver: receiver._id,
      OTP,
      amount,
      description
    })

    // send OTP via email
    const message = [
      'You have submitted a transfer request',
      `Transfer to: ${email}`,
      `Transfer amount: ${helpers.vndCurrency(amount)}`,
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
 * Verify OTP and execute transfer.
 * @return {Response}
 */
const verify = async (request, h) => {
  try {
    const { _id } = request.params
    const { OTP } = request.payload
    const transfer = await Transfer
      .findOne({
        _id,
        user: request.auth.credentials.uid,
        reference: { $exists: false }
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
        }
      ])

    const { user, receiver } = await validatePreVerifyTransfer(transfer, OTP)

    transfer.status = 'verified'
    await transfer.save()

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

    // asynchronous
    sendTransferSuccessMessage({
      transfer,
      sender: user,
      receiver
    })

    return h
      .response({ message: 'Transfer successfully.' })
      .takeover()
  } catch (error) {
    return Boom.badRequest(error)
  }
}

module.exports = {
  index,
  store,
  verify
}
