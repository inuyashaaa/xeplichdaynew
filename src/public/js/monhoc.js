(function (cbFn) {
  cbFn(window.jQuery, window)
})(function cbFn ($, window) {
  $(pageEditMonhocReady)

  function pageEditMonhocReady () {
    $('select').formSelect()
  }
})
