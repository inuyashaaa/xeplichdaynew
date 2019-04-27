(function (cbFn) {
  cbFn(window.jQuery, window)
})(function cbFn ($, window) {
  $(pageTkbMonhocReady)

  function pageTkbMonhocReady () {
    $('select').formSelect()
    var $selectGv = $('#select-gv-tkb')
    var $infoTkb = $('#info-tkb')
    $selectGv.on('change', handleSelectGv)

    function handleSelectGv (event) {
      var href = window.location.href
      var url = href.split('?')[0]
      window.location.href = `${url}?giangvien=${$selectGv.val()}&idtkb=${$infoTkb.data('idtkb')}`
    }
  }
})
