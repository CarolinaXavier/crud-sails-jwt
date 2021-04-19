const fetch = require('node-fetch')

var URL_ENV = {
  development: 'https://wizebin-api-dev.herokuapp.com'
}

module.exports = {
  send: async function(contaEmpresa, responsavel) {

    const body = { contaEmpresa, responsavel }

    const headers = { 'Content-Type': 'application/json' }

    const response = await fetch(`${URL_ENV[sails.config.environment]}/wizesystems/incluir-empresa`, {	method: 'POST', body: JSON.stringify(body), headers})
    if(!response.ok) {
      throw new Error(response)
    }

  }
}
