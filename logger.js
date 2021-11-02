/**
 * File name: logger.js
 * Created by Visual studio code
 * User: Danh Le / danh.le@dinovative.com
 * Date: 2020-05-27 11:58:06
 */
const winston = require('winston')
require('winston-daily-rotate-file')

const fileConfig = [
  new (winston.transports.Console)({
    json: true,
    colorize: true,
    timestamp: true
  }),
  // new (winston.transports.File)({
  //   filename: './log/debug.log',
  //   json: true,
  //   colorize: true,
  //   handleExceptions: true
  // }),
  new (winston.transports.DailyRotateFile)({
    filename: './log/debug-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: '20m',
    maxFiles: '7d',
    json: true,
    colorize: true,
    zippedArchive: true,
    handleExceptions: true
  })
]

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: fileConfig
})

module.exports = logger
