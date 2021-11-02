;(function(window) {
  const service = {
    sendRequirePayment: () => axios.post(`/admin/users/require-payment`, {
      withCredentials: true
    })
  }

  const strNumbers = [
    'không',
    'một',
    'hai',
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín'
  ]

  /**
   * Convert dozens block number to string
   * @return {String}
   */
  function readNumberDozens(number, fullNumbers) {
    let result = ''
    let tenNo = Math.floor(number / 10)
    let unit = number % 10
    if (tenNo > 1) {
      result = ' ' + strNumbers[tenNo] + ' mươi'
      if (unit == 1) {
        result += ' mốt'
      }
    } else if (tenNo == 1) {
      result = ' mười'
      if (unit == 1) {
        result += ' một'
      }
    } else if (fullNumbers && unit > 0) {
      result = ' lẻ'
    }
    if (unit == 5 && tenNo > 1) {
      result += ' lăm'
    } else if (unit > 1 || (unit == 1 && tenNo == 0)) {
      result += ' ' + strNumbers[unit]
    }

    return result
  }

  /**
   * Convert thousand block number to string
   * @return {String}
   */
  function readBlock(number, fullNumbers) {
    let result = ''
    let hundred = Math.floor(number / 100)
    let noDivHundred = number % 100
    if (fullNumbers || hundred > 0) {
      result = ' ' + strNumbers[hundred] + ' trăm'
      result += readNumberDozens(noDivHundred, true)
    } else {
      result = readNumberDozens(noDivHundred, false)
    }
    return result
  }

  /**
   * Convert million number to string
   * @return {String}
   */
  function readMillion(number, fullNumbers) {
    let result = ''
    let million = Math.floor(number / 1000000)
    let numberDivMillion = number % 1000000
    if (million > 0) {
      result = readBlock(million, fullNumbers) + ' triệu'
      fullNumbers = true
    }

    let thousand = Math.floor(numberDivMillion / 1000)
    numberDivMillion = numberDivMillion % 1000
    if (thousand > 0) {
      result += readBlock(thousand, fullNumbers) + ' nghìn'
      fullNumbers = true
    }

    if (numberDivMillion > 0) {
      result += readBlock(numberDivMillion, fullNumbers)
    }

    return result
  }

  /**
   * Convert number to VN string
   * @param {Number} number
   * @return {String}
   */
  function readNumber(number, upperFirst) {
    if (number == 0) {
      return strNumbers[0]
    }

    let result = ''
    let suffix = ''
    do {
      let billion = number % 1000000000
      number = Math.floor(number / 1000000000)
      if (number > 0) {
        result = readMillion(billion, true) + suffix + result
      } else {
        result = readMillion(billion, false) + suffix + result
      }

      suffix = ' tỷ'
    } while (number > 0)

    let numberAsStr = result.trim()

    return upperFirst
      ? `${numberAsStr.charAt(0).toUpperCase()}${numberAsStr.slice(1)}`
      : numberAsStr
  }

  /**
   * Format number to vnđ currency
   * @param {Number} number
   * @param {Number} float
   * @return {String}
   */
  function formatMoney(number, float = 0) {
    let group = 3
    let regex = '\\d(?=(\\d{' + group + '})+' + (float > 0 ? '\\.' : '$') + ')'
    return Number(number).toFixed(Math.max(0, ~~float)).replace(new RegExp(regex, 'g'), '$&,')
  }

  /**
   * Update input small help text
   * @param {String} inputName small tag helper selector
   * @param {Number} value input value
   * @return {Void}
   */
  function moneyHelpText(selector, value) {
    $(selector).html([
      'Bằng số: ',
      helpers.formatMoney(value),
      ' vnđ',
      '<br>',
      'Bằng chữ: ',
      helpers.readNumber(value)
    ].join(''))
  }

  /**
   * Admin list | sort
   * @param {String} field
   * @param {String} param
   * @return {Void}
   */
  function sort(field, paramKey = 'sortBy') {
    let parseSearchURL = new URLSearchParams(location.search)
    let params = {}
    for (const key of parseSearchURL.keys()) {
      if (key) {
        let value = parseSearchURL.getAll(key)
        params[key] = Array.isArray(value) && value.length > 1
          ? value
          : value[0]
      }
    }

    if (!params[paramKey] || params[paramKey] !== field) {
      params[paramKey] = field
    } else {
      params[paramKey] = `-${field}`
    }

    let queryString = $.param(params)

    window.location.search = `?${queryString}`
  }

  /**
   * Send require payment notify
   * @return {Void}
   */
  function sendRequirePaymentNotification(e) {
    $(e.target).attr('disabled', 'disabled')
    service
      .sendRequirePayment()
      .then(response => {
        $(e.target).removeAttr('disabled')
        toastr.success(response.data.message, 'Notification')
      })
      .catch(({ response }) => {
        $(e.target).removeAttr('disabled')
        toastr.error(response.data.message, 'Notification')
      })
  }

  /**
   * Initial helpers
   */
  function helpers() {}

  // admin section
  helpers.sort = sort
  helpers.sendRequirePaymentNotification = sendRequirePaymentNotification

  helpers.strNumbers = strNumbers
  helpers.readNumberDozens = readNumberDozens
  helpers.readBlock = readBlock
  helpers.readMillion = readMillion
  helpers.readNumber = readNumber
  helpers.formatMoney = formatMoney
  helpers.moneyHelpText = moneyHelpText

  window.helpers = helpers

  if ($('.alert')) {
    setTimeout(function() {
      $('.alert').fadeOut()
    }, 3000)
  }
})(window)
