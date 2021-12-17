const Pack = require('../../package')
const { PORT = 3000 } = process.env

module.exports = {
  dns: 'onib.link',
  db: {
    uri: 'mongodb://103.142.139.104:27017/dino_food'
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
    enable: true,
    options: {
      // pool: true,
      service: '',
      // host: 'smtp.mailgun.org',
      host: 'smtp.gmail.com',
      port: 465,
      // tls: true,
      secure: true,
      auth: {
        user: 'ngovankhai2000@gmail.com',
        pass: '13111999Khai'
      },
      logger: false, // log to console
      debug: false // include SMTP traffic in the logs
    },
    defaults: {
      from: `"Onib [${String(
        process.env.NODE_ENV
      ).toUpperCase()}]" <ngovankhai2000@email.com>`, // sender address
      to: 'ngovankhai2000@email.com', // list of receivers
      subject: 'Welcome from Onib', // Subject line
      text: 'Onib application', // plain text body
      html: '' // html body
    }
  },
  firebaseURL: 'https://dino-food-f52c4-default-rtdb.asia-southeast1.firebasedatabase.app',
  firebase: {
    type: 'service_account',
    project_id: 'dino-food-f52c4',
    private_key_id: '3bb602c198da8bf94f46a69319a97a4d38069eae',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDY9M4+7BR15M6O\nEHIYfFF+XzhMZirUJb/4Qc3qTNKTxU/ORWjhdt0OO6gLxXF4+NPpt5P6iDdpgo73\nAcS9tMFhOquvU8OT1E5Uiqc2/aB3w0eXurFLlOp/dRM3qdE0mElUW8cA99FcQ2zx\nyXx6tVhQTWWbzJXx6JXYtz2p6oDbUULPHe5bZK5W3NCDeKzcnR7IXGAZbKAwVJst\n35h/AoRnbliB4gvfKW8q/jAjtLYgm671hxdD7DoPLkvg/NEsxRLaxNIj3+iC+N6L\nSUu8canLgUn+/0r6/9pLfz0IX9cz7jg19v4qG1762kFCJSeQVTh9FJ/txiKm3F71\n4ReOjXC3AgMBAAECggEADEsW0q7q2+FKqPcal/OXZIs9s+qIG7xF2+nSoqeWuQPR\nqVT6g+gJz5Amzf/ylZG35ELgMi58wVBCDJH/lWZEHN/HsagT6XD6vUScA/wsFw0s\nJddQy4EVJoK6Q4muToYghZSruozQQqOZbTvm/0b+SZKRItpdVrdAomaDqnics5CU\n6tkj7kWwy3aUXhdQ8HICD6WWLKMIbKPpY5vd01QD4jbKZURm5vQ1v5CS9zkvp2R2\nB8ycfTWu5FW0NWcJuDFdc9j1lCtjWn6zpfWvjlVcpXhoBlZYJf6ed4o/AvoFGc7M\nM2K33qO6MumWBg+9eEfhTPwupgk70JZImkjFZ55i+QKBgQD9Y8FrlRLooq0OP53p\n6pZXsARtbeX11UtwIyXcJCY3t+RK49igx7A4CIeavwxbijEBZSHL7vyQ6OGzvC02\na/ldWkhmYwIYf9X6r9F/ppXJZ2bUHPe1frxDUc3ZlWGLftldvR2fwl+jpHNcVsWR\niyyK7sCzNFO8g1VhbctwmEw9TwKBgQDbMPeZ8ZqZrTKzSzfcFvI73WREAEVGG7pV\n/Re8ngRNopElbmox88pgIjMgP2LoWjno75a8tkx6cW9EV70nv8pR+cm0ghnbDOMc\n5F9SwPfDYT0i7yMFqHgWow7dR/lcgWtwQs68Ge40jgPVz9lcu0SgZe55RfMvT6zS\n9Ti6ephMGQKBgQCl+5yODn7uaPGXrdCRlBuboS+lRyImIOxjroJ0bDGkug8Ph6U1\n3NjwO5YophFAPYvQcCDtZ8WGXybKB/BN//i/UA6xExYiWksfBeDkD4l6/wL622bg\nOv6z0nhXmWTmbdeRcfpf1oGzvlvbFvQgXNx2veL5AMQBbr6VLcjgHsOCPQKBgQCq\naGRnC529EhkTqUvRUQmcHx/fejJhMhdo2K6GlncUAGpFppTrJvTUTmJfFMiJifPx\ns6sGJdhJbT0q7eeCKqpZlxAIxQji8x7yjF3LkXhOLqAAM9iPgo1yU+yvflBQadGk\nYlwlgyddNnem18POQ000QmrnX8mTo6biD4G+AKe8qQKBgQCTN/bY+K6+hivqNg3/\ntSOx1qW6LJC4W0FhZGWHVws9NfKcqqg5WOZWwKWKos5yD0YNvONVNl7l1WZv2znP\nA3sgJX1DrHCETs8jMW/oigNYGarMdbAr4UcbEdTwwA3ouUz9PqLsS9oIBp0J6fQj\n/6NRC3G56ZqGvk1Gt0S2J9/xFA==\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-szg8y@dino-food-f52c4.iam.gserviceaccount.com',
    client_id: '107582065220221982340',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-szg8y%40dino-food-f52c4.iam.gserviceaccount.com'
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
