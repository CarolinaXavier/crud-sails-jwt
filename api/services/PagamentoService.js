// const fetch = require('node-fetch')
// const {stringify, parse} = require('querystring')
// const xml2js = require('xml2js')
// const XML2JS_OPTIONS = {trim: true, explicitArray: false, ignoreAttrs: true}
//
// const headers = {
//   Accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1',
//   'Content-Type': 'application/json;charset=ISO-8859-1'
// }
//
// const {config: {pagseguro: {url, urlWS, email, token}}} = sails
// const queryString = stringify({email, token})
//
// const dayLength = 24*60*60*1000
//
// module.exports = {
//   generatePurchaseUrl: code => `${url}/pre-approvals/request.html?${stringify({code})}`,
//   requestPreApproval: async function(contaempresa, planoPagto) {
//     const empresa = contaempresa.razaoSocial.normalize('NFD').replace(/\W+/g, '')
//     const plano = planoPagto.nome.normalize('NFD').replace(/\W+/g, '')
//     const body = {
//       reference: stringify({contaempresa: contaempresa.id, plano: planoPagto.id}), // dados da empresa em application/x-www-form-urlencoded
//       preApproval: {
//         name: `${empresa}-${plano}`,
//         charge: 'AUTO',
//         period: 'MONTHLY',
//         amountPerPayment: planoPagto.precoUnitMensalServ.toFixed(2), // mensalidade
//         membershipFee: planoPagto.setupFee.toFixed(2), // taxa de adesão
//         trialPeriodDuration: 30, // gratis por 30 dias
//         expiration: { value: 12, unit: 'MONTHS' }
//       }
//     }
//     const response = await fetch(`${urlWS}/pre-approvals/request?${queryString}`, {method: 'POST', body: JSON.stringify(body), headers})
//     if (!response.ok) {
//       throw new Error(response)
//     }
//     const data = await response.json()
//     return data.code
//   },
//
//   genSession: async function() {
//     const response = await fetch(`${urlWS}/sessions?${queryString}`, {method: 'POST'})
//     if (!response.ok) {
//       throw new Error(response)
//     }
//     const data = await xml2js.parseStringPromise(await response.text(), XML2JS_OPTIONS)
//     return data.session.id
//   },
//
//   paymentNotification: function (notification) {
//     switch (notification.notificationType) {
//       case 'transaction': return PagamentoService.transactionNotification(notification.notificationCode)
//       case 'preApproval': return PagamentoService.preApprovalNotification(notification.notificationCode) // TODO
//     }
//   },
//
//   transactionNotification: async function (code) {
//     const response = await fetch(`${urlWS}/v3/transactions/notifications/${code}?${queryString}`, {headers: {'Content-Type': 'application/json;charset=ISO-8859-1'}})
//     if (!response.ok) {
//       throw new Error(response)
//     }
//     const {transaction} = await xml2js.parseStringPromise(await response.text(), XML2JS_OPTIONS)
//     let {date, lastEventDate, reference, grossAmount} = transaction
//     let {contaempresa: contaEmpresa} = parse(reference)
//     const empresa = await ContaEmpresa.findOne({id: contaEmpresa})
//     let [contaReceber] = empresa && await ContaReceber.find({contaEmpresa, status: [ContaReceber.STATUS_INCLUIDO, ContaReceber.STATUS_EM_ATRASO]}).sort('createdAt DESC').limit(1)
//     if (!empresa || empresa.status===ContaEmpresa.STATUS_ENCERRADA || !contaReceber) {
//       // TODO not a single payment needed to be paid... refund value
//     }
//     if (contaReceber.vlRecebPrev>Number(grossAmount)) {
//       await LogRetornoGateway.create({contaReceber: contaReceber.id, dtInclusao: new Date(), tipo: LogRetornoGateway.PAGAMENTO_VALOR_MENOR})
//       return
//     }
//     let newStatus
//     if (empresa.status===ContaEmpresa.STATUS_INCLUIDA) {
//       newStatus = ContaEmpresa.STATUS_PAGAMENTO_SEM_ACESSO
//     }
//     else if (empresa.status===ContaEmpresa.STATUS_INCLUIDA_POR_30DIAS) {
//       newStatus = ContaEmpresa.STATUS_ATIVA
//     }
//     else if (empresa.status===ContaEmpresa.STATUS_INATIVA) {
//       const [history] = await HistStatusConta.find({contaEmpresa: empresa.id}).sort('dtInclusao DESC').limit(1).skip(1)
//       if (history) {
//         if (history.status===ContaEmpresa.STATUS_INATIVA || history.status===ContaEmpresa.STATUS_PAGAMENTO_SEM_ACESSO) {
//           newStatus = ContaEmpresa.STATUS_PAGAMENTO_SEM_ACESSO
//         } else if (history.status===ContaEmpresa.STATUS_ATIVA || history.status===ContaEmpresa.STATUS_INCLUIDA_POR_30DIAS) {
//           newStatus = ContaEmpresa.STATUS_ATIVA
//         }
//       }
//     }
//     if (newStatus) {
//       await ContaEmpresa.updateOne({id: empresa.id}).set({status: newStatus})
//       await HistStatusConta.create({contaEmpresa: empresa.id, status: empresa.status})
//     }
//     await ContaReceber.update({id: contaReceber.id}).set({vlRecebRealiz: Number(grossAmount), dtRecebRealiz: new Date(lastEventDate || date), status: ContaReceber.STATUS_PAGO})
//     return transaction
//   },
//
//   preApprovalNotification: function (code) {
//     // TODO
//     // URL = `${urlWS}/v3/pre-approvals/notifications/${code}?${queryString}`
//     return Promise.resolve(code)
//   },
//
//   generateContas: async function() {
//     const now = new Date()
//     const dtInclusao = now.setHours(0, 0, 0, 0)
//     const day = new Date(now+15*dayLength).getDate() // 15 days after
//     const dtVenc = new Date(now+30*dayLength).setHours(0, 0, 0, 0) // 30 days after
//     const db = ContaEmpresa.getDatastore().manager
//     const ContaEmpresaRaw = db.collection(ContaEmpresa.tableName)
//     const contaEmpresas = await ContaEmpresaRaw.find({$where: function() {return new Date(this.dtInclusao).getDate()===day}}).toArray()
//     const contasToCreate = []
//     for (const contaEmpresa of contaEmpresas) {
//       const plano = await PlanoPagto.findOne({id: contaEmpresa.planoPagtoAtual})
//       contasToCreate.push({status: 1, vlRecebPrev: plano.precoUnitMensalServ, dtVenc, contaEmpresa: contaEmpresa.id, dtInclusao, mesAnoRef: `${now.getFullYear()}/${now.getMonth()+1}`})
//     }
//     return (await ContaReceber.createEach(contasToCreate).fetch()).map(({id})=>id)
//   },
//
//   atualizarStatusContasAtrasadas: function() {
//     return ContaReceber.update({status: ContaReceber.STATUS_INCLUIDO, dtVenc: {$lt: new Date()}}).set({status: ContaReceber.STATUS_EM_ATRASO})
//   },
//
//   notificarAtrasos: async function() {
//     const now = new Date()
//     const status = [ContaReceber.STATUS_INCLUIDO, ContaReceber.STATUS_EM_ATRASO]
//     const day2 = new Date(now-2*dayLength).setHours(0, 0, 0, 0)
//     const day4 = new Date(now-4*dayLength).setHours(0, 0, 0, 0)
//     const due = [
//       ...(await ContaReceber.find({status, dtVenc: {'>=': day2, '<': new Date(day2+dayLength)}}).populate('contaEmpresa')),
//       ...(await ContaReceber.find({status, dtVenc: {'>=': day4, '<': new Date(day4+dayLength)}}).populate('contaEmpresa'))
//     ]
//     for (const contaReceber of due) {
//       const emails = contaReceber.contaEmpresa.emails
//       EmailService.send('contaAtrasada', {contaReceber}, {to: emails, subject: 'Pagamento atrasado'}) // ignoring the email promise result
//     }
//     return due
//   },
//
//   notificarUltimoAviso: async function() {
//     const now = new Date()
//     const status = [ContaReceber.STATUS_INCLUIDO, ContaReceber.STATUS_EM_ATRASO]
//     const day6 = new Date(now-6*dayLength).setHours(0, 0, 0, 0)
//     const finalWarning = await ContaReceber.find({status, dtVenc: {'>=': day6, '<': new Date(day6+dayLength)}}).populate('contaEmpresa')
//     for (const contaReceber of finalWarning) {
//       const emails = contaReceber.contaEmpresa.emails
//       EmailService.send('avisoSuspensao', {contaReceber}, {to: emails, subject: 'Aviso de suspensão'}) // ignoreing the email promise result
//     }
//     return finalWarning
//   },
//
//   suspenderContas: async function() {
//     const day = new Date(new Date().setHours(0, 0, 0, 0)-7*dayLength)
//     const contaRecebers = await ContaReceber.find({
//       status: [ContaReceber.STATUS_INCLUIDO, ContaReceber.STATUS_EM_ATRASO],
//       dtVenc: {$lte: day}
//     }).populate('contaEmpresa')
//     if (!contaRecebers || !contaRecebers.length) {
//       return
//     }
//     // Add status change to history
//     await HistStatusConta.createEach(contaRecebers.map(({contaEmpresa: {id, status}})=>({contaEmpresa: id, status})))
//
//     const empresasInactivated = contaRecebers.map(({contaEmpresa: {id}})=>id)
//     await ContaEmpresa.update({id: empresasInactivated}).set({status: ContaEmpresa.STATUS_INATIVA})
//     return empresasInactivated
//   }
// }
