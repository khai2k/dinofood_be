const Pack = require('../../package')
const { PORT = 3000 } = process.env

module.exports = {
  dns: 'onib.link',
  db: {
    uri: 'mongodb://127.0.0.1:27017/db_dinofood'
  },
  jwt: {
    secret: '!wsYhFA*C2U6nz=Bu^%A@^F#SF3&kSR6',
    ttl: 24 * 60 * 60 // jwt-session to 1 day
  },
  connection: {
    port: PORT,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*']
      },
      validate: {
        failAction: async (request, h, err) => {
          throw err
          // if (process.env.NODE_ENV === 'production') {
          //   // In prod, log a limited error message and throw the default Bad Request error.
          //   // console.error('ValidationError:', err.message) // Better to use an actual logger here.
          //   throw Boom.badRequest(`Invalid request payload input`)
          // } else {
          //   // During development, log and respond with the full error.
          //   // console.error(err)
          //   throw err
          // }
        }
      }
    },
    state: {
      encoding: 'none',
      isSecure: process.env.NODE_ENV === 'production'
    }
  },
  OTP: {
    expireInMin: 5
  },
  swagger: {
    host: `localhost:${PORT}`,
    schemes: ['http'],
    cors: false,
    info: {
      title: Pack.name + ' documentation',
      version: Pack.version
    }
  },
  mailer: {
    enable: false,
    options: {
      // pool: true,
      service: '',
      host: 'smtp.mailgun.org',
      port: 587,
      tls: true,
      secure: true,
      auth: {
        user: 'example@email.com',
        pass: '123456'
      },
      logger: false, // log to console
      debug: false // include SMTP traffic in the logs
    },
    defaults: {
      from: `"Onib [${String(process.env.NODE_ENV).toUpperCase()}]" <danh.le@dinovative.com>`, // sender address
      to: 'danh.le@dinovative.com', // list of receivers
      subject: 'Welcome from Onib', // Subject line
      text: 'Onib application', // plain text body
      html: '' // html body
    }
  },
  firebaseURL: 'https://<DATABASE_NAME>.firebaseio.com',
  firebase: {
    type: '',
    project_id: '',
    private_key_id: '',
    private_key: '',
    client_email: '',
    client_id: '',
    auth_uri: '',
    token_uri: '',
    auth_provider_x509_cert_url: '',
    client_x509_cert_url: ''
  },
  social: {
    facebook: {
      lang: 'en_US',
      version: 'v3.2',
      appId: '0123456789'
    },
    google: {},
    twitter: {}
  }
}
