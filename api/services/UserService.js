const jwt = require('jsonwebtoken');

module.exports = {
    refreshToken: async(user, setLastLogin) => {
        const userJson = {
            id: user.id,
            status: user.status,
            email: user.email,
            lastLogin: user.lastLogin,
            administrator: user.administrator,
            name: user.name,
        };

        let token = jwt.sign(userJson, sails.config.jwt.key, {
            expiresIn: sails.config.jwt.expires,
        });

        const changeSet = setLastLogin ? {
            lastLogin: new Date().toISOString(),
            token,
        } : { token };

        await Users.updateOne(user.id, changeSet);

        return token;
    },

    verifyToken: (token) => {
        return jwt.verify(token, sails.config.jwt.key);
    },
};