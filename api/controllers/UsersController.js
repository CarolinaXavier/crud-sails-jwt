/**
 * UsuarioController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcrypt');
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
    createUser: async(req, res) => {
        const creatingData = actionUtil.parseValues(req);
        return Users.count({ email: creatingData.email })
            .then(async function(count) {
                if (count > 0) {
                    return res.status(409).send(
                        'Já existe um usuário cadastrado com o e-mail informado!'
                    );
                } else {
                    creatingData.password = await bcrypt.hash(creatingData.password, 10);
                    console.log(creatingData.password);
                    creatingData.status = Users.ATIVO;
                    let user = await Users.create(creatingData).fetch();
                    return res.status(200).send({ user });
                }
            })
            .catch(function(erro) {
                return res.status(409);
            });
    },

    login: async(req, res) => {
        const usuario_login = actionUtil.parseValues(req);
        let usuario = await Users.findOne({
            email: usuario_login.email,
            status: Users.ATIVO,
        })

        if (!usuario) {
            return res.unauthorized({
                body: 'Não há usuário com esse e-mail',
            })
        }
        console.log(bcrypt.compareSync(usuario_login.password, usuario.password));
        if (!bcrypt.compareSync(usuario_login.password, usuario.password)) {
            return res.unauthorized({
                body: 'Credenciais inválidas.',
            })
        }

        let token = await UserService.refreshToken(usuario, true)

        return res.send({
            token,
            usuario,
        })
    },

    inactiveUser: (req, res) => {
        let idValor = actionUtil.requirePk(req);
        let data = actionUtil.parseValues(req);
        Users.update(idValor, { status: data })
            .then(function(updatedResult) {
                return res.status(200).send(updatedResult);
            })
            .catch(function(erro) {
                return res.send(erro);
            });
    }

};