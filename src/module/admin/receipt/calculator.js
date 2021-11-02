function getDiscounted (price, total, discount) {
  if (!total) {
    return 0
  }

  const percent = Math.floor((price * 10000) / total)
  const dist = Math.floor((discount * percent) / 10000)
  return dist
}

function calculateReceiptInfo ({ discount, shippingFee, members }) {
  const result = {
    amount: 0,
    subTotal: members.reduce((total, { price }) => total + price, 0),
    discount: Math.max(discount, 0),
    shippingFee: Math.max(shippingFee, 0)
  }

  const discountToPrice = Math.max(discount - shippingFee, 0)
  const feeAfterDiscount = Math.max(shippingFee - discount, 0)
  const feeOnMember = Math.floor(result.shippingFee / members.length)
  const discountOnMember = Math.floor(result.discount / members.length)

  for (const member of members) {
    const discountOfMember = feeAfterDiscount
      ? discountOnMember
      : feeOnMember + getDiscounted(member.price, result.subTotal, discountToPrice)

    member.fee = feeOnMember
    member.discount = discountOfMember
    member.amount = member.price + member.fee - member.discount
    result.amount += member.amount
  }

  return {
    ...result,
    members
  }
}

module.exports = {
  calculateReceiptInfo
}
