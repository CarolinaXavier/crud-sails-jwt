/**
 * FilmeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    createMovies: (req, res) => {
        let user = req.session.user;
        if (user.administrator) {
            Movies.create(data).then(function(updatedResult) {
                    return res.status(200).send(updatedResult);
                })
                .catch(function(erro) {
                    return res.status(503).send(erro);
                });
        } else {
            return res.status(200).unauthorized({
                body: 'Somente administrador pode executar esta ação',
            })
        }
    },

    inactive: (req, res) => {
        let idValor = actionUtil.requirePk(req);
        let data = actionUtil.parseValues(req);
        Movies.update(idValor, { status: data })
            .then(function(updatedResult) {
                return res.status(200).send(updatedResult);
            })
            .catch(function(erro) {
                return res.send(erro);
            });
    },

    search: (req, res) => {

    }
};