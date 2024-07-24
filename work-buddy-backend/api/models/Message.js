/**
 * Message.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        text: {
            type: 'string',
        },
        image: {
            type: 'string',
        },
        call: {
            type: 'boolean',
        },
        video: {
            type: 'boolean',
        },
        seen: {
            type: 'boolean',
            required: true,
        },
        chat: {
            model: 'chat'  // Reference back to the Chat model
        }
    },
};
