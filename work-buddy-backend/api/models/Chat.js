/**
 * Chat.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'chats',
    attributes: {
        id: {
            type: 'string',
            required: true,
        },
        senderId: {
            type: 'string',
            required: true,
        },
        receiverId: {
            type: 'string',
            required: true,
        },
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
            type: 'string',
        },
        seen: {
            type: 'boolean',
            required: true,
        },
        createdAt: {
            type: 'ref',
            columnType: 'timestamp',
            autoCreatedAt: true, // Automatically set createdAt timestamp
        },
    },
};
