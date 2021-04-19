module.exports = function forbidden(optionalData) {
  let res = this.res
  const statusCodeToSet = 403

  if (optionalData === undefined) {
    sails.log.info('Ran custom response: res.forbidden()')
    return res.sendStatus(statusCodeToSet)
  } else if (_.isError(optionalData)) {
    sails.log.info('Custom response `res.forbidden()` called with an Error:', optionalData)

    if (!_.isFunction(optionalData.toJSON)) {
      if (process.env.NODE_ENV === 'production') {
        return res.sendStatus(statusCodeToSet)
      } else {
        return res.status(statusCodeToSet).send(optionalData.stack)
      }
    }
  } else {
    return res.status(statusCodeToSet).send(optionalData)
  }
}
