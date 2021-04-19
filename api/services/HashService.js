const CryptoJS = require('crypto-js')

module.exports = {
  md5: function(input) {
    return CryptoJS.MD5(input.toString()).toString(CryptoJS.enc.Hex)
  },

  sha256: function(input) {
    return CryptoJS.SHA256(input.toString()).toString(CryptoJS.enc.Hex)
  }
}
