module.exports = {
    port: 1338,

    datastores: {
        default: {
            adapter: 'sails-mongo',
            url: 'mongodb://admin:admin@localhost:27017/movies?authSource=admin'
        }
    },

    jwt: {
        key: '3cybr9 |783byc489r7yb3478bcr#*&TB@*$BT@24y284byr28',
        expires: '12h',
    },

    models: {
        migrate: 'alter',
    },

    security: {
        cors: {
            allRoutes: true,
            allowOrigins: '*',
            allowCredentials: false,
            allowRequestHeaders: 'Content-type, Authorization',
        },
    },
};