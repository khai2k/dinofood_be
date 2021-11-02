$(document).ready(function() {
  const service = {
    paid: ({ _id }) => axios.put(`/admin/receipts/${_id}/paid`, {}, {
      withCredentials: true
    }),
    delete: ({ _id }) => axios.delete(`/admin/receipts/${_id}/delete`, {
      withCredentials: true
    })
  }

  /**
   * Map keyword with mention
   */
  const mapMentions = (Array.isArray(window.users) ? window.users : []).reduce((result, user) => Object.assign(result, {
    [user.email]: user.keywords && user.keywords.length ? user.keywords : []
  }), {})

  function getDiscounted(price, total, discount) {
    if (!total) {
      return 0
    }

    const percent = Math.floor((price * 10000) / total)
    const dist = Math.floor((discount * percent) / 10000)
    return dist
  }

  /**
   * Split bill/member
   * @return {String}
   */
  function splitReceipt (peoples, shippingFee = 0, totalDiscount = 0) {
    const result = []
    const discounted = Math.max(totalDiscount - shippingFee, 0)
    const fee = Math.floor(
      Math.max(shippingFee - totalDiscount, 0) / Object.keys(peoples).length
    )

    const totalPrice = Object
      .values(peoples)
      .reduce((total, e) => total + e, 0)

    const split = Object
      .keys(peoples)
      .reduce((result, name) => {
        const mention = Object
          .keys(mapMentions)
          .find(key => mapMentions[key].includes(name))
        const price = peoples[name]
        const discount = getDiscounted(price, totalPrice, discounted)
        const amount = price + fee - discount
        result[mention] = {
          price,
          fee,
          discount,
          amount
        }
        return result
      }, {})

    const billAmount = Object
      .keys(split)
      .reduce((r, k) => ({ ...r, [k]: split[k].amount }), {})

    const billInfo = JSON
      .stringify(billAmount, null, 2)
      .replace(/^\ |\{|\}|\"|\,/gmi, '') // remove json string special characters
      .replace(/^\ /gmi, '') // remove space
      .replace(/^\n|\n$/gmi, '') // remove empty line
      .split(/\n/gmi)
      .sort((b, a) => b.length > a.length ? 1 : b.length === a.length ? 0 : -1) // sort asc by length
      .map(e => e.match(/^@Thành Danh/) ? e + ' ♥' : e) // auto create heart for @Thành Danh
      .join('\n')

    const totalAmount = Object
      .values(billAmount)
      .reduce((total, e) => total + e, 0)

    result.push('==============================')
    result.push(`Shipping fee: ${shippingFee}`)
    result.push(`Total discount: ${totalDiscount}`)
    result.push(`Discount include fee: ${discounted}`)
    result.push(billInfo)
    result.push('==============================')
    result.push(`Total: ${totalAmount}`)
    result.push('==============================')

    // banking information
    result.push('Accept cash, zalo, SCB, momo, grab, airpay. 0971407794')
    result.push('```SCB STK: 14396880001')
    result.push('Name: LE THANH DANH')
    result.push('Branch: Cống Quỳnh```')

    return {
      info: result.join('\n'),
      amount: totalAmount,
      total: Object
        .keys(split)
        .reduce((r, k) => r + split[k].price, 0)
    }
  }

  /**
   * Update input small help text
   * @return {Void}
   */
  function updateHelpText(selector, number) {
    $(`#${selector}-help`).html([
      'Bằng số: ',
      helpers.formatMoney(number),
      ' vnđ',
      '<br>',
      'Bằng chữ: ',
      helpers.readNumber(number)
    ].join(''))
  }

  $('input[name="shipping-fee"]').on('change', function(e) {
    updateHelpText('shipping-fee', $(this).val())
  })

  $('input[name="discount"]').on('change', function(e) {
    updateHelpText('discount', $(this).val())
  })

  $('.btn-checkInfo').on('click', function(e) {
    const members = $('[name="info"]')
      .val()
      .replace(/\,/gmi, '')
      .replace(/\,/gmi, '')
      .replace(/đ$/gmi, '')
      .replace(/(^[a-zA-Z])/gm, '@$1')
      .split(/^@/m)
      .filter(e => e && !!String(e).trim())
      .reduce((results, e) => {
        const name = e.split(/\n/).shift()
        const match = e.match(/\d+$/gm)
        results[name] = 0

        if (match) {
          const totalMoney = match.reduce((money, v) => money + Number(v), 0)
          results[name] = totalMoney
        }

        return results
      }, {})

    const totalDiscount = parseInt($('input[name="discount"]').val())
    const shippingFee = parseInt($('input[name="shipping-fee"]').val())

    const { info, total } = splitReceipt(members, Math.max(shippingFee, 0), Math.max(totalDiscount, 0))
    updateHelpText('info', total)

    $(`.slack-info`).text(info)
  })

  /**
   * Handle insert member on create form
   */
  $('.insert-member').on('click', function(e) {
    const name = $(this).text().trim()
    const value = [
      $('[name="info"]').val().trim(),
      name
    ].join('\n')

    $('[name="info"]').val(value)
  })

  /**
   * On load
   */
  updateHelpText('discount', $('input[name="discount"]').val())
  updateHelpText('shipping-fee', $('input[name="shipping-fee"]').val())

  /**
   * Handle show receipt information
   */
  $('.btn-info').on('click', function(e) {
    const _id = $(this).attr('data-id')
    if (_id && receipts[_id]) {
      const receipt = receipts[_id]

      $('#receipt-modal').find('.modal-title').text(receipt.title)

      $('#receipt-modal').find('.primary-info').html([
        `<div class="col-sm-3">Sub total</div>`,
        `<div class="col-sm-9">${helpers.formatMoney(receipt.subTotal)} vnđ</div>`,
        `<div class="col-sm-3">Shipping fee</div>`,
        `<div class="col-sm-9">${helpers.formatMoney(receipt.shippingFee)} vnđ</div>`,
        `<div class="col-sm-3">Discount</div>`,
        `<div class="col-sm-9">${helpers.formatMoney(receipt.discount)} vnđ</div>`,
        `<div class="col-sm-3">Amount</div>`,
        `<div class="col-sm-9">${helpers.formatMoney(receipt.amount)} vnđ</div>`
      ].join(''))

      $('#receipt-modal').find('tbody').html(
        receipt.members.map(({ member, price, fee = 0, discount = 0, amount })=> [
          '<tr>',
            `<td>${member.email}</td>`,
            `<td>${helpers.formatMoney(price)} vnđ</td>`,
            `<td>${helpers.formatMoney(fee)} vnđ</td>`,
            `<td>${helpers.formatMoney(discount)} vnđ</td>`,
            `<td>${helpers.formatMoney(amount)} vnđ</td>`,
          '</tr>',
        ].join(''))
      )

      $('#receipt-modal').modal('show')
    }
  })

  /**
   * Handle paid receipt
   */
  $('.btn-paid').on('click', function(e) {
    const _id = $(this).attr('data-id')
    $(`button[data-id="${_id}"]`).attr('disabled', 'disabled')

    service
      .paid({ _id })
      .then(response => {
        $(`label[data-id="${_id}"].label-warning`).addClass('label-success')
        $(`label[data-id="${_id}"].label-warning`).text('Paid')
        $(`label[data-id="${_id}"].label-warning`).removeClass('label-warning')

        $(this).remove()
        $(`button[data-id="${_id}"].btn-delete`).remove()

        $(`button[data-id="${_id}"]`).removeAttr('disabled')
        toastr.success(response.data.message, 'Receipt')
      })
      .catch(({ response }) => {
        $(`button[data-id="${_id}"]`).removeAttr('disabled')
        toastr.error(response.data.message, 'Receipt')
      })
  })

  /**
   * Handle delete receipt
   */
  $('.btn-delete').on('click', function(e) {
    const _id = $(this).attr('data-id')
    $(`button[data-id="${_id}"]`).attr('disabled', 'disabled')

    service
      .delete({ _id })
      .then(response => {
        $(this).closest('tr').remove()
        toastr.success(response.data.message, 'Receipt')
      })
      .catch(({ response }) => {
        $(`button[data-id="${_id}"]`).removeAttr('disabled')
        toastr.error(response.data.message, 'Receipt')
      })
  })
})
