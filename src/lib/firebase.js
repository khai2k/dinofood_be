const firebaseAdmin = require('firebase-admin')
const { google } = require('googleapis')

/**
 * Send OTP to phone number and return sessionId
 * @param {String} phoneNumber | phone number
 * @param {String} recaptchaToken | reCAPTCHA token
 * @return {Promise<String>} sessionId
 */
const sendOTP = async (phoneNumber, recaptchaToken) => {
  const config = global.CONFIG
  const identityToolkit = google.identitytoolkit({
    auth: config.get('social.google.apiKey'),
    version: 'v3'
  })

  const response = await identityToolkit.relyingparty.sendVerificationCode({
    phoneNumber,
    recaptchaToken
  })

  // save sessionInfo into db. You will need this to verify the SMS code
  const sessionInfo = response.data.sessionInfo

  return sessionInfo
}
/**
 * Verify OTP code with firebase-sessionId
 * @param {String} code | OTP code
 * @param {String} sessionInfo | firebase sessionId
 * @return {Promise<Boolean>}
 */
const verifyOTP = async (code, sessionInfo) => {
  const config = global.CONFIG
  const identityToolkit = google.identitytoolkit({
    auth: config.get('social.google.apiKey'),
    version: 'v3'
  })

  await identityToolkit.relyingparty.verifyPhoneNumber({
    code,
    sessionInfo
  })

  // verification code accepted, update phoneNumberVerified flag in database
  return true
}

module.exports.name = 'app-firebase'
module.exports.register = async (server, options) => {
  const config = global.CONFIG
  const serviceAccount = config.get('firebase')
  const databaseURL = config.get('firebaseURL')

  global.FIREBASE = firebaseAdmin.initializeApp({
    databaseURL,
    credential: firebaseAdmin.credential.cert(serviceAccount)
  })

  global.FIREBASE.storage = firebaseAdmin.storage()
  global.FIREBASE.storage.bucket = global.FIREBASE.storage.bucket('dinofood.appspot.com')
  global.FIREBASE.sendOTP = sendOTP
  global.FIREBASE.verifyOTP = verifyOTP

  // const firebase = global.FIREBASE
  // const firestore = firebase.firestore()

  // await firestore
  //   .collection('orders')
  //   .doc('123123123123123123123123')
  //   .set({
  //     status: 'pre-request',
  //     updatedAt: new Date(),
  //     createdAt: new Date()
  //   })
}
