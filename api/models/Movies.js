/**
 * Filme.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    ATIVO: 'ativo',
    INATIVO: 'inativo',
    attributes: {
        title: { type: 'string', required: true },
        description: { type: 'string' },
        year: { type: 'string' },
        duration_hour: { type: 'string' },
        duration_minutes: { type: 'string' },
        classification: { type: 'string' },
        image_link: { type: 'string' },
        movie_link: { type: 'string' },
        images: { type: 'json', columnType: 'array' },
        movies: { type: 'json', columnType: 'array' },
        average_rating: { type: 'number' },
        gender: { type: 'string' },
        writing_credits: { type: 'json', columnType: 'string' },
        director: { type: 'json', columnType: 'array' },
        stars: { type: 'json', columnType: 'array' },
        tags: { type: 'string' },
        status: { type: 'string', isIn: ['ativo', 'inativo'] }
    },

    average_rating: async function(movies, punctuation) {
        let mov = await Movies.findOne(movies);
        let punctuation_finished = 0;
        if (mov.rating != null) {
            punctuation_finished = (mov.punctuation + punctuation) / 4;
            mov.average_rating = punctuation_finished;

        } else {
            mov.average_rating = punctuation;
        }
        Movies.update(movies, mov).then(function(updatedResult) {
                return updatedResult;
            })
            .catch(function(erro) {
                console.log(erro);
                return false;
            });
    }
};