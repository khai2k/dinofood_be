$(document).ready(function() {
  const helpers = window.helpers
  const service = {
    updateStatus: ({ _id, status }) => axios.put(`/admin/payment-requests/${_id}`, { status }, {
      withCredentials: true
    }),
    delete: ({ _id }) => axios.delete(`/admin/payment-requests/${_id}`, {
      withCredentials: true
    })
  }

  $('input[name="amount"').on('change', function(e) {
    const value = $(this).val()
    helpers.moneyHelpText('#amount-help', value)
  })

  /**
   * Click approve
   */
  $('.btn-approve').on('click', function(e) {
    const _id = $(this).attr('data-id')
    $(`button[data-id="${_id}"]`).attr('disabled', 'disabled')

    service
      .updateStatus({ _id, status: 'approved' })
      .then(response => {
        // update label
        $(`label[data-id="${_id}"]`).attr('class', 'label label-success')
        $(`label[data-id="${_id}"]`).text('Approved')

        // remove all button
        $(`button[data-id="${_id}"]`).remove()

        toastr.success(response.data.message, 'Payment request')
      })
      .catch(({ response }) => {
        $(`button[data-id="${_id}"]`).removeAttr('disabled')
        toastr.error(response.data.message, 'Payment request')
      })
  })

  /**
   * Click reject
   */
  $('.btn-reject').on('click', function(e) {
    const _id = $(this).attr('data-id')
    $(`button[data-id="${_id}"]`).attr('disabled', 'disabled')

    service
      .updateStatus({ _id, status: 'rejected' })
      .then(response => {
        // update label
        $(`label[data-id="${_id}"]`).attr('class', 'label label-danger')
        $(`label[data-id="${_id}"]`).text('Rejected')

        // remove reject|approve button
        $(`button[data-id="${_id}"].btn-reject`).remove()
        $(`button[data-id="${_id}"].btn-approve`).remove()

        // show delete button
        $(`button[data-id="${_id}"].btn-delete`).removeClass('hidden')

        $(`button[data-id="${_id}"]`).removeAttr('disabled')
        toastr.success(response.data.message, 'Payment request')
      })
      .catch(({ response }) => {
        $(`button[data-id="${_id}"]`).removeAttr('disabled')
        toastr.error(response.data.message, 'Payment request')
      })
  })

  /**
   * Click delete
   */
  $('.btn-delete').on('click', function(e) {
    const _id = $(this).attr('data-id')
    $(`button[data-id="${_id}"]`).attr('disabled', 'disabled')

    service
      .delete({ _id })
      .then(response => {
        $(this).closest('tr').remove()
        toastr.success(response.data.message, 'Payment request')
      })
      .catch(({ response }) => {
        $(`button[data-id="${_id}"]`).removeAttr('disabled')
        toastr.error(response.data.message, 'Payment request')
      })
  })
})
