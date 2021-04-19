module.exports = function unauthorized(optionalData) {
  let res = this.res
  const statusCodeToSet = 401

  if (optionalData === undefined) {
    sails.log.info('Ran custom response: res.unauthorized()')
    return res.sendStatus(statusCodeToSet)
  } else if (_.isError(optionalData)) {
    sails.log.info('Custom response `res.unauthorized()` called with an Error:', optionalData)

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
