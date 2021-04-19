const jwt = require('jsonwebtoken')

module.exports = async function (req, res, next) {
  if (!req.headers || !req.headers.authorization) {
    return res.badRequest({
      body: 'É necessário que haja autenticação com Bearer Token.',
    })
  }

  if (!/Bearer \w+/g.test(req.headers.authorization)) {
    return res.badRequest({
      body: 'Este Bearer Token possui erros de formatação.',
    })
  }

  const token = req.headers.authorization.replace('Bearer ', '')

  try {
    const userDecoded = jwt.verify(token, sails.config.jwt.key)

    const user = await Usuario.findOne(userDecoded.id)

    if (user.token === Usuario.REVOKED_TOKEN) {
      return res.unauthorized({
        body: 'Este token foi revogado',
      })
    } else if (user.token !== Usuario.REVOKED_TOKEN && user.token !== token) {
      return res.unauthorized({
        body: 'O usuário está usando atualmente outro token',
      })
    }

    let expire = new Date(userDecoded.exp * 1000)

    let diff = expire.getTime() - new Date().getTime()

    const dividerHour = 1000 * 60 * 60
    const anticipationRefreshingInHours = 1

    if (diff / dividerHour < anticipationRefreshingInHours) {
      let refreshedToken = await UserService.refreshToken(user, false)

      res.cookie('token', refreshedToken)
    }

    req.session.user = user.toJSON()
  } catch (e) {
    switch (e.name) {
      case 'TokenExpiredError':
        return res.unauthorized({
          body: 'Seu token expirou, faça login novamente.',
        })
      case 'JsonWebTokenError':
        return res.unauthorized({
          body: 'Ocorreu um erro inesperado na validação deste token.',
          message: e.message,
        })
      case 'NotBeforeError':
        return res.unauthorized({
          body: 'Seu token não está ativo.',
        })
      default:
        return res.unauthorized({
          body: 'Seu token é inválido.',
          message: e.message,
        })
    }
  }

  return next()
}
