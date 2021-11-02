const fs = require('fs')
const csv = require('csv')
const path = require('path')
const moment = require('moment')
const crypto = require('crypto')
const nunjucks = require('nunjucks')
const htmlMinifier = require('html-minifier')

const config = global.CONFIG

/**
 * Get current date as string format
 * @return {String}
 */
const tmpDate = () => moment().format('MMM-DD-YYYY')

/**
 * Hash md5, return string
 * @param {String} string
 * @return {String}
 */
const md5 = string => crypto
  .createHash('md5')
  .update(String(string))
  .digest('hex')

/**
 * Hash sha256, return string
 * @param {String} string
 * @return {String}
 */
const sha256 = string => crypto
  .createHash('sha256')
  .update(String(string))
  .digest('hex')

/**
 * @param {Number} time
 * @return {Promise}
 */
const sleep = time => new Promise(resolve => setTimeout(resolve, time))

/**
 * Check input is Array or not
 * @param {Any} arr
 * @return {Boolean}
 */
const isArray = arr => Array.isArray(arr)

/**
 * Check input is Object or not
 * @param {Any} obj
 * @return {Boolean}
 */
const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)

/**
 * Merge many object to one
 * @param  {...Object} objs
 * @return {Object}
 */
const cloneObject = (...objs) => Object.assign({}, ...objs)

/**
 * Return difference elements in array a and not in array b
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */
const arrayDiff = (a, b) => {
  const s = new Set(b)
  return a.filter(x => !s.has(x))
}

/**
 * Get different between two dates
 * @return {Number}
 */
const diffDate = (date1, date2, format = 'd') => {
  const startDate = new Date(date1)
  const endDate = new Date(date2)
  const seconds = (endDate.getTime() - startDate.getTime()) / 1000
  switch (format) {
    // case 's':
    // case 'S':
    // case 'sec':
    // case 'Sec':
    // case 'second':
    // case 'Second':
    // case 'seconds':
    // case 'Seconds':
    //   return seconds
    case 'm':
    case 'M':
    case 'min':
    case 'Min':
    case 'minute':
    case 'Minute':
    case 'minutes':
    case 'Minutes':
      return Math.round(seconds / 60)
    case 'h':
    case 'H':
    case 'hour':
    case 'Hour':
    case 'hours':
    case 'Hours':
      return Math.round(seconds / 60 / 60)
    case 'd':
    case 'D':
    case 'date':
    case 'Date':
    case 'dates':
    case 'Dates':
    case 'day':
    case 'Day':
    case 'days':
    case 'Days':
      return Math.round(seconds / 60 / 60 / 24)
    default:
      return Math.round(seconds)
  }
}

/**
 * Valid input is an Array
 * @param {Any} arr
 * @return {Array}
 */
const ensureArray = (arr, defaultValue) => isArray(arr) ? arr : isArray(defaultValue) ? defaultValue : []

/**
 * Valid input is an Object
 * @param {Any} obj
 * @return {Object}
 */
const ensureObject = (obj, defaultValue) => isObject(obj) ? obj : isObject(defaultValue) ? defaultValue : {}

/**
 * Format date
 * @param {Date} date
 * @param {String} format
 * @param {String} timeZone
 * @return {String}
 */
const dateFormat = (date, format = config.get('date.format'), timeZone = '') => {
  try {
    const tmpDate = String(timeZone).match(/utc/i) ? moment.utc(date) : new Date(date)
    if (date && String(tmpDate) !== 'Invalid Date') {
      return String(timeZone).match(/utc/i) ? moment.utc(date).format(format) : moment(date).format(format)
    }
  } catch (error) {}

  return date
}

/**
 * Random number in range
 * @param {Number} minimum
 * @param {Number} maximum
 * @return {Number}
 */
const rand = (minimum = 0, maximum = 999999999999) => {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
}

/**
 * Random string
 * @param {Number} length
 */
const randStr = (length = 9, noLowerCase, noUpperCase, noNumber) => {
  const lowers = 'abcdefghijklmnopqrstuvwxyz'
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const chars = `${noLowerCase ? '' : lowers}${noUpperCase ? '' : uppers}${noNumber ? '' : numbers}`
  let str = ''

  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)]
  }

  return str
}

/**
 * Get first validate error message
 * @param {Object} error
 * @return {String}
 */
const getFirstValidateError = error => {
  const { errors } = JSON.parse(error.toString())
  if (Array.isArray(errors) && errors.length) {
    const { messages } = errors[0]
    if (Array.isArray(messages) && messages.length) {
      return messages[0]
    }
  }

  return ''
}

/**
 * Convert Vietnamese to no sign
 * @param {String} str
 */
const nonAccentVietnamese = str => {
  return String(str)
    .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/Ù|Ú|Ụ|Ủ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
}

/**
 * Escape special characters in string
 * @param {String} string
 * @return {String}
 */
const regexEscape = string => {
  /* eslint-disable-next-line */
  return String(string).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * @param {String} str
 * @param {String} option
 * @return {RegExp}
 */
const makeCleanRegex = (str, option = 'i') => new RegExp(
  regexEscape(str),
  option
)

/**
 * Get full text search string
 * @param {string} str
 */
const fullTextSearch = str => {
  return nonAccentVietnamese(regexEscape(str))
    .replace(/  +/g, ' ')
    .replace(/a/gi, '[aáàảãạâấầẩẫậăắằẳẵặAÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶ]')
    .replace(/o/gi, '[oóòỏõọôốồổỗộơớờởỡợOÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]')
    .replace(/e/gi, '[eéèẻẽẹêếềểễệEÉÈẺẼẸÊẾỀỂỄỆ]')
    .replace(/u/gi, '[uúùủũụưứừửữựUÚÙỦŨỤƯỨỪỬỮỰ]')
    .replace(/i/gi, '[iíìỉĩịIÍÌỈĨỊ]')
    .replace(/y/gi, '[yýỳỷỹỵYÝỲỶỸỴ]')
    .replace(/d/gi, '[dđDĐ]')
}

/**
 * Get full text search regex
 * @param {string} str
 */
const fullTextSearchRegex = str => {
  return new RegExp(
    fullTextSearch(str),
    'i'
  )
}

/**
 * Calculate distance between two points with latitude and longitude coordinates
 * @param {Object} fromPoint
 * @param {Object} toPoint
 * @return {Number}
 */
const distance = (fromPoint, toPoint) => {
  const R = 6371000 // Radius of the earth in meter
  const dLat = (toPoint.lat - fromPoint.lat) * Math.PI / 180 // Javascript functions in radians
  const dLon = (toPoint.lng - fromPoint.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(fromPoint.lat * Math.PI / 180) * Math.cos(toPoint.lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return Math.round(d)
}

/**
 * Round float number to integer
 * @param {Number} number
 * @param {Number} precision
 * @return {Number}
 */
const roundNumber = (number, precision = 2) => {
  // return Number(Math.round(number + 'e' + precision) + 'e-' + precision)
  const numb = Number(number) || 0
  const pow = Math.pow(10, precision)
  return Math.round(numb * pow) / pow
}

/**
 * Uppercase string
 * @param {String} string
 * @return {String}
 */
const upperCase = string => {
  if (typeof string === 'string') {
    return string.toUpperCase()
  }
  return string
}

/**
 * Lowercase string
 * @param {String} string
 * @return {String}
 */
const lowerCase = string => {
  if (typeof string === 'string') {
    return string.toLowerCase()
  }

  return string
}

/**
 * Convert string to camel case
 * @return {String}
 */
const camelCase = str => String(str)
  .toLowerCase()
  // Replaces any - or _ characters with a space
  .replace(/[-_]+/g, ' ')
  // Removes any non alphanumeric characters
  .replace(/[^\w\s]/g, '')
  // Uppercase the first character in each group immediately following a space
  // (delimited by spaces)
  .replace(/ (.)/g, $1 => $1.toUpperCase())
  // Removes spaces
  .replace(/ /g, '')

/**
 * Convert string to pascal case
 * @return {String}
 */
const pascalCase = str => String(str)
  // Replaces any - or _ characters with a space
  .replace(/[-_]+/g, ' ')
  // Removes any non alphanumeric characters
  .replace(/[^\w\s]/g, '')
  // Uppercase the first character in each group immediately following a space
  // (delimited by spaces)
  .replace(
    /\s+(.)(\w+)/g,
    ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
  )
  // Removes spaces
  .replace(/\s/g, '')
  // Uppercase first letter
  .replace(/\w/, s => s.toUpperCase())

/**
 * Trim all multiple space | new line | tab in string
 * @param {String} string
 * @return {String}
 */
const trimAll = string => {
  if (string === undefined || string === null) {
    string = ''
  }

  if (typeof string !== 'string') {
    string = String(string)
  }

  return string
    .trim()
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/, '')
}

/**
 * Get field ObjectId of mongoose document
 * @param {Object} object
 * @param {String} field
 * @return {ObjectId}
 */
const getObjectId = (object, field) => (object[field] && object[field]._id) || object[field]

/**
 * Get data from csv file
 * @param {String} csvFilePath
 * @return {Promise<Object[]>}
 */
const readCSV = (csvFilePath) => new Promise((resolve, reject) => {
  const csvData = []
  fs
    .createReadStream(csvFilePath)
    .pipe(csv.parse())
    .on('data', data => csvData.push(data))
    .on('end', () => resolve(csvData))
    .on('error', reject)
})

/**
 * Add time to Date.now
 * @return {Date}
 */
const daysFromNow = time => {
  return new Date(
    new Date().getTime() + time
  )
}

/**
 * Clear duplicate array items
 * @param {Any[]} arr
 * @param {String} valKey
 * @return {Any[]}
 */
const clearDuplicate = (arr, valKey) => ensureArray(arr).filter((item, index, self) => {
  return self.indexOf(item) === index
})

/**
 * URL exists query string
 * @param {String} url
 * @return {Boolean}
 */
const existsQueryString = url => /\?(\w+(=[\w-]*)?(&\w+(=[\w-]*)?)*)?$/.test(url)

/**
 * Generate url query string from Object
 * @param {Object} params
 * @return {String}
 */
const generateQueryStr = params => Object
  .keys(params)
  .map(key => key + '=' + params[key])
  .join('&')

/**
 * Generate array of integer start from 1
 * @param {Number} number
 * @return {Number[]}
 */
const generateArray = number => Array.from(new Array(number), (val, index) => index + 1)

/**
 * Compile html code with data
 * @param {String} html | html file path
 * @param {Object} context | render data
 * @return {String} | HTML code
 */
const generateHTML = (html, context) => {
  context.config = global.CONFIG

  // nunjucks config
  const viewPath = global.BASE_VIEW
  const nunjucksConfig = {
    tags: {
      blockStart: '<%',
      blockEnd: '%>',
      variableStart: '<$',
      variableEnd: '$>',
      commentStart: '<#',
      commentEnd: '#>'
    }
  }

  const src = fs.readFileSync(path.join(viewPath, html))
  const env = nunjucks.configure(viewPath, nunjucksConfig)
  const tpl = nunjucks.compile(src.toString(), env)
  return htmlMinifier.minify(tpl.render(context), {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true
  })
}

/**
 * Get degrees angle from 2 locations
 * @return {Number}
 */
const computeAngle = (fromPoint, toPoint) => {
  // Converts from degrees to radians.
  function radians (degrees) {
    return degrees * Math.PI / 180
  }

  // Converts from radians to degrees.
  function degrees (radians) {
    return radians * 180 / Math.PI
  }

  const radLat1 = radians(fromPoint.lat)
  const redLat2 = radians(toPoint.lat)
  const degLong = radians(toPoint.lng - fromPoint.lng)
  const y = Math.cos(redLat2) * Math.sin(degLong)
  const x = Math.cos(radLat1) * Math.sin(redLat2) - Math.sin(radLat1) * Math.cos(redLat2) * Math.cos(degLong)
  const result = Math.round(degrees(Math.atan2(y, x)) + 360, 4) % 360
  return result
}

/**
 * Format number to vnđ currency
 * @param {Number} money
 * @return {String}
 */
const vndCurrency = money => {
  return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + ' vnđ'
}

/**
 * Convert array of fields to valid mongoose sort options
 * @param {String[]} fields
 * @return {String[]}
 */
const generateSortFields = fields => ensureArray(fields).reduce((result, field) => [
  ...result,
  field,
  `-${field}`
], [])

module.exports = {
  md5,
  sha256,
  tmpDate,
  nonAccentVietnamese,
  distance,
  regexEscape,
  makeCleanRegex,
  fullTextSearch,
  fullTextSearchRegex,
  rand,
  randStr,
  sleep,
  isArray,
  isObject,
  cloneObject,
  arrayDiff,
  diffDate,
  ensureArray,
  ensureObject,
  dateFormat,
  roundNumber,
  upperCase,
  lowerCase,
  pascalCase,
  camelCase,
  trimAll,
  readCSV,
  getObjectId,
  getFirstValidateError,
  clearDuplicate,
  daysFromNow,
  existsQueryString,
  generateQueryStr,
  generateArray,
  generateHTML,
  computeAngle,
  vndCurrency,
  generateSortFields
}
