
$(function() {
  const _service = {
    getMigrate: () => axios.get('/admin/migrate', {
      withCredentials: true
    }),
    submitMigrate: payload => axios.post('/admin/migrate', payload, {
      withCredentials: true
    }),
    backupDatabase: payload => axios.patch('/admin/db/backup', payload, {
      withCredentials: true
    })
  }

  $('.btn-db-backup').on('click', event => {
    event.preventDefault()
    $('button').attr('disabled', 'disabled')

    _service
      .backupDatabase()
      .then(({ data }) => {
        $('button').removeAttr('disabled')
        toastr.success(data.message, 'Database backup')
      })
      .catch(({ response }) => {
        $('button').removeAttr('disabled')
        toastr.error(response.data.message, 'Database backup')
      })
  })

  $('.btn-migrate').on('click', event => {
    event.preventDefault()
    $('#migrate-modal').find('input[name="version"]').val('')
    $('#migrate-modal').modal('show')
  })

  $('.btn-migrate-info').on('click', event => {
    event.preventDefault()
    $('button').attr('disabled', 'disabled')

    _service
      .getMigrate()
      .then(({ data }) => {
        console.log(data)
        $('button').removeAttr('disabled')
        toastr.success('Open devtool for more information.', 'Migration')
      })
      .catch(({ response }) => {
        $('button').removeAttr('disabled')
        toastr.error(response.data.message, 'Migration')
      })
  })

  $('.migration-form').on('submit', event => {
    event.preventDefault()
    $('button').attr('disabled', 'disabled')

    const version = $(event.target).find('input[name="version"]').val()
    _service
      .submitMigrate({ version })
      .then(({ data }) => {
        $('button').removeAttr('disabled')
        $('#migrate-modal').modal('hide')
        toastr.success(data.message, 'Migration')
      })
      .catch(({ response }) => {
        $('button').removeAttr('disabled')
        toastr.error(response.data.message, 'Migration')
      })
  })
})
