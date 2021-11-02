const dbBackup = require('@/utils/db-backup')
const { sendAdminNotify } = require('@/module/api/notify/util')

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.view('admin/dashboard')
    },
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Get dashboard',
      plugins: {
        menu: {
          name: 'dashboard',
          title: 'Dashboard',
          icon: 'fa fa-dashboard',
          after: 'cms',
          before: 'manager'
        }
      }
    }
  },
  {
    method: 'PATCH',
    path: '/db/backup',
    handler: (request, h) => {
      // asynchronous
      dbBackup()
        .then(url => {
          sendAdminNotify([
            ':ami_ok: Database backup successfully',
            `:floppy_disk: Location: (<${url}|Open>)`
          ].join('\n'))
        })
        .catch(error => {
          sendAdminNotify([
            ':ami_ok: Database backup error',
            `:interrobang: Message: ${error.message}`,
            `:interrobang: Stack: ${error.stack}`
          ].join('\n'))
        })

      return h
        .response({ message: 'Execute backup successfully!' })
        .takeover()
    },
    options: {
      auth: {
        mode: 'required',
        scope: ['admin']
      },
      description: 'Backup database to storage',
      tags: ['api', 'admin'],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          responses: {
            400: { description: 'Bad Request' }
          }
        }
      }
    }
  }
]
