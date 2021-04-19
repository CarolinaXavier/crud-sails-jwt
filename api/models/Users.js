/**
 * Usuario.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const bcrypt = require('bcrypt')
const isEncrypted = /\$2[ayb]\$10\$[A-Za-z0-9./]{53}/
module.exports = {
    REVOKED_TOKEN: 'REVOKED_TOKEN',
    ATIVO: 'ativo',
    INATIVO: 'inativo',
    attributes: {
        name: { type: 'string', required: true },
        email: { type: 'string', required: true, unique: true },
        status: { type: 'string', isIn: ['ativo', 'inativo'] },
        administrator: { type: 'boolean' },
        password: { type: 'string' },
        lastLogin: { type: 'string', columnType: 'datetime' },
        token: { type: 'string' },
        recoveryPass: { type: 'string' }
    },

    customToJSON: function() {
        return _.omit(this, ['password', 'token'])
    },

    beforeUpdate: async function(inputs, cb) {
        if (inputs.password) {
            if (!isEncrypted.test(inputs.password)) {
                delete inputs.password
            }
        }
        cb()
    }
};