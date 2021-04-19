let actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
	shouldDelete: function (toBeDeleted) {
		let self = this;
		let Model = actionUtil.parseModel(toBeDeleted);
		
		sails.log('>>>>>> model', Model);
		let idValor = actionUtil.requirePk(toBeDeleted);
		let modelIdentity = Model.adapter.identity;
		let filtered = [];

		Object.keys(sails.models).forEach(model => {
			filtered.push(this.countAssociations(model, modelIdentity, idValor));
		});

		return new Promise((resolve, reject) => {
			Promise.all(filtered).then(result => {
				result = result.filter(modelo => !!modelo.count);
				if (!result.length) resolve({ ok: true });
				else self.findAssociations(result).then(found => resolve({ ok: false, body: found }));
			}).catch(erro => reject(erro));
		});
	},

	countAssociations: function (model, identity, idValor) {
		let alias = [];
		let theQuery = { or: [] };
		let associationPromise = sails.models[model].associations.reduce((ass, attribute) => {
			let query = {};
			if (attribute.model === identity) {
				query[attribute.alias] = idValor;
				theQuery.or.push(query);
				alias.push(attribute.alias);
				return ass.concat(sails.models[model].count(query));
			} else if (attribute.collection === identity) {
				query[attribute.alias] = [idValor];
				theQuery.or.push(query);
				alias.push(attribute.alias);
				return ass.concat(sails.models[model].count(query));
			} else return ass;
		}, []);

		return new Promise((resolve, reject) => {
			Promise.all(associationPromise).then(result => {
				result = result.reduce((sum, elem) => sum + elem, 0);
				resolve({
					model: model, count: result, query: {
						where: theQuery,
						select: ['seq']
					}
				});
			}).catch(erro => reject(erro));
		});
	},

	findAssociations: function (countResult) {
		let self = this;
		let quantidade = countResult.reduce((sum, ref) => sum + ref.count, 0);
		return new Promise((resolve, reject) => {
			if (quantidade <= 3) {
				let promises = [];
				countResult.forEach(result => promises.push(sails.models[result.model].find(result.query)));
				Promise.all(promises)
					.then(found => resolve(self.montaResposta(found, countResult)))
					.catch(erro => reject(erro));
			} else {
				resolve(`Existem ${quantidade} registros associados a este item!`);
			}
		});
	},

	montaResposta: function (allFound, countResult) {
		let resposta = 'Os seguintes registros estão associados a este item:';
		countResult.forEach((result, index) => {
			let seqs = allFound[index].reduce((seqs, elemento) => seqs.concat(elemento.seq), []).join(', ');
			resposta = resposta.concat(`<br>${sails.models[result.model].ALIAS}: ${seqs}`);
		});
		return resposta;
	}
}
