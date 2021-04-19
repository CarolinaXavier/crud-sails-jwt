module.exports = {
  send: function (template, variables, options) {
    return sails.hooks.email.send(template, variables, options)
  }
}
