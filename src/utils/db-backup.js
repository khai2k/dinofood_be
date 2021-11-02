/* eslint-disable */
// Run on windows: set NODE_ENV=development&&node commander backup:database
// Run on ubuntu || MacOS: NODE_ENV=development node commander backup:database
// `mongodump --uri <DB_URI> --out ./mongo_bk/YYYY-MMM-DD`
// `mongorestore --drop --uri <DB_URI> ./mongo_bk/YYYY-MMM-DD`

// const fs = require('fs')
const path = require('path')
const moment = require('moment')
const mongoose = require('mongoose')
const { spawn } = require('child_process')

const File = require('./file')

const execCMD = (cmd = 'mongodump', options) => new Promise((resolve, reject) => {
  const execCMD = spawn(cmd, options)
  execCMD.stdout.on('data', data => {
    // console.log(`stdout: ${data}`)
  })

  execCMD.stderr.on('data', data => {
    // console.log(`stderr: ${data}`)
  })

  execCMD.on('error', reject)

  execCMD.on('close', code => {
    // console.log(`child process exited with code ${code}`)
    resolve(code)
  })
})

const backupDB = async () => {
  const dbNotAvailable = !(mongoose.connection && mongoose.connection.db && mongoose.connection.db.databaseName)
  if (dbNotAvailable) {
    throw new Error('Database not available')
  }

  const s3 = global.S3
  const config = global.CONFIG

  const dbURI = config.get('db.uri')
  const timestamp = moment().format('YYYY-MM-DD-HH-mm')
  const databaseName = mongoose.connection.db.databaseName
  const outPutDir = path.join(process.cwd(), 'export', `${databaseName}-${timestamp}`)
  File.ensureDirExists(outPutDir)

  const exportOptions = [
    '--forceTableScan',
    '--uri',
    dbURI,
    '--out',
    outPutDir
  ]

  console.log('===================== Dump db to directory =====================')
  await execCMD('mongodump', exportOptions)

  // const dbDir = path.join(outPutDir, databaseName)
  // const bsonCollections = fs
  //   .readdirSync(dbDir)
  //   .map(f => path.join(dbDir, f))

  // make zip
  const zip = await File.zip(outPutDir + '.zip', outPutDir)

  console.log('===================== Delete dump directory =====================')
  File.deleteDir(outPutDir)

  console.log('===================== Upload to storage =====================')
  const bucket = global.FIREBASE.storage.bucket
  const [file, { selfLink }] = await bucket.upload(zip.path, { destination: `backup/${path.basename(zip.path)}` })

  console.log('===================== Delete zip file =====================')
  await File.delete(zip.path)

  console.log('Backup successfully to: ', selfLink)
  return selfLink
}

module.exports = backupDB
