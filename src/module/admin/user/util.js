const mongoose = require('mongoose')
const User = require('@/model/User')

/**
 * Get edit user form requirements
 * @return {Promise<Object>}
 */
const getEditRequirement = async (request, h) => {
  if (!mongoose.Types.ObjectId.isValid(request.params._id)) {
    throw new Error('404')
  }

  const user = await User.findOne({ _id: request.params._id })
  if (!user) {
    throw new Error('404')
  }

  return { user }
}

module.exports = {
  getEditRequirement
}
