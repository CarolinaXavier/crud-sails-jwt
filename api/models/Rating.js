/**
 * Rating.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Movies = require("./Movies");

module.exports = {

    attributes: {

        punctuation: { type: 'number', required: true },
        // associations
        user: { model: 'users' },
        movies: { model: 'movies' }
    },

    afterCreate: function(createdRecord, cb) {
        Movies.average_rating(createdRecord.movies, createdRecord.punctuation);
        cb();
    }
};