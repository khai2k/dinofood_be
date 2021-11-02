$(document).ready(function() {
  /**
   * Update input small help text
   * @return {Void}
   */
  function updateHelpText(selector, number) {
    $(selector).html([
      'Bằng số: ',
      helpers.formatMoney(number),
      ' vnđ',
      '<br>',
      'Bằng chữ: ',
      helpers.readNumber(number)
    ].join(''))
  }

  $('[name="balance"]').on('change', function(e) {
    updateHelpText('#balance-help', $(this).val())
  })

  /**
   * On load
   */
  updateHelpText('#balance-help', $('[name="balance"]').val())

  /**
   * iCheck for checkbox
   */
  $('input[type="checkbox"]').iCheck({
    checkboxClass: 'icheckbox_minimal-blue',
    radioClass: 'iradio_minimal-blue'
  })

  $('input[type="checkbox"]').on('ifChecked', function() {
    $('label[for="isActive-check"]').text('Active')
    $('label[for="isActive-check"]').attr('class', 'label label-success')
  })
  $('input[type="checkbox"]').on('ifUnchecked', function() {
    $('label[for="isActive-check"]').text('Inactive')
    $('label[for="isActive-check"]').attr('class', 'label label-warning')
  })
})
