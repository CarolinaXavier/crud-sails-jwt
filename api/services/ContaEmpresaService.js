module.exports = {
  generateCodigo: async function(length=6) {
    var hash    = HashService.md5(new Date())
    var codigo  = ''

    for (var i = 0; i < length; i++) {
      codigo += hash[Util.randRange(0, length - 1)]
    }

    return codigo.toUpperCase()
  }
}
